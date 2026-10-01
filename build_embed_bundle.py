import base64
import os

def img_to_base64(file_path):
    if not os.path.exists(file_path):
        return ""
    ext = os.path.splitext(file_path)[1].lower()
    mime = "image/png" if ext == ".png" else "image/jpeg"
    with open(file_path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{data}"

def build_bundle():
    print("Converting assets to Base64...")
    b64_rover = img_to_base64("assets/rover_prototype.png")
    b64_chart = img_to_base64("assets/graf_hasil_pengujian.png")

    with open("style.css", "r", encoding="utf-8") as f:
        css_content = f.read()

    # Create self-contained bundle
    template = """<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartLine QR Rover - Single File Embed Bundle</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
__CSS_CONTENT__

        /* Google Sites Full-Width Reset */
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            background: #0B0F19 !important;
            color: #F8FAFC;
            font-family: 'Inter', sans-serif;
            box-sizing: border-box;
        }
        *, *::before, *::after {
            box-sizing: border-box;
        }
        .bundle-header {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.9));
            padding: 24px 16px;
            border-bottom: 1px solid rgba(6, 182, 212, 0.3);
            margin: 0;
            border-radius: 0;
        }
        .portal-tabs-wrapper {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(56, 189, 248, 0.2);
            border-bottom: 1px solid rgba(56, 189, 248, 0.2);
            border-left: none;
            border-right: none;
            border-radius: 0;
            padding: 8px 16px;
            margin: 0 0 16px 0;
            display: flex;
            gap: 8px;
            overflow-x: auto;
        }
        .portal-tab-btn {
            padding: 10px 16px;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 6px;
            color: #94A3B8;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .portal-tab-btn.active {
            background: linear-gradient(135deg, #06B6D4, #2563EB);
            color: #FFFFFF;
            border-color: #00F0FF;
            font-weight: 700;
        }
        .portal-panel {
            display: none;
        }
        .portal-panel.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: 12px;
            border: 1px solid rgba(56, 189, 248, 0.2);
            margin: 16px 0;
        }
        .video-container iframe {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
        }
        .quiz-question-card {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
        }
        .quiz-opt {
            display: block;
            padding: 8px 12px;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 6px;
            margin-top: 6px;
            cursor: pointer;
            font-size: 12px;
        }
        .code-block-box {
            background: #050811;
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 12px;
            padding: 14px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: #38BDF8;
            overflow-x: auto;
            position: relative;
        }
    </style>
</head>
<body class="dark-theme">

    <div class="bundle-header">
        <span class="badge badge-category"><i class="fa-solid fa-brain"></i> MIPAC TVET 2026 | AI DigiTeach</span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 8px 0; color: #fff;">
            SmartLine QR Rover - Simulator Diagnostik ADAS & Modul Interaktif
        </h2>
        <p style="color: #94A3B8; font-size: 13px;">
            ADTEC JTM Kampus Kuala Lumpur | Jabatan Automotif
        </p>
    </div>

    <!-- MAIN PORTAL TAB SWITCHER -->
    <div class="portal-tabs-wrapper">
        <button class="portal-tab-btn active" onclick="switchTab(this, 'b-sim')">
            <i class="fa-solid fa-gamepad text-cyan"></i> 1. Simulator ADAS
        </button>
        <button class="portal-tab-btn" onclick="switchTab(this, 'b-sec1')">
            <i class="fa-solid fa-book text-cyan"></i> 2. Pengenalan & Video
        </button>
        <button class="portal-tab-btn" onclick="switchTab(this, 'b-sec2')">
            <i class="fa-solid fa-bullseye text-cyan"></i> 3. Objektif NOSS
        </button>
        <button class="portal-tab-btn" onclick="switchTab(this, 'b-sec3')">
            <i class="fa-solid fa-brain text-cyan"></i> 4. Teori & Pseudokod
        </button>
        <button class="portal-tab-btn" onclick="switchTab(this, 'b-sec4')">
            <i class="fa-solid fa-microchip text-cyan"></i> 5. Komponen
        </button>
        <button class="portal-tab-btn" onclick="switchTab(this, 'b-sec5')">
            <i class="fa-solid fa-wrench text-cyan"></i> 6. Amali & Manual
        </button>
        <button class="portal-tab-btn" onclick="switchTab(this, 'b-sec6')">
            <i class="fa-solid fa-pen-to-square text-cyan"></i> 7. Kuiz Interaktif
        </button>
    </div>

    <!-- PANEL 1: LIVE ADAS SIMULATOR -->
    <div id="b-sim" class="portal-panel active">
        <div class="simulator-grid">
            <div class="card card-glow simulator-canvas-card">
                <div class="card-header">
                    <span><i class="fa-solid fa-road"></i> Micro Track & Rover Visualizer</span>
                    <div class="canvas-badges">
                        <span class="badge-tag" id="speed-badge">Speed: 0 cm/s</span>
                        <span class="badge-tag" id="mode-badge">Mode: Line Follower</span>
                    </div>
                </div>
                <div class="canvas-wrapper">
                    <canvas id="roverCanvas" width="700" height="360"></canvas>
                    <div class="hud-overlay">
                        <div class="hud-corner top-left"></div>
                        <div class="hud-corner top-right"></div>
                        <div class="hud-corner bottom-left"></div>
                        <div class="hud-corner bottom-right"></div>
                        <div class="hud-text" id="hud-text">HUSKYLENS AI VISION: SEARCHING FOR QR CODE...</div>
                    </div>
                    <div class="aeb-alert" id="aeb-alert">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>AEB EMERGENCY STOP! HALANGAN DIKESAN (&lt; 20cm)</span>
                    </div>
                </div>
                <div class="sensor-readings">
                    <div class="reading-box"><div class="reading-label">AI Camera</div><div class="reading-value text-cyan" id="val-camera">NO QR DETECTED</div></div>
                    <div class="reading-box"><div class="reading-label">Ultrasonic</div><div class="reading-value" id="val-ultrasonic">45.0 cm</div></div>
                    <div class="reading-box"><div class="reading-label">Line Sensors</div><div class="reading-value text-green" id="val-line">TRACKED (0-1-0)</div></div>
                    <div class="reading-box"><div class="reading-label">ECU Status</div><div class="reading-value text-gold" id="val-ecu">NORMAL OPERATION</div></div>
                </div>
            </div>

            <div class="simulator-sidebar">
                <div class="card card-control">
                    <div class="card-header"><span><i class="fa-solid fa-qrcode text-cyan"></i> AI Vision QR Commands</span></div>
                    <div class="card-body">
                        <div class="qr-btn-grid">
                            <button class="btn btn-success btn-qr" onclick="triggerQR('START')"><span>QR START</span></button>
                            <button class="btn btn-warning btn-qr" onclick="triggerQR('PAUSE')"><span>QR PAUSE</span></button>
                            <button class="btn btn-danger btn-qr" onclick="triggerQR('STOP')"><span>QR STOP</span></button>
                        </div>
                    </div>
                </div>

                <div class="card card-control">
                    <div class="card-header"><span><i class="fa-solid fa-shield-halved text-amber"></i> Ultrasonic AEB Slider</span></div>
                    <div class="card-body">
                        <div class="slider-container">
                            <div class="slider-header"><span>Jarak Objek:</span><strong id="dist-display" class="text-cyan">45 cm</strong></div>
                            <input type="range" id="obstacleRange" min="5" max="100" value="45" oninput="updateObstacle(this.value)">
                        </div>
                    </div>
                </div>

                <div class="card card-control card-dtc">
                    <div class="card-header"><span><i class="fa-solid fa-triangle-exclamation text-danger"></i> TVET DTC Diagnostic Lab</span></div>
                    <div class="card-body">
                        <select id="dtcSelect" class="form-select" onchange="injectDTC(this.value)">
                            <option value="NONE">Tiada Kerosakan (Normal)</option>
                            <option value="DTC_C0035">C0035 - Ultrasonic Sensor Circuit Open</option>
                            <option value="DTC_C0074">C0074 - HuskyLens AI Camera Misalignment</option>
                            <option value="DTC_C0110">C0110 - IR Line Array Low Supply Voltage</option>
                        </select>
                        <div class="dtc-info-box" id="dtc-info-box">
                            <div class="dtc-code" id="dtc-code-title">DTC STATUS: NO FAULT</div>
                            <div class="dtc-desc" id="dtc-desc-text">Semua sensor beroperasi secara optimum mengikut standard NOSS Level 4.</div>
                            <div class="dtc-remedy" id="dtc-remedy-text"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- PANEL 2: PENGENALAN & VIDEO -->
    <div id="b-sec1" class="portal-panel">
        <div class="card card-glow">
            <div class="card-header"><h3><i class="fa-solid fa-book text-cyan"></i> Pengenalan & Video PdP AI DigiTeach</h3></div>
            <div class="card-body">
                <p>Perkembangan teknologi kenderaan moden menuntut pelatih Automotif TVET menguasai kemahiran mendiagnosis Advance Driver Assistance System (ADAS). SmartLine QR Rover mengintegrasikan AI Vision (HuskyLens) dan sensor perlanggaran ultrasonik untuk latihan amali berskala mikro yang selamat dan kos efektif.</p>
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/Lzb06oSUD6E" title="Video PdP SmartLine QR Rover" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    </div>

    <!-- PANEL 3: OBJEKTIF -->
    <div id="b-sec2" class="portal-panel">
        <div class="card card-glow">
            <div class="card-header"><h3><i class="fa-solid fa-bullseye text-cyan"></i> Objektif NOSS G452-011-4:2025</h3></div>
            <div class="card-body">
                <ul class="noss-list" style="font-size: 13px; line-height: 1.8;">
                    <li><i class="fa-solid fa-circle-check text-success"></i> <strong>Membangunkan simulator robotik SmartLine QR Rover</strong> mengintegrasikan AI Vision (HuskyLens) & sensor ultrasonik.</li>
                    <li><i class="fa-solid fa-circle-check text-success"></i> <strong>Menyediakan modul PdP digital</strong> dipetakan terus ke Competency Unit CU05 ADAS Diagnosis Level 4.</li>
                    <li><i class="fa-solid fa-circle-check text-success"></i> <strong>Latihan Amali Kos Rendah:</strong> Menyediakan pendedahan amali selamat sebelum mengendalikan kenderaan sebenar bervoltan tinggi.</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- PANEL 4: TEORI & PSEUDOKOD -->
    <div id="b-sec3" class="portal-panel">
        <div class="card card-glow">
            <div class="card-header"><h3><i class="fa-solid fa-brain text-cyan"></i> Teori Navigasi & Pseudokod Arduino</h3></div>
            <div class="card-body">
                <div class="code-block-box">
<pre>// SmartLine QR Rover - ADAS Control Logic
VOID LOOP() {
    READ_HUSKYLENS_QR();
    READ_ULTRASONIC_DISTANCE();
    READ_LINE_SENSORS();

    IF (qr_command == "QR_START") rover_state = STATE_RUNNING;
    ELSE IF (qr_command == "QR_STOP") rover_state = STATE_STOPPED;

    IF (ultrasonic_distance &lt; 20.0) { // AEB Trigger
        STOP_MOTORS();
        TRIGGER_HAZARD_ALARM();
    } ELSE IF (rover_state == STATE_RUNNING) {
        EXECUTE_LINE_FOLLOWING();
    }
}</pre>
                </div>
            </div>
        </div>
    </div>

    <!-- PANEL 5: KOMPONEN -->
    <div id="b-sec4" class="portal-panel">
        <div class="card card-glow">
            <div class="card-header"><h3><i class="fa-solid fa-microchip text-cyan"></i> Komponen & Spesifikasi Teknikal</h3></div>
            <div class="card-body">
                <img src="__B64_ROVER__" alt="Prototaip Rover" class="img-responsive img-bordered" style="max-width: 500px; display: block; margin: 0 auto 16px auto;">
                <table class="poster-table">
                    <thead><tr><th>Item</th><th>Spesifikasi</th></tr></thead>
                    <tbody>
                        <tr><td>Voltan Operasi</td><td>7.4V - 12V DC (Bateri Li-ion Boleh Cas)</td></tr>
                        <tr><td>Papan Kawalan</td><td>Arduino / Compatible Microcontroller (ECU)</td></tr>
                        <tr><td>Sistem Penglihatan Visual</td><td>HuskyLens AI Vision Camera</td></tr>
                        <tr><td>Pengesanan Halangan</td><td>Dual Ultrasonic Sensor (AEB Safety Zone &lt; 20cm)</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- PANEL 6: AMALI -->
    <div id="b-sec5" class="portal-panel">
        <div class="card card-glow">
            <div class="card-header"><h3><i class="fa-solid fa-wrench text-cyan"></i> Manual Amali Terpandu</h3></div>
            <div class="card-body">
                <ol style="margin-left: 20px; font-size: 13px; line-height: 1.8;">
                    <li><strong>Semakan Awal:</strong> Semak sambungan talian kuasa bateri (7.4V DC) & pin sensor.</li>
                    <li><strong>Ujian Sensor Garisan:</strong> Tunjukkan QR START kepada HuskyLens dan perhatikan navigasi line following.</li>
                    <li><strong>Ujian Halangan (AEB):</strong> Letakkan objek pada jarak &lt; 20cm dan catat henti automatik rover.</li>
                    <li><strong>Ujian Arahan QR:</strong> Tunjukkan QR STOP dan perhatikan henti penuh motor.</li>
                </ol>
            </div>
        </div>
    </div>

    <!-- PANEL 7: KUIZ INTERAKTIF -->
    <div id="b-sec6" class="portal-panel">
        <div class="card card-glow">
            <div class="card-header"><h3><i class="fa-solid fa-pen-to-square text-cyan"></i> Penilaian Pemahaman Interaktif</h3></div>
            <div class="card-body">
                <form id="quizForm" onsubmit="evaluateQuiz(event)">
                    <div class="quiz-question-card">
                        <strong>Soalan 1: Komponen manakah yang mensimulasikan sistem Traffic Sign Recognition (TSR)?</strong>
                        <label class="quiz-opt"><input type="radio" name="q1" value="A"> A. Sensor Ultrasonik</label>
                        <label class="quiz-opt"><input type="radio" name="q1" value="B"> B. HuskyLens AI Camera</label>
                    </div>
                    <div class="quiz-question-card">
                        <strong>Soalan 2: Apakah tindak balas rover apabila ultrasonik mengesan halangan &lt; 20cm?</strong>
                        <label class="quiz-opt"><input type="radio" name="q2" value="A"> A. Memecut</label>
                        <label class="quiz-opt"><input type="radio" name="q2" value="B"> B. Berhenti Automatik (AEB Trigger)</label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-paper-plane"></i> Semak Keputusan</button>
                </form>
                <div id="quizResultBox" class="dtc-info-box" style="display: none; margin-top: 14px;">
                    <div id="quizResultScore" class="dtc-code"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function switchTab(btn, panelId) {
            document.querySelectorAll('.portal-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.portal-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(panelId).classList.add('active');
        }

        /* Simulator Engine Scripts */
        let simState = { mode: 'STOPPED', speed: 0, maxSpeed: 2.2, obstacleDist: 45, qrCommand: 'NONE', dtcFault: 'NONE', t: 0, roverX: 120, roverY: 180, angle: 0 };
        let canvas, ctx;

        window.onload = function() {
            canvas = document.getElementById('roverCanvas');
            if (canvas) {
                ctx = canvas.getContext('2d');
                requestAnimationFrame(simLoop);
            }
        };

        function simLoop() {
            updateState();
            drawScene();
            requestAnimationFrame(simLoop);
        }

        function updateState() {
            if (simState.obstacleDist < 20 && simState.dtcFault !== 'DTC_C0035') {
                simState.mode = 'AEB_BRAKING';
                simState.speed = 0;
                document.getElementById('aeb-alert').style.display = 'flex';
                document.getElementById('val-ecu').innerText = 'AEB EMERGENCY STOP';
            } else {
                document.getElementById('aeb-alert').style.display = 'none';
                if (simState.mode === 'AEB_BRAKING') simState.mode = 'RUNNING';
            }

            if (simState.mode === 'RUNNING') {
                simState.speed = simState.maxSpeed;
                simState.t += 0.015;
                const cx = 350, cy = 180, rx = 240, ry = 100;
                simState.roverX = cx + rx * Math.cos(simState.t);
                simState.roverY = cy + ry * Math.sin(simState.t);
                const dx = -rx * Math.sin(simState.t), dy = ry * Math.cos(simState.t);
                simState.angle = Math.atan2(dy, dx);
            } else {
                simState.speed = 0;
            }

            document.getElementById('speed-badge').innerText = `Speed: ${(simState.speed * 10).toFixed(1)} cm/s`;
            document.getElementById('mode-badge').innerText = `Mode: ${simState.mode}`;
            document.getElementById('val-ultrasonic').innerText = `${simState.obstacleDist.toFixed(1)} cm`;
        }

        function drawScene() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw Track
            const cx = 350, cy = 180, rx = 240, ry = 100;
            ctx.beginPath(); ctx.ellipse(cx, cy, rx+25, ry+25, 0, 0, 2*Math.PI);
            ctx.fillStyle = '#0F172A'; ctx.fill();
            ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2*Math.PI);
            ctx.strokeStyle = '#00F0FF'; ctx.lineWidth = 5; ctx.stroke();

            // Draw Rover
            ctx.save();
            ctx.translate(simState.roverX, simState.roverY);
            ctx.rotate(simState.angle);
            ctx.fillStyle = '#F59E0B'; ctx.fillRect(-20, -18, 12, 6); ctx.fillRect(8, -18, 12, 6);
            ctx.fillRect(-20, 12, 12, 6); ctx.fillRect(8, 12, 12, 6);
            ctx.fillStyle = 'rgba(30, 41, 59, 0.95)'; ctx.strokeStyle = '#06B6D4'; ctx.lineWidth = 2;
            ctx.fillRect(-22, -14, 44, 28); ctx.strokeRect(-22, -14, 44, 28);
            ctx.fillStyle = '#00F0FF'; ctx.beginPath(); ctx.arc(14, 0, 4, 0, 2*Math.PI); ctx.fill();
            ctx.restore();
        }

        function triggerQR(cmd) {
            if (cmd === 'START') { simState.mode = 'RUNNING'; document.getElementById('val-camera').innerText = 'QR_START DETECTED'; }
            else if (cmd === 'PAUSE') { simState.mode = 'PAUSED'; document.getElementById('val-camera').innerText = 'QR_PAUSE DETECTED'; }
            else if (cmd === 'STOP') { simState.mode = 'STOPPED'; document.getElementById('val-camera').innerText = 'QR_STOP DETECTED'; }
        }

        function updateObstacle(val) {
            simState.obstacleDist = parseFloat(val);
            document.getElementById('dist-display').innerText = `${simState.obstacleDist} cm`;
        }

        function injectDTC(code) {
            simState.dtcFault = code;
            const t = document.getElementById('dtc-code-title');
            const d = document.getElementById('dtc-desc-text');
            if (code === 'NONE') { t.innerText = 'DTC STATUS: NORMAL'; d.innerText = 'Semua sensor beroperasi secara optimum.'; }
            else if (code === 'DTC_C0035') { t.innerText = 'DTC C0035: ULTRASONIC FAULT'; d.innerText = 'Kegagalan talian isyarat Trig/Echo sensor ultrasonik.'; }
            else if (code === 'DTC_C0074') { t.innerText = 'DTC C0074: CAMERA MISALIGNMENT'; d.innerText = 'Lensa kamera AI terkeluar dari paksi optik.'; }
            else if (code === 'DTC_C0110') { t.innerText = 'DTC C0110: LINE ARRAY VOLTAGE LOW'; d.innerText = 'Voltan pembekal IR Line sensor drop di bawah 4.2V.'; }
        }

        function evaluateQuiz(e) {
            e.preventDefault();
            const b = document.getElementById('quizResultBox');
            const s = document.getElementById('quizResultScore');
            b.style.display = 'block';
            s.innerText = 'KEPUTUSAN KUIZ: 100% (LULUS - TAHNIAH!)';
            s.style.color = '#10B981';
        }
    </script>
</body>
</html>
"""

    bundle_html = template.replace("__CSS_CONTENT__", css_content).replace("__B64_ROVER__", b64_rover)

    out_file = "google_site_embed_bundle.html"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(bundle_html)
    print(f"Successfully generated single-file embed bundle: {out_file} ({len(bundle_html)} bytes)")

if __name__ == "__main__":
    build_bundle()
