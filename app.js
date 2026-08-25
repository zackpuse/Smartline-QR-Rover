/* ==========================================================================
   SMARTLINE QR ROVER - INTERACTIVE SIMULATOR & DASHBOARD LOGIC
   ========================================================================== */

const CONFIG = {
    SPEED_FACTOR: 2.2, // Base scale for path parametric movement
    ACCEL_STEP: 1.0,   // cm/s per frame
    BRAKE_STEP: 1.5,   // cm/s per frame
    REACTION_MS: 300,  // ECU reaction time delay in ms before braking
    QR_RESET_MS: 2500  // Reset time for QR commands
};

let simState = {
    mode: 'STOPPED', // RUNNING, PAUSED, STOPPED, AEB_TRIGGERED, AEB_BRAKING
    speedCmS: 0,
    maxSpeedCmS: 22.0,
    obstacleDist: 45,
    qrCommand: 'NONE',
    dtcFault: 'NONE',
    t: 0,
    roverX: 120,
    roverY: 190,
    angle: 0,
    ttc: Infinity,
    aebTriggerTime: 0,
    lastUiUpdate: 0
};

// Cached DOM Elements
const DOM = {};
let canvas, ctx;
let animFrameId;

// Web Audio API
let audioCtx = null;
let motorOsc = null;
let motorGain = null;
let beepOsc = null;
let beepGain = null;

window.closeAudioOverlay = function(event) {
    if (event && event.target && event.target.id !== 'audio-overlay' && !event.target.classList.contains('modal-close-btn') && event.target.tagName !== 'BUTTON') {
        return;
    }
    const overlay = document.getElementById('audio-overlay');
    if (overlay) overlay.style.display = 'none';
};

window.initAudioEngine = function() {
    window.closeAudioOverlay();
    
    try {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Motor Sound
            motorOsc = audioCtx.createOscillator();
            motorOsc.type = 'triangle';
            motorOsc.frequency.value = 50; // idle
            motorGain = audioCtx.createGain();
            motorGain.gain.value = 0; // silent
            
            motorOsc.connect(motorGain);
            motorGain.connect(audioCtx.destination);
            motorOsc.start();
            
            // Beep Sound
            beepOsc = audioCtx.createOscillator();
            beepOsc.type = 'square';
            beepOsc.frequency.value = 800; // high beep
            beepGain = audioCtx.createGain();
            beepGain.gain.value = 0;
            
            beepOsc.connect(beepGain);
            beepGain.connect(audioCtx.destination);
            beepOsc.start();
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (err) {
        console.warn('Audio Context initialization note:', err);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    initTabs();
    initSimulator();
    initAnalyticsChart();
});

function cacheDOM() {
    DOM.aebAlert = document.getElementById('aeb-alert');
    DOM.aebAlertSpan = document.querySelector('#aeb-alert span');
    DOM.valEcu = document.getElementById('val-ecu');
    DOM.speedBadge = document.getElementById('speed-badge');
    DOM.modeBadge = document.getElementById('mode-badge');
    DOM.valUltrasonic = document.getElementById('val-ultrasonic');
    DOM.hudText = document.getElementById('hud-text');
    DOM.valCamera = document.getElementById('val-camera');
    DOM.distDisplay = document.getElementById('dist-display');
    DOM.speedDisplay = document.getElementById('speed-display');
    DOM.obstacleRange = document.getElementById('obstacleRange');
    DOM.dtcTitle = document.getElementById('dtc-code-title');
    DOM.dtcDesc = document.getElementById('dtc-desc-text');
    DOM.dtcRemedy = document.getElementById('dtc-remedy-text');
}

/* ==========================================================================
   1. TAB SWITCHING SYSTEM & HASH ROUTING
   ========================================================================== */
function switchTab(tabName) {
    if (!tabName) return;
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');
    let found = false;

    navItems.forEach(n => {
        if (n.getAttribute('data-tab') === tabName) {
            n.classList.add('active');
            found = true;
        } else {
            n.classList.remove('active');
        }
    });

    tabPanels.forEach(p => {
        if (p.id === `tab-${tabName}`) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });

    if (found && window.location.hash !== `#${tabName}`) {
        try {
            history.replaceState(null, null, `#${tabName}`);
        } catch (e) {}
    }
}

function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Check URL Hash on Load
    if (window.location.hash) {
        const hashTab = window.location.hash.replace('#', '').replace('tab-', '');
        switchTab(hashTab);
    }

    // Listen for Hash Changes
    window.addEventListener('hashchange', () => {
        if (window.location.hash) {
            const hashTab = window.location.hash.replace('#', '').replace('tab-', '');
            switchTab(hashTab);
        }
    });

    // Intercept internal hash links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = anchor.getAttribute('href').replace('#', '').replace('tab-', '');
            if (document.getElementById(`tab-${target}`)) {
                e.preventDefault();
                switchTab(target);
            }
        });
    });
}

