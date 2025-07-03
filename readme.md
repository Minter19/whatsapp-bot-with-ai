# WhatsApp Gemini Bot by mprx

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![WhatsApp Web.js](https://img.shields.io/badge/WhatsApp%20Web.js-1.23.0-blue?style=for-the-badge&logo=whatsapp)](https://github.com/pedroslopez/whatsapp-web.js)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini%20AI-API-orange?style=for-the-badge&logo=google)](https://aistudio.google.com/app/apikey)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

Bot WhatsApp cerdas yang terintegrasi dengan Google Gemini AI untuk respons percakapan. Dilengkapi dengan REST API untuk mengirim pesan dan antarmuka web untuk memantau status koneksi secara real-time.

[Screenshot Aplikasi](https://prnt.sc/7Tq-I3ckX5ZL)

---

## ✨ Fitur Utama

* **Interaksi AI Cerdas:** Terhubung dengan Google Gemini AI untuk percakapan yang dinamis.
* **Antarmuka Web Real-time:** Pantau status koneksi (Menunggu QR, Terhubung, Terputus) dengan mudah.
* **REST API Fungsional:** Kirim pesan teks dan media melalui endpoint API yang aman.
* **Manajemen Sesi:** Sesi disimpan secara lokal dan terdapat fitur logout untuk mereset koneksi.
* **Siap Produksi:** Didesain untuk berjalan 24/7 menggunakan process manager seperti PM2.

---

## ⚙️ Persiapan

Sebelum memulai, pastikan Anda memiliki:

1.  **Node.js**: Versi 18.x atau yang lebih baru.
2.  **Akun WhatsApp**: Nomor yang aktif untuk dijadikan bot.
3.  **(Opsional) API Key Gemini**: Diperlukan jika Anda ingin menggunakan fitur AI. Anda bisa mendapatkannya dari [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 🚀 Instalasi & Konfigurasi

Ikuti langkah-langkah berikut untuk menjalankan bot di komputer Anda.

#### 1. Klon Repositori

Buka terminal Anda dan jalankan perintah berikut:
```bash
git clone https://github.com/Minter19/whatsapp-bot-with-ai.git
cd whatsapp-bot-with-ai
```

#### 2. Instal Dependensi

Install semua library yang dibutuhkan oleh proyek:
```bash
npm install
```

#### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` baru. File ini akan menyimpan semua kredensial rahasia Anda.
```bash
cp .env.example .env
```
Kemudian, buka file `.env` dan isi nilainya:
```env
# Kunci rahasia untuk mengamankan endpoint API Anda. Isi dengan string acak yang kuat.
API_KEY="GANTI_DENGAN_KUNCI_RAHASIA_ANDA"

# (Opsional) API Key dari Google AI Studio.
GEMINI_API_KEY="GANTI_DENGAN_API_KEY_GEMINI_ANDA"
```

---

## ▶️ Menjalankan Aplikasi

#### Mode Pengembangan
Untuk menjalankan server secara langsung di terminal Anda:
```bash
node server.js
```

#### Mode Produksi (Direkomendasikan)
Gunakan PM2 untuk menjaga aplikasi tetap berjalan di latar belakang dan otomatis restart jika terjadi error.
```bash
# Install PM2 secara global jika belum ada
npm install pm2 -g

# Jalankan aplikasi
pm2 start server.js --name "whatsapp-bot"

# Pantau log aplikasi
pm2 logs whatsapp-bot
```
Setelah server berjalan, buka **http://localhost:3000** di browser untuk memindai QR code dan menghubungkan perangkat Anda.

---

## 📝 Dokumentasi API

Semua endpoint API berada di bawah prefiks `/api`. Header `app-api-secret-key` wajib disertakan di setiap permintaan untuk autentikasi.

### Kirim Pesan Teks
* **URL:** `/send-message`
* **Metode:** `POST`
* **Headers:**
    * `Content-Type: application/json`
    * `app-api-secret-key: <API_KEY_ANDA_DARI_.ENV>`
* **Body:**
    ```json
    {
      "number": "6281234567890",
      "message": "Halo dari bot!"
    }
    ```

### Logout & Reset Sesi
* **URL:** `/logout`
* **Metode:** `POST`
* **Headers:**
    * `app-api-secret-key: <API_KEY_ANDA_DARI_.ENV>`

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT**. Lihat file `LICENSE` untuk detail lengkap.