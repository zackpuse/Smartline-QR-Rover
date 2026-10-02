const translations = {
    "en": {
        "SmartLine QR Rover | Simulator Diagnostik ADAS Automotif MIPAC TVET 2026": "SmartLine QR Rover | Automotive ADAS Diagnostic Simulator MIPAC TVET 2026",
        "Simulator ADAS Interaktif": "Interactive ADAS Simulator",
        "Modul Teori ADAS": "ADAS Theory Module",
        "Poster Digital eProsiding": "Digital Poster eProceeding",
        "Hasil Pengujian & Analitik": "Test Results & Analytics",
        "Penjajaran NOSS G452-011-4": "NOSS G452-011-4 Alignment",
        "Penggunaan & Etika AI": "AI Ethics & Usage",
        "Start with\n                    Sound": "Start with Sound",
        "Continue\n                    Silent": "Continue Silent",
        "Portal Google Site (Self-Hosted)": "Google Site Portal (Self-Hosted)",
        "Kumpulan Innovate TVET": "Innovate TVET Team",
        "Live ADAS Control & Diagnostic Simulator": "Live ADAS Control & Diagnostic Simulator",
        "Simulasikan tindak balas AI Vision (HuskyLens QR Recognition), Sensor Ultrasonik AEB, dan\n                            Diagnostik Kerosakan DTC secara masa nyata.": "Simulate AI Vision (HuskyLens QR) response, AEB Ultrasonic Sensor, and DTC Fault Diagnostics in real-time.",
        "ECU Ready (7.4V DC)": "ECU Ready (7.4V DC)",
        "Micro Track & Rover Visualizer": "Micro Track & Rover Visualizer",
        "Speed:": "Speed:",
        "Mode: Line Follower": "Mode: Line Follower",
        "AI Camera": "AI Camera",
        "NO QR DETECTED": "NO QR DETECTED",
        "Ultrasonic Distance": "Ultrasonic Distance",
        "Line\n                                    Sensors": "Line Sensors",
        "TRACKED (0-1-0)": "TRACKED (0-1-0)",
        "ECU Status": "ECU Status",
        "NORMAL OPERATION": "NORMAL OPERATION",
        "AI Vision QR Commands (TSR)": "AI Vision QR Commands (TSR)",
        "Imbas kod QR di hadapan modul HuskyLens AI untuk mengawal\n                                    pergerakan rover:": "Scan QR code in front of HuskyLens AI module to control rover movement:",
        "Mula Pergerakan": "Start Movement",
        "Henti Sementara": "Pause Movement",
        "Henti Sepenuhnya": "Full Stop",
        "Ultrasonic AEB Obstacle\n                                    Slider": "Ultrasonic AEB Obstacle Slider",
        "Jarak Objek (Distance):": "Object Distance:",
        "Letak / Alih Halangan Serta-merta": "Place / Remove Obstacle Instantly",
        "Kawalan Kelajuan Motor\n                                    (Speed)": "Motor Speed Control",
        "Kelajuan (Speed):": "Speed:",
        "TVET DTC Diagnostic\n                                    Fault Lab": "TVET DTC Diagnostic Fault Lab",
        "Simulasikan Kerosakan Sensor (Fault\n                                    Injection):": "Simulate Sensor Fault (Fault Injection):",
        "Tiada Kerosakan (System Normal - No DTC)": "No Fault (System Normal - No DTC)",
        "Semua sensor beroperasi secara optimum\n                                        mengikut standard NOSS Level 4.": "All sensors operating optimally according to NOSS Level 4 standards.",
        "Modul E-Pembelajaran: Teori ADAS": "E-Learning Module: ADAS Theory",
        "1. Pengenalan & Objektif": "1. Introduction & Objectives",
        "2. Teori Operasi ADAS": "2. ADAS Theory of Operation",
        "3. Diagnostik Komponen Sensor (NOSS CU05)": "3. Sensor Component Diagnostics (NOSS CU05)",
        "4. Keselamatan & Kesihatan Pekerjaan\n                                (OSH)": "4. Occupational Safety & Health (OSH)",
        "5. Amali: Ujian Operasi SmartLine QR\n                                Rover": "5. Practical: SmartLine QR Rover Operation Test",
        "Nota Pelajar:": "Student Notes:",
        "Semakan Awal Sebelum Hidupkan Rover": "Initial Checks Before Powering Rover",
        "Hidupkan Rover dan Uji Sensor Garisan": "Power Rover and Test Line Sensor",
        "Uji Pengesanan Halangan": "Test Obstacle Detection",
        "Uji Kawalan QR Code": "Test QR Code Control",
        "Penutupan dan Refleksi": "Shutdown and Reflection",
        "Soalan Refleksi Pelajar:": "Student Reflection Questions:",
        "6. Kuiz Penilaian Kendiri": "6. Self-Assessment Quiz",
        "Hasil Pengujian & Analitik Pre/Post Test": "Pre/Post Test Results & Analytics",
        "Kadar Keberkesanan Diagnostik DTC": "DTC Diagnostic Effectiveness Rate",
        "Masa Latihan Diagnostik Diperlukan": "Diagnostic Training Time Required",
        "Perbandingan Peratusan Kefahaman Pelatih": "Trainee Comprehension Percentage Comparison",
        "Peningkatan Purata Kefahaman": "Average Comprehension Increase",
        "Penjajaran NOSS G452-011-4": "NOSS G452-011-4 Alignment",
        "Penggunaan & Etika AI": "AI Usage & Ethics",
        "Tugasan / Peranan AI": "AI Roles / Tasks",
        "Alat AI": "AI Tools",
        "Kaedah Semakan & Pengesahan Manusia": "Human Review & Verification Method",
        "Semak Jawapan": "Check Answers",
        "Cuba Semula": "Try Again",
        "Kegagalan talian isyarat Trig/Echo sensor ultrasonik. Halangan tidak dikesan.": "Ultrasonic Trig/Echo signal line failure. Obstacle not detected.",
        "Sila pastikan tiada pintasan litar pada breadboard.": "Please ensure there are no short circuits on the breadboard.",
        "DTC STATUS: C0035 ACTIVE": "DTC STATUS: C0035 ACTIVE",
        "DTC STATUS: C0074 ACTIVE": "DTC STATUS: C0074 ACTIVE",
        "Kamera gagal memproses imej kerana pencahayaan buruk / lens kotor.": "Camera failed to process image due to poor lighting / dirty lens.",
        "Bersihkan lensa HuskyLens dan uji pada tahap Lux yang sesuai.": "Clean HuskyLens lens and test at appropriate Lux levels.",
        "DTC STATUS: C0110 ACTIVE": "DTC STATUS: C0110 ACTIVE",
        "Sensor inframerah gagal membaca garisan kerana kekurangan bekalan kuasa.": "Infrared sensor failed to read line due to insufficient power supply.",
        "Ukur voltan VCC sensor (Target: 3.3V - 5V) menggunakan multimeter.": "Measure sensor VCC voltage (Target: 3.3V - 5V) using a multimeter.",
        "DTC STATUS: NO FAULT": "DTC STATUS: NO FAULT"
    }
};