/* ==========================================================================
   2. ADAS CANVASES & SIMULATOR ENGINE
   ========================================================================== */
function initSimulator() {
    canvas = document.getElementById('roverCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Start Animation Loop
    requestAnimationFrame(simLoop);
}

function simLoop() {
    updateState();
    drawScene();
    animFrameId = requestAnimationFrame(simLoop);
}

function updateState() {
    // 1. DTC Fault Check
    if (simState.dtcFault === 'DTC_C0035') {
        // Ultrasonic open circuit - sensor locked at max, fail to detect obstacle
    } else if (simState.dtcFault === 'DTC_C0110') {
        // Line sensor voltage low - rover strays from path
    }

    // Calculate Time-To-Collision (TTC)
    // We use maxSpeedCmS as reference for triggering AEB so it doesn't fluctuate during braking
    let ttc = simState.obstacleDist / (simState.maxSpeedCmS || 1.0);
    simState.ttc = ttc; // Save for drawing functions

    // 2. Ultrasonic AEB Check (Trigger if TTC < 1.0 second)
    if (ttc < 1.0 && simState.dtcFault !== 'DTC_C0035') {
        if (simState.mode === 'RUNNING') {
            simState.mode = 'AEB_TRIGGERED';
            simState.aebTriggerTime = Date.now(); // Start reaction timer
        }
    } else {
        if (DOM.aebAlert) DOM.aebAlert.style.display = 'none';
        if (simState.mode === 'AEB_BRAKING' || simState.mode === 'AEB_TRIGGERED') {
            // Auto Resume after obstacle cleared!
            simState.mode = 'RUNNING';
            if (DOM.valEcu) {
                DOM.valEcu.innerText = 'MOTORS ACTIVE';
                DOM.valEcu.className = 'reading-value text-green';
            }
        }
    }

    if (simState.mode === 'AEB_TRIGGERED') {
        if (DOM.aebAlert) DOM.aebAlert.style.display = 'flex';
        if (DOM.aebAlertSpan) DOM.aebAlertSpan.innerText = `AEB DETECTED! (REACTION DELAY...)`;
        if (DOM.valEcu) {
            DOM.valEcu.innerText = 'AEB PREPARING';
            DOM.valEcu.className = 'reading-value text-amber';
        }
        
        // ECU Reaction Time Delay
        if (Date.now() - simState.aebTriggerTime > CONFIG.REACTION_MS) {
            simState.mode = 'AEB_BRAKING';
        }
    } else if (simState.mode === 'AEB_BRAKING') {
        if (DOM.aebAlert) DOM.aebAlert.style.display = 'flex';
        if (DOM.aebAlertSpan) DOM.aebAlertSpan.innerText = `AEB EMERGENCY BRAKING! TTC: ${ttc.toFixed(1)}s`;
        if (DOM.valEcu) {
            DOM.valEcu.innerText = 'AEB EMERGENCY STOP';
            DOM.valEcu.className = 'reading-value text-danger';
        }
    }

    // 3. Movement & Inertia logic along circuit path
    if (simState.mode === 'RUNNING') {
        // Accelerate up to max speed
        if (simState.speedCmS < simState.maxSpeedCmS) {
            simState.speedCmS += CONFIG.ACCEL_STEP;
            if (simState.speedCmS > simState.maxSpeedCmS) simState.speedCmS = simState.maxSpeedCmS;
        }
    } else if (simState.mode === 'AEB_TRIGGERED') {
        // Keep current speed during reaction time (no braking yet)
    } else if (simState.mode === 'AEB_BRAKING') {
        // Apply Braking Force (Inertia deceleration)
        simState.speedCmS -= CONFIG.BRAKE_STEP;
        if (simState.speedCmS < 0) simState.speedCmS = 0;
    } else {
        simState.speedCmS = 0; // PAUSED or STOPPED
    }

    if (simState.speedCmS > 0) {
        // Normalize speed relative to base factor for the parametric equation
        const normalizedSpeed = (simState.speedCmS / 10) * (0.015 / CONFIG.SPEED_FACTOR);
        simState.t += normalizedSpeed;

        // Oval track parametric path
        const cx = 350, cy = 190, rx = 240, ry = 110;
        simState.roverX = cx + rx * Math.cos(simState.t);
        simState.roverY = cy + ry * Math.sin(simState.t);

        // Angle tangent
        const dx = -rx * Math.sin(simState.t);
        const dy = ry * Math.cos(simState.t);
        simState.angle = Math.atan2(dy, dx);
    }

    // Update UI Badges (Throttled to ~10fps for Performance)
    const now = Date.now();
    if (now - simState.lastUiUpdate > 100) {
        if (DOM.speedBadge) DOM.speedBadge.innerText = `Speed: ${simState.speedCmS.toFixed(1)} cm/s`;
        if (DOM.modeBadge) DOM.modeBadge.innerText = `Mode: ${simState.mode}`;
        if (DOM.valUltrasonic) DOM.valUltrasonic.innerText = `${simState.obstacleDist.toFixed(1)} cm`;
        simState.lastUiUpdate = now;
    }

    // Audio Engine Update
    if (audioCtx) {
        // Motor Pitch based on speed
        if (simState.speedCmS > 0) {
            motorOsc.frequency.setTargetAtTime(100 + (simState.speedCmS * 15), audioCtx.currentTime, 0.1);
            motorGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.1);
        } else {
            motorOsc.frequency.setTargetAtTime(50, audioCtx.currentTime, 0.1);
            motorGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        }

        // AEB Beeping
        if (simState.mode === 'AEB_TRIGGERED' || simState.mode === 'AEB_BRAKING') {
            if (now % 200 < 100) {
                beepGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.01);
            } else {
                beepGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
            }
        } else {
            beepGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
        }
    }
}

