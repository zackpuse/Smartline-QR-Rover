/* ==========================================================================
   SMARTLINE QR ROVER - INTERACTIVE SIMULATOR & DASHBOARD LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSimulator();
    initAnalyticsChart();
});

/* ==========================================================================
   1. TAB SWITCHING SYSTEM
   ========================================================================== */
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');

            navItems.forEach(n => n.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

/* ==========================================================================
   2. ADAS CANVASES & SIMULATOR ENGINE
   ========================================================================== */
let simState = {
    mode: 'STOPPED', // RUNNING, PAUSED, STOPPED, AEB_BRAKING
    speed: 0,
    maxSpeed: 2.2,
    obstacleDist: 45,
    qrCommand: 'NONE',
    dtcFault: 'NONE',
    t: 0,
    roverX: 120,
    roverY: 190,
    angle: 0
};

let canvas, ctx;
let animFrameId;

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
    // Speed in cm/s is maxSpeed * 10
    let speedCmS = simState.maxSpeed * 10;
    let ttc = simState.obstacleDist / (speedCmS || 0.1);
    simState.ttc = ttc; // Save for drawing functions

    // 2. Ultrasonic AEB Check (Trigger if TTC < 1.0 second)
    if (ttc < 1.0 && simState.dtcFault !== 'DTC_C0035') {
        simState.mode = 'AEB_BRAKING';
        simState.speed = 0;
        document.getElementById('aeb-alert').style.display = 'flex';
        // Add TTC info to the alert text
        const alertSpan = document.querySelector('#aeb-alert span');
        if(alertSpan) alertSpan.innerText = `AEB EMERGENCY STOP! MASA PELANGGARAN: ${ttc.toFixed(1)}s`;
        document.getElementById('val-ecu').innerText = 'AEB EMERGENCY STOP';
        document.getElementById('val-ecu').className = 'reading-value text-danger';
    } else {
        document.getElementById('aeb-alert').style.display = 'none';
        if (simState.mode === 'AEB_BRAKING') {
            // Auto Resume after obstacle cleared!
            simState.mode = 'RUNNING';
        }
    }

    // 3. Movement logic along circuit path
    if (simState.mode === 'RUNNING') {
        simState.speed = simState.maxSpeed;
        simState.t += simState.speed * (0.015 / 2.2);

        // Oval track parametric path
        const cx = 350, cy = 190, rx = 240, ry = 110;
        simState.roverX = cx + rx * Math.cos(simState.t);
        simState.roverY = cy + ry * Math.sin(simState.t);

        // Angle tangent
        const dx = -rx * Math.sin(simState.t);
        const dy = ry * Math.cos(simState.t);
        simState.angle = Math.atan2(dy, dx);
    } else {
        simState.speed = 0;
    }

    // Update UI Badges
    document.getElementById('speed-badge').innerText = `Speed: ${(simState.speed * 10).toFixed(1)} cm/s`;
    document.getElementById('mode-badge').innerText = `Mode: ${simState.mode}`;
    document.getElementById('val-ultrasonic').innerText = `${simState.obstacleDist.toFixed(1)} cm`;
}

