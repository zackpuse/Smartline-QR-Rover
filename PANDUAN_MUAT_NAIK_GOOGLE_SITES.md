# Panduan Menyuntik (Embed) Simulator & Content Ke Dalam Google Sites (Tanpa Block Policy)

Disebabkan polisi keselamatan Google Workspace / Google Sites yang menyekat sesetengah domain luar (seperti Netlify), anda boleh menggunakan **2 Kaedah Tempatan Rasmi** di bawah yang **100% diluluskan oleh Google Sites**.

---

## 📌 KAEDAH 1: Copy-Paste Kod HTML (Embed Code / Suntik Kod HTML)

Kaedah ini tidak memerlukan sebarang hosting luar! Kami telah membina satu fail HTML tunggal **[google_site_embed_bundle.html](file:///d:/Mipac%20Tvet/google_site_embed_bundle.html)** yang mengandungi simulator, imej, gaya CSS, dan logik JS secara **Base64 Self-Contained**.

### Langkah-Langkah:
1. Buka fail **[google_site_embed_bundle.html](file:///d:/Mipac%20Tvet/google_site_embed_bundle.html)** dalam editor teks (Notepad / VS Code).
2. Salin (*Copy*) keseluruhan kandungan fail tersebut (`Ctrl + A` ➔ `Ctrl + C`).
3. Buka editor Google Sites anda di **[https://sites.google.com/jtm.gov.my/smartlineqrrover/home](https://sites.google.com/jtm.gov.my/smartlineqrrover/home)**.
4. Di panel kanan, klik **Insert (Sisip)** ➔ **Embed (Suntik)**.
5. Pilih tab **Embed Code (Suntik Kod HTML)** (BUKAN tab *By URL*).
6. Tampal (*Paste*) kod yang disalin tadi ke dalam petak tersebut (`Ctrl + V`).
7. Klik **Next (Seterusnya)** ➔ **Insert (Sisip)**.
8. Laraskan saiz petak simulator di Google Sites mengikut kesesuaian skrin anda!

---

## 📌 KAEDAH 2: Google Apps Script Web App (Bawah Akaun @jtm.gov.my)

Jika anda mahu hoskan secara URL dalam ekosistem Google Workspace institusi anda tanpa sekatan:

### Langkah-Langkah:
1. Buka **[script.google.com](https://script.google.com)** (log masuk akaun `@jtm.gov.my` anda).
2. Klik **New project (Projek Baharu)**.
3. Dalam fail `Code.gs`, gantikan dengan kod berikut:
   ```javascript
   function doGet() {
     return HtmlService.createHtmlOutputFromFile('Index')
       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
       .setTitle('SmartLine QR Rover ADAS Simulator');
   }
   ```
4. Klik ikon `+` di panel kiri ➔ pilih **HTML** ➔ beri nama `Index`.
5. Salin keseluruhan kandungan fail **[google_site_embed_bundle.html](file:///d:/Mipac%20Tvet/google_site_embed_bundle.html)** dan tampal ke dalam `Index.html`.
6. Klik **Deploy (Sebar)** ➔ **New deployment (Penyebaran baharu)**.
7. Pilih jenis **Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone** (atau *Anyone within JTM*)
8. Klik **Deploy** dan salin URL Web App yang diberikan (bermula dengan `https://script.google.com/macros/s/...`).
9. Di Google Sites anda, klik **Insert** ➔ **Embed** ➔ **By URL** dan tampal URL Google Apps Script tadi!

---

## 📌 KAEDAH 3: Salin Teks Teks 7 Seksyen Langsung Ke Google Sites

Bagi teks maklumat seksyen (Pengenalan, Objektif, Teori, Komponen, Amali, Rumusan):
1. Buka **Google Sites** anda.
2. Gunakan blok **Text Box** atau **Collapsible Group (Kumpulan Boleh Dikecilkan)**.
3. Salin teks ringkas daripada [google_site_portal.html](file:///d:/Mipac%20Tvet/google_site_portal.html) untuk setiap seksyen.
