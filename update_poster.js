const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<!-- TAB 2: DIGITAL POSTER VIEWER (EPROSIDING) -->')) {
        startIdx = i;
    }
    if (lines[i].includes('<!-- TAB 3: HASIL PENGUJIAN & ANALITIK -->')) {
        endIdx = i;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const newPosterSection = `            <!-- ========================================== -->
            <!-- TAB 2: DIGITAL POSTER VIEWER (EPROSIDING) -->
            <!-- ========================================== -->
            <section id="tab-poster" class="tab-panel">
                <div class="panel-header">
                    <div>
                        <h2><i class="fa-solid fa-file-contract text-cyan"></i> Poster Digital eProsiding MIPAC TVET 2026</h2>
                        <p>Format rasmi poster kertas kajian & dokumen prosiding A4 Kategori AI DigiTeach.</p>
                    </div>
                    <div>
                        <a href="Poster_Projek_SmartLine_QR_Rover_MIPACTVET2026.pdf" target="_blank" class="btn btn-primary">
                            <i class="fa-solid fa-download"></i> Buka / Muat Turun PDF
                        </a>
                    </div>
                </div>

                <!-- A4 PRINTABLE POSTER CONTAINER -->
                <div class="poster-paper-container" style="height: 80vh; padding: 0; overflow: hidden; border-radius: 8px; border: 1px solid var(--border-color);">
                    <embed src="Poster_Projek_SmartLine_QR_Rover_MIPACTVET2026.pdf" type="application/pdf" width="100%" height="100%" />
                </div>
            </section>

`;

    const realStart = startIdx - 1;
    const realEnd = endIdx - 2;

    const newLines = [
        ...lines.slice(0, realStart),
        newPosterSection,
        ...lines.slice(realEnd)
    ];

    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    console.log('Successfully updated index.html');
} else {
    console.log(`Could not find indices: start=${startIdx}, end=${endIdx}`);
}
