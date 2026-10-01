import sys
import io

file_path = 'd:/Mipac Tvet/index.html'

with io.open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<!-- TAB 2: DIGITAL POSTER VIEWER (EPROSIDING) -->' in line:
        start_idx = i
    if '<!-- TAB 3: HASIL PENGUJIAN & ANALITIK -->' in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    new_poster_section = '''            <!-- ========================================== -->
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


'''
    
    real_start = start_idx - 1 
    real_end = end_idx - 2 
    
    new_lines = lines[:real_start] + [new_poster_section] + lines[real_end:]
    
    with io.open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print('Successfully updated index.html')
else:
    print(f'Could not find indices: start={start_idx}, end={end_idx}')