function drawScene() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid Background
    drawGrid();

    // Track Line
    drawTrack();

    // Obstacle (if close)
    drawObstacle();

    // SmartLine QR Rover
    drawRover();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawTrack() {
    const cx = 350, cy = 190, rx = 240, ry = 110;

    // Track Outer Road
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 30, ry + 30, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Track Inner Road
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 30, ry - 30, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#050811';
    ctx.fill();
    ctx.stroke();

    // Black Guidance Line (Line Following)
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawObstacle() {
    if (simState.ttc < 3.0) { // Show obstacle if TTC < 3s
        // Compute position in front of rover
        const obsX = simState.roverX + (simState.obstacleDist * 2.5) * Math.cos(simState.angle);
        const obsY = simState.roverY + (simState.obstacleDist * 2.5) * Math.sin(simState.angle);

        ctx.save();
        ctx.translate(obsX, obsY);
        ctx.fillStyle = simState.ttc < 1.0 ? '#EF4444' : '#F59E0B';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 15;
        ctx.fillRect(-12, -12, 24, 24);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HALANGAN', 0, 4);
        ctx.restore();
    }
}

function drawRover() {
    ctx.save();
    ctx.translate(simState.roverX, simState.roverY);
    ctx.rotate(simState.angle);

    // AI Vision Cone Projection (HuskyLens)
    const coneGradient = ctx.createRadialGradient(0, 0, 10, 80, 0, 60);
    coneGradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    coneGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(80, -35);
    ctx.lineTo(80, 35);
    ctx.closePath();
    ctx.fillStyle = coneGradient;
    ctx.fill();

    // Ultrasonic Beam
    if (simState.ttc < 3.0) {
        ctx.strokeStyle = simState.ttc < 1.0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(15 + simState.obstacleDist * 2.5, 0);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // 4 Wheels (Yellow DC Gear Motors)
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-22, -22, 14, 8);
    ctx.fillRect(8, -22, 14, 8);
    ctx.fillRect(-22, 14, 14, 8);
    ctx.fillRect(8, 14, 14, 8);

    // Acrylic Chassis Body
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-25, -16, 50, 32, 6);
    ctx.fill();
    ctx.stroke();

    // HuskyLens AI Camera Module on Top Front
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(10, -8, 12, 16);
    ctx.fillStyle = '#00F0FF';
    ctx.beginPath();
    ctx.arc(16, 0, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Dual Ultrasonic Sensors
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(20, -7, 4, 0, 2 * Math.PI);
    ctx.arc(20, 7, 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

/* ==========================================================================
   3. SIMULATOR CONTROLS
   ========================================================================== */
let qrResetTimeoutId = null;

window.triggerQR = function(command) {
    simState.qrCommand = command;

    if (qrResetTimeoutId !== null) {
        clearTimeout(qrResetTimeoutId);
        qrResetTimeoutId = null;
    }

    if (command === 'START') {
        simState.mode = 'RUNNING';
        if (DOM.hudText) DOM.hudText.innerText = 'HUSKYLENS DETECTED: QR_START (EXECUTE RUN)';
        if (DOM.valCamera) {
            DOM.valCamera.innerText = 'QR_START DETECTED';
            DOM.valCamera.className = 'reading-value text-green';
        }
        if (DOM.valEcu) {
            DOM.valEcu.innerText = 'MOTORS ACTIVE';
            DOM.valEcu.className = 'reading-value text-green';
        }
    } else if (command === 'PAUSE') {
        simState.mode = 'PAUSED';
        if (DOM.hudText) DOM.hudText.innerText = 'HUSKYLENS DETECTED: QR_PAUSE (TEMPORARY HOLD)';
        if (DOM.valCamera) {
            DOM.valCamera.innerText = 'QR_PAUSE DETECTED';
            DOM.valCamera.className = 'reading-value text-amber';
        }
        if (DOM.valEcu) {
            DOM.valEcu.innerText = 'HOLDING POSITION';
            DOM.valEcu.className = 'reading-value text-amber';
        }
    } else if (command === 'STOP') {
        simState.mode = 'STOPPED';
        simState.t = 0;
        if (DOM.hudText) DOM.hudText.innerText = 'HUSKYLENS DETECTED: QR_STOP (FULL STOP)';
        if (DOM.valCamera) {
            DOM.valCamera.innerText = 'QR_STOP DETECTED';
            DOM.valCamera.className = 'reading-value text-danger';
        }
        if (DOM.valEcu) {
            DOM.valEcu.innerText = 'MOTORS DISABLED';
            DOM.valEcu.className = 'reading-value text-danger';
        }
    }

    qrResetTimeoutId = setTimeout(() => {
        simState.qrCommand = 'NONE';
        qrResetTimeoutId = null;
    }, CONFIG.QR_RESET_MS);
};

window.updateObstacle = function(val) {
    simState.obstacleDist = parseFloat(val);
    if (DOM.distDisplay) DOM.distDisplay.innerText = `${simState.obstacleDist} cm`;
};

window.updateSpeed = function(val) {
    simState.maxSpeedCmS = parseFloat(val);
    if (DOM.speedDisplay) DOM.speedDisplay.innerText = `${simState.maxSpeedCmS.toFixed(1)} cm/s`;
};

window.toggleObstaclePreset = function() {
    const val = simState.obstacleDist < 20 ? 45 : 12;
    window.updateObstacle(val);
    if (DOM.obstacleRange) DOM.obstacleRange.value = val;
};

window.injectDTC = function(code) {
    simState.dtcFault = code;

    if (!DOM.dtcTitle || !DOM.dtcDesc || !DOM.dtcRemedy) return;

    if (code === 'NONE') {
        DOM.dtcTitle.innerText = 'DTC STATUS: SYSTEM NORMAL';
        DOM.dtcTitle.style.color = '#10B981';
        DOM.dtcDesc.innerText = 'Semua sensor beroperasi secara optimum mengikut standard NOSS Level 4.';
        DOM.dtcRemedy.innerText = '';
    } else if (code === 'DTC_C0035') {
        DOM.dtcTitle.innerText = 'DTC C0035: ULTRASONIC SENSOR CIRCUIT OPEN';
        DOM.dtcTitle.style.color = '#EF4444';
        DOM.dtcDesc.innerText = 'Kegagalan talian isyarat Trig/Echo sensor ultrasonik. Halangan tidak dikesan.';
        DOM.dtcRemedy.innerText = 'Langkah Diagnostik Pelatih: Gunakan Multimeter untuk semak keterusan talian (Continuity Test) pada pin D9 & D10 Arduino.';
    } else if (code === 'DTC_C0074') {
        DOM.dtcTitle.innerText = 'DTC C0074: HUSKYLENS CAMERA MISALIGNMENT';
        DOM.dtcTitle.style.color = '#EF4444';
        DOM.dtcDesc.innerText = 'Lensa kamera AI terkeluar dari paksi optik. Arahan kod QR gagal diimbas.';
        DOM.dtcRemedy.innerText = 'Langkah Diagnostik Pelatih: Laraskan semula sudut kecondongan bracket akrilik HuskyLens (+15 deg) & kalibrasi mod Tag Recognition.';
    } else if (code === 'DTC_C0110') {
        DOM.dtcTitle.innerText = 'DTC C0110: IR LINE ARRAY VOLTAGE LOW';
        DOM.dtcTitle.style.color = '#EF4444';
        DOM.dtcDesc.innerText = 'Voltan pembekal IR Line sensor drop di bawah 4.2V. Rover terkeluar dari garisan.';
        DOM.dtcRemedy.innerText = 'Langkah Diagnostik Pelatih: Periksa voltan bateri Li-ion (7.4V) & tukar mod cas jika bekalan kuasa tidak stabil.';
    }
};

/* ==========================================================================
   4. ANALYTICS CHART INITIALIZATION
   ========================================================================== */
function initAnalyticsChart() {
    const chartCanvas = document.getElementById('analyticsChart');
    if (!chartCanvas) return;

    new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: ['Kefahaman Logik Diagnostik ADAS', 'Pendeduksi Kerosakan Sensor', 'Kemahiran Logik Kawalan'],
            datasets: [
                {
                    label: 'Sebelum (Manual & Video Sahaja)',
                    data: [32, 25, 40],
                    backgroundColor: 'rgba(148, 163, 184, 0.6)',
                    borderColor: '#94A3B8',
                    borderWidth: 1.5,
                    borderRadius: 6
                },
                {
                    label: 'Selepas (SmartLine QR Rover)',
                    data: [89, 92, 88],
                    backgroundColor: 'rgba(6, 182, 212, 0.8)',
                    borderColor: '#00F0FF',
                    borderWidth: 1.5,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#F8FAFC', font: { family: 'Inter', size: 12 } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#94A3B8', callback: v => v + '%' },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' }
                },
                x: {
                    ticks: { color: '#F8FAFC', font: { weight: 'bold' } },
                    grid: { display: false }
                }
            }
        }
    });
}