// Language State
let currentLang = localStorage.getItem('appLang') || 'ms';

// Function to translate the page if English is selected
function applyTranslation() {
    if (currentLang === 'ms') return; // Default language, no need to replace DOM
    
    const enDict = translations['en'];
    
    function walkAndTranslate(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent.trim();
            if (text && enDict[text]) {
                node.textContent = node.textContent.replace(text, enDict[text]);
            } else {
                // Try to handle multiline weird spacings by normalizing spaces
                let normalizedText = text.replace(/\s+/g, ' ');
                for (let key in enDict) {
                    let normalizedKey = key.replace(/\s+/g, ' ');
                    if (normalizedText === normalizedKey) {
                        node.textContent = enDict[key];
                        break;
                    }
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                for (let i = 0; i < node.childNodes.length; i++) {
                    walkAndTranslate(node.childNodes[i]);
                }
            }
        }
    }
    
    walkAndTranslate(document.body);
}

// Observe DOM changes to translate dynamically injected text
const observer = new MutationObserver((mutations) => {
    if (currentLang === 'ms') return;
    let shouldTranslate = false;
    mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
            shouldTranslate = true;
        }
    });
    if (shouldTranslate) {
        // Disconnect to avoid infinite loop when we modify text
        observer.disconnect();
        applyTranslation();
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
});

// Switch Language and Reload Page to apply cleanly
function toggleLanguage() {
    currentLang = (currentLang === 'ms') ? 'en' : 'ms';
    localStorage.setItem('appLang', currentLang);
    location.reload();
}

// Run translation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    applyTranslation();
    if (currentLang === 'en') {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    
    // Add translation toggle button dynamically to header
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        const langBtn = document.createElement('button');
        langBtn.className = 'btn btn-outline btn-sm';
        langBtn.style.marginLeft = '10px';
        langBtn.innerHTML = '<i class="fa-solid fa-language"></i> ' + (currentLang === 'ms' ? 'English' : 'Bahasa Melayu');
        langBtn.onclick = toggleLanguage;
        navActions.appendChild(langBtn);
    }
});
