// src/api/routes.js
const express = require('express');

// Hapus 'let whatsappClientModule = {};' di sini
// Karena kita akan menerima clientModule saat router dibuat

// Fungsi ini akan mengembalikan router yang sudah dikonfigurasi
// dengan clientModule yang spesifik
const createRouter = (whatsappClientModule) => {
    const router = express.Router();

    router.get('/test', (req, res) => {
        res.json({
            success: true,
            message: 'WhatsApp Bot API is running. Use /send-message to send messages or /status to check bot status.'
        });
    });
    /**
     * Endpoint untuk mengirim pesan teks atau gambar.
     * Metode: POST
     * URL: /send-message
     * Body JSON:
     * {
     * "number": "6281234567890",
     * "message": "Halo ini pesan dari bot!",
     * "imageUrl": "https://example.com/image.jpg",
     * "imageCaption": "Ini adalah gambar keren."
     * }
     */
    router.post('/send-message', async (req, res) => {
        const { number, message, imageUrl, imageCaption } = req.body;
        const clientInfo = whatsappClientModule.client ? whatsappClientModule.client.info : 'N/A';

        // Validasi input
        if (!number) {
            return res.status(400).json({ success: false, message: 'Parameter "number" wajib diisi.' });
        }
        if (!message && !imageUrl) {
            return res.status(400).json({ success: false, message: 'Setidaknya "message" atau "imageUrl" wajib diisi.' });
        }

        // Pastikan WhatsApp client sudah siap
        // Mengakses client langsung dari parameter whatsappClientModule
        if (!clientInfo) {
            console.warn('API: Permintaan diterima saat WhatsApp client belum siap. Current isReady:', whatsappClientModule.client ? whatsappClientModule.client.isReady : 'client object missing');
            return res.status(503).json({ success: false, message: 'WhatsApp client belum siap. Silakan coba lagi sebentar.' });
        }

        const formattedNumber = number.startsWith('62') ? number : `62${number}`; // Pastikan format 62xxx

        try {
            let result;
            if (imageUrl) {
                // Mengirim gambar jika imageUrl disediakan
                result = await whatsappClientModule.sendMediaFromUrl(formattedNumber, imageUrl, imageCaption);
            } else {
                // Mengirim pesan teks
                result = await whatsappClientModule.sendTextMessage(formattedNumber, message);
            }

            if (result.success) {
                res.json({ success: true, message: 'Pesan berhasil dikirim.' });
            } else {
                res.status(500).json({ success: false, message: 'Gagal mengirim pesan.', error: result.error });
            }
        } catch (error) {
            console.error('Error saat memproses permintaan /send-message:', error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.', error: error.message });
        }
    });

    /**
     * Endpoint untuk memeriksa status bot dan WhatsApp client.
     */
    router.get('/status', (req, res) => {
        const clientInfo = whatsappClientModule.client ? whatsappClientModule.client.info : 'N/A';

        // Tambahkan ini untuk melihat objek client
        // console.log('whatsappClientModule.client di /status:', whatsappClientModule.client);

        res.json({
            success: true,
            api_status: 'running',
            whatsapp_client_info: clientInfo,
            message: clientInfo.client ? 'WhatsApp client siap menerima perintah.' : 'WhatsApp client belum siap atau sedang terhubung kembali.'
        });
    });


    console.log('Routes module created. Will be configured when client module is passed.');
    return router;
};

module.exports = { createRouter }; // Ekspor fungsi untuk membuat router