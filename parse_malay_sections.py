import re

def parse():
    with open('google_site_raw.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Search for all Malay text strings (words with Malay characters like Pengenalan, Objektif, Teori, Komponen, Amali, Kuiz, Rumusan)
    # Extract string literals in quotes
    strings = re.findall(r'"([^"\n\r]{4,500})"', html)
    
    malay_texts = []
    seen = set()

    for s in strings:
        # Check if contains common Malay words or automotive terms
        if any(w in s.lower() for w in ['pdp', 'rover', 'adas', 'sensor', 'ultrasonik', 'huskylens', 'arduino', 'noss', 'objektif', 'pengenalan', 'teori', 'komponen', 'amali', 'kuiz', 'rumusan', 'modal', 'logik', 'diagnostik', 'kawalan', 'garisan', 'halangan', 'bateri', ' motor', 'seksyen', 'pelatih', 'tvet', 'adtec']):
            clean = s.strip()
            if clean not in seen and not clean.startswith('http'):
                seen.add(clean)
                malay_texts.append(clean)

    print(f"=== FOUND {len(malay_texts)} MALAY / AUTOMOTIVE SITE TEXTS ===")
    
    with open('site_content_parsed.md', 'w', encoding='utf-8') as out:
        out.write("# SMARTLINE QR ROVER - KANDUNGAN LENGKAP GOOGLE SITE\n\n")
        for idx, text in enumerate(malay_texts, 1):
            out.write(f"{idx}. {text}\n\n")

    print("Saved to site_content_parsed.md!")

if __name__ == "__main__":
    parse()
