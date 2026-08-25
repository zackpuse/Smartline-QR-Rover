import html
import re
import urllib.request
import os

def extract():
    with open('google_site_raw.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find JSON arrays containing site content
    # Google sites stores component text inside nested JSON strings in JS
    print("=== RAW HTML LENGTH ===", len(content))

    # Extract all text strings inside quotes that contain Malay/English content
    pattern = r'\"([^\"]{3,200})\"'
    raw_strings = re.findall(pattern, content)
    
    unique_text = []
    seen = set()
    for s in raw_strings:
        s_clean = html.unescape(s).strip()
        # Filter out JS identifiers, URLs, hex codes, internal flags
        if (len(s_clean) > 3 and 
            not s_clean.startswith("http") and 
            not s_clean.startswith("w163") and
            not s_clean.startswith("AG8n") and
            not s_clean.startswith("%") and
            not s_clean.startswith("var ") and
            not re.match(r'^[0-9a-fA-F\-]{10,}$', s_clean) and
            not re.match(r'^[0-9\,\.\s]+$', s_clean)):
            if s_clean not in seen:
                seen.add(s_clean)
                unique_text.append(s_clean)

    print(f"=== FOUND {len(unique_text)} UNIQUE TEXT ELEMENTS ===")
    
    with open('extracted_google_site_content.txt', 'w', encoding='utf-8') as out:
        out.write("=== SMARTLINE QR ROVER GOOGLE SITE EXTRACTED CONTENT ===\n\n")
        for line in unique_text:
            out.write(line + "\n")

    # Download all hosted images
    img_urls = set(re.findall(r'https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^\s\"\'\<\>]+', content))
    print(f"=== FOUND {len(img_urls)} GOOGLE SITES IMAGES ===")
    
    os.makedirs('extracted_site_images', exist_ok=True)
    for idx, img_url in enumerate(img_urls):
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            img_data = urllib.request.urlopen(req).read()
            img_file = os.path.join('extracted_site_images', f'site_image_{idx+1}.jpg')
            with open(img_file, 'wb') as f_img:
                f_img.write(img_data)
            print(f"Downloaded image {idx+1}: {img_file} ({len(img_data)} bytes)")
        except Exception as e:
            print(f"Failed to download image {idx+1}: {e}")

if __name__ == "__main__":
    extract()
