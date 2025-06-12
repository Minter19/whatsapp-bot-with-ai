const express = require('express');
const { authenticateApiKey } = require('../middleware/authMiddleware');

// Fungsi ini akan mengembalikan router yang sudah dikonfigurasi
// dengan clientModule yang spesifik
const createRouter = (whatsappClientModule) => {
    const router = express.Router();
    /**
     * Endpoint untuk mengirim pesan teks atau gambar.
     * Metode: POST
     * URL: /send-message
     * Header: app-api-secret-key: YOUR_SECURE_RANDOM_KEY
     * Body JSON: { ... }
     */
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
    router.post('/send-message', authenticateApiKey, async (req, res) => {
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
     * Webhook api untuk meneruskan pesan dari aplikasi third-party ke WhatsApp client.
     * Metode: POST
     * URL: /webhook
     * Body JSON: dinamis, tergantung aplikasi third-party
    */

    router.post('/webhook', authenticateApiKey, async (req, res) => {
        const { body } = req;
        const clientInfo = whatsappClientModule.client ? whatsappClientModule.client.info : 'N/A';
        
        // Validasi apakah body tidak kosong
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ success: false, message: 'Body request tidak boleh kosong.' });
        }

        // pastikan ada list_number di body
        if (!body.list_number || !Array.isArray(body.list_number) || body.list_number.length === 0) {
            return res.status(400).json({ success: false, message: 'Parameter "list_number" wajib diisi dan harus berupa array.' });
        }

        // Pastikan WhatsApp client sudah siap
        if (!clientInfo) {
            console.warn('API: Permintaan diterima saat WhatsApp client belum siap. Current isReady:', whatsappClientModule.client ? whatsappClientModule.client.isReady : 'client object missing');
            return res.status(503).json({ success: false, message: 'WhatsApp client belum siap. Silakan coba lagi sebentar.' });
        }

        try {
            // Proses body sesuai dengan kebutuhan aplikasi third-party
            // Misalnya, mengirim pesan ke WhatsApp client
            console.log('Received webhook body:', body);
            const result = await whatsappClientModule.handleWebhook(body.list_number, body.message);

            if (result.success) {
                res.json({ success: true, message: 'Webhook berhasil diproses.' });
            } else {
                res.status(500).json({ success: false, message: 'Gagal memproses webhook.', error: result.error });
            }
        } catch (error) {
            console.error('Error saat memproses permintaan /webhook:', error);
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