function drawScene() {
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

    // Cancel any pending reset from a previous click so messages
    // never overlap/stack when buttons are pressed in quick succession
    if (qrResetTimeoutId !== null) {
        clearTimeout(qrResetTimeoutId);
        qrResetTimeoutId = null;
    }

    const hudText = document.getElementById('hud-text');
    const valCam = document.getElementById('val-camera');
    const valEcu = document.getElementById('val-ecu');

    if (command === 'START') {
        simState.mode = 'RUNNING';
        hudText.innerText = 'HUSKYLENS DETECTED: QR_START (EXECUTE RUN)';
        valCam.innerText = 'QR_START DETECTED';
        valCam.className = 'reading-value text-green';
        valEcu.innerText = 'MOTORS ACTIVE';
        valEcu.className = 'reading-value text-green';
    } else if (command === 'PAUSE') {
        simState.mode = 'PAUSED';
        hudText.innerText = 'HUSKYLENS DETECTED: QR_PAUSE (TEMPORARY HOLD)';
        valCam.innerText = 'QR_PAUSE DETECTED';
        valCam.className = 'reading-value text-amber';
        valEcu.innerText = 'HOLDING POSITION';
        valEcu.className = 'reading-value text-amber';
    } else if (command === 'STOP') {
        simState.mode = 'STOPPED';
        simState.t = 0;
        hudText.innerText = 'HUSKYLENS DETECTED: QR_STOP (FULL STOP)';
        valCam.innerText = 'QR_STOP DETECTED';
        valCam.className = 'reading-value text-danger';
        valEcu.innerText = 'MOTORS DISABLED';
        valEcu.className = 'reading-value text-danger';
    }

    qrResetTimeoutId = setTimeout(() => {
        simState.qrCommand = 'NONE';
        qrResetTimeoutId = null;
    }, 2500);
};

window.updateObstacle = function(val) {
    simState.obstacleDist = parseFloat(val);
    document.getElementById('dist-display').innerText = `${simState.obstacleDist} cm`;
};

window.updateSpeed = function(val) {
    simState.maxSpeed = parseFloat(val) / 10;
    document.getElementById('speed-display').innerText = `${parseFloat(val).toFixed(1)} cm/s`;
};

window.toggleObstaclePreset = function() {
    if (simState.obstacleDist < 20) {
        updateObstacle(45);
        document.getElementById('obstacleRange').value = 45;
    } else {
        updateObstacle(12);
        document.getElementById('obstacleRange').value = 12;
    }
};

window.injectDTC = function(code) {
    simState.dtcFault = code;
    const titleEl = document.getElementById('dtc-code-title');
    const descEl = document.getElementById('dtc-desc-text');
    const remedyEl = document.getElementById('dtc-remedy-text');

    if (code === 'NONE') {
        titleEl.innerText = 'DTC STATUS: SYSTEM NORMAL';
        titleEl.style.color = '#10B981';
        descEl.innerText = 'Semua sensor beroperasi secara optimum mengikut standard NOSS Level 4.';
        remedyEl.innerText = '';
    } else if (code === 'DTC_C0035') {
        titleEl.innerText = 'DTC C0035: ULTRASONIC SENSOR CIRCUIT OPEN';
        titleEl.style.color = '#EF4444';
        descEl.innerText = 'Kegagalan talian isyarat Trig/Echo sensor ultrasonik. Halangan tidak dikesan.';
        remedyEl.innerText = 'Langkah Diagnostik Pelatih: Gunakan Multimeter untuk semak keterusan talian (Continuity Test) pada pin D9 & D10 Arduino.';
    } else if (code === 'DTC_C0074') {
        titleEl.innerText = 'DTC C0074: HUSKYLENS CAMERA MISALIGNMENT';
        titleEl.style.color = '#EF4444';
        descEl.innerText = 'Lensa kamera AI terkeluar dari paksi optik. Arahan kod QR gagal diimbas.';
        remedyEl.innerText = 'Langkah Diagnostik Pelatih: Laraskan semula sudut kecondongan bracket akrilik HuskyLens (+15 deg) & kalibrasi mod Tag Recognition.';
    } else if (code === 'DTC_C0110') {
        titleEl.innerText = 'DTC C0110: IR LINE ARRAY VOLTAGE LOW';
        titleEl.style.color = '#EF4444';
        descEl.innerText = 'Voltan pembekal IR Line sensor drop di bawah 4.2V. Rover terkeluar dari garisan.';
        remedyEl.innerText = 'Langkah Diagnostik Pelatih: Periksa voltan bateri Li-ion (7.4V) & tukar mod cas jika bekalan kuasa tidak stabil.';
    }
};

/* ==========================================================================
   4. ANALYTICS CHART INITIALIZATION
   ========================================================================== */
function initAnalyticsChart() {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;

    new Chart(ctx, {
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