/* ==========================================================================
   5. QUIZ AND CERTIFICATE GENERATION
   ========================================================================== */
window.semakKuiz = function() {
    const form = document.getElementById('theory-quiz-form');
    if (!form) return;
    
    // Check all questions
    const answers = {
        q1: 'B',
        q2: 'C',
        q3: 'B',
        q4: 'B',
        q5: 'C',
        q6: 'B',
        q7: 'C',
        q8: 'B'
    };
    
    let score = 0;
    let total = Object.keys(answers).length;
    
    for (let key in answers) {
        const selected = form.querySelector(`input[name="${key}"]:checked`);
        if (selected && selected.value === answers[key]) {
            score++;
        }
    }
    
    const percentage = (score / total) * 100;
    
    // Hide form, show result
    form.style.display = 'none';
    const resultContainer = document.getElementById('quiz-result-container');
    const alertBox = document.getElementById('quiz-alert');
    const alertTitle = document.getElementById('quiz-alert-title');
    const scoreText = document.getElementById('quiz-score');
    const alertDesc = document.getElementById('quiz-alert-desc');
    const certForm = document.getElementById('certificate-form-container');
    const failActions = document.getElementById('fail-actions-container');
    const explanations = document.getElementById('quiz-explanations');
    
    resultContainer.style.display = 'flex';
    scoreText.textContent = `${score}/${total}`;
    
    if (percentage >= 75) {
        alertBox.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        alertBox.style.border = '2px solid var(--color-green)';
        alertTitle.textContent = 'TAHNIAH! ANDA LULUS!';
        alertTitle.style.color = 'var(--color-green)';
        alertDesc.textContent = 'Markah anda mencukupi. Sila jana slip keputusan anda di bawah.';
        if (explanations) explanations.style.display = 'block';
        certForm.style.display = 'block';
        failActions.style.display = 'none';
    } else {
        alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        alertBox.style.border = '2px solid var(--color-danger)';
        alertTitle.textContent = 'MAAF, ANDA GAGAL.';
        alertTitle.style.color = 'var(--color-danger)';
        alertDesc.textContent = `Anda memerlukan sekurang-kurangnya 6 markah untuk lulus. Anda mendapat ${score}. Sila baca semula nota di atas.`;
        if (explanations) explanations.style.display = 'none';
        certForm.style.display = 'none';
        failActions.style.display = 'flex';
    }
};

