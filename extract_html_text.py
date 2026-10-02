import re
import json

def extract():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Extract text between tags >text<
    # We will just find all text that is not empty
    texts = re.findall(r'>([^<]+)<', html)
    
    cleaned = set()
    for t in texts:
        t = t.strip()
        # ignore empty, numbers, or very short punctuation
        if t and len(t) > 1 and not t.isdigit() and not t.startswith('&'):
            cleaned.add(t)
    
    with open('extracted_texts.json', 'w', encoding='utf-8') as f:
        json.dump(list(cleaned), f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    extract()
