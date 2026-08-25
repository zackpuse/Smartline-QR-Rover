import re

def main():
    with open('google_site_raw.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find all iframe src or data-url attributes
    iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html)
    print('=== IFRAME SRCS ===', len(iframes))
    for i in iframes:
        print('IFRAME:', i)

    data_urls = re.findall(r'data-url=["\']([^"\']+)["\']', html)
    print('\n=== DATA URLS ===', len(data_urls))
    for d in data_urls:
        print('DATA-URL:', d)

    # Find drive / docs / forms / site embed URLs
    embeds = re.findall(r'https://[^\s"\'<>]+(?:google\.com|googleusercontent\.com|youtube\.com|sites\.google\.com)[^\s"\'<>]*', html)
    print('\n=== GOOGLE EMBED URLS (First 30) ===')
    for e in list(set(embeds))[:30]:
        print('-', e[:120])

if __name__ == "__main__":
    main()