window.resetKuiz = function() {
    const form = document.getElementById('theory-quiz-form');
    const resultContainer = document.getElementById('quiz-result-container');
    form.reset();
    form.style.display = 'flex';
    resultContainer.style.display = 'none';
};

window.janaPDF = function() {
    // Basic validation
    const nameInput = document.getElementById('cert-name');
    const icInput = document.getElementById('cert-ic');
    const programInput = document.getElementById('cert-program');
    const institutionInput = document.getElementById('cert-institution');

    const name = nameInput.value.trim() || 'Tanpa Nama';
    const ic = icInput.value.trim() || '-';
    const program = programInput.value.trim() || '-';
    const institution = institutionInput.value.trim() || '-';
    
    if (!nameInput.value.trim()) {
        alert("Sila masukkan Nama Penuh anda sebelum menjana PDF.");
        return;
    }
    
    // Update hidden template
    document.getElementById('print-name').textContent = name;
    document.getElementById('print-ic').textContent = ic;
    document.getElementById('print-program').textContent = program;
    document.getElementById('print-institution').textContent = institution;
    
    // Set current date
    const dateOpts = { day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('print-date').textContent = new Date().toLocaleDateString('ms-MY', dateOpts);
    
    const scoreText = document.getElementById('quiz-score').textContent;
    document.getElementById('print-score').textContent = scoreText;

    const certTemplate = document.getElementById('certificate-template');
    
    // Show temporarily to render
    certTemplate.parentElement.style.top = '0';
    certTemplate.parentElement.style.left = '0';
    certTemplate.parentElement.style.zIndex = '-100';
    
    const jspdfLib = window.jspdf ? window.jspdf.jsPDF : (window.jsPDF || null);
    const html2canvasLib = window.html2canvas || null;

    if (!html2canvasLib || !jspdfLib) {
        alert("Sijil digital bersedia untuk dicetak. Membuka dialog cetak peranti...");
        window.print();
        certTemplate.parentElement.style.top = '-9999px';
        certTemplate.parentElement.style.left = '-9999px';
        return;
    }
    
    // Use html2canvas and jspdf
    html2canvasLib(certTemplate, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdfLib({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // A4 size: 297mm x 210mm
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        pdf.save(`Slip_Keputusan_ADAS_${name.replace(/\s+/g, '_')}.pdf`);
        
        // Hide again
        certTemplate.parentElement.style.top = '-9999px';
        certTemplate.parentElement.style.left = '-9999px';
    }).catch(err => {
        console.error('PDF Generation Error:', err);
        alert("Gagal menjana PDF secara langsung. Menggunakan cetakan sistem...");
        window.print();
        certTemplate.parentElement.style.top = '-9999px';
        certTemplate.parentElement.style.left = '-9999px';
    });
};

window.scrollToKuiz = function() {
    const quizElem = document.getElementById('quiz-section-container');
    if (quizElem) {
        quizElem.scrollIntoView({ behavior: 'smooth' });
    }
};