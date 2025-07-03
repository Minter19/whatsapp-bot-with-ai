const express = require('express');
const { authenticateApiKey } = require('../middlewares/authMiddleware'); // <--- PERBAIKI PATH INI

// Fungsi ini akan mengembalikan router yang sudah dikonfigurasi
// dengan clientModule yang spesifik
const createRouter = (whatsappClientModule) => {
    const router = express.Router();

    /**
     * Endpoint untuk mengirim pesan teks atau gambar.
     * Metode: POST
     * URL: /send-message
     * Header: x-api-key: YOUR_SECURE_RANDOM_KEY
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
        if (!clientInfo.client) {
            console.warn('API: Permintaan diterima saat WhatsApp client belum siap. Status client.info:', whatsappClientModule.client ? whatsappClientModule.client.info : 'client object missing');
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
     * Webhook API untuk meneruskan pesan dari aplikasi third-party ke WhatsApp client.
     * Metode: POST
     * URL: /webhook
     * Header: x-api-key: YOUR_SECURE_RANDOM_KEY (Opsional, tergantung kebutuhan keamanan)
     * Body JSON:
     * {
     * "list_number": ["6281234567890", "6289876543210"],
     * "message": "Halo ini pesan dari webhook!"
     * }
     */
    router.post('/webhook', authenticateApiKey, async (req, res) => { // Pastikan authenticateApiKey diterapkan jika webhook ini perlu diamankan
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
        if (!clientInfo.client) { // <--- Gunakan isClientTrulyReady di sini
            console.warn('API: Permintaan diterima saat WhatsApp client belum siap untuk webhook. Status client.info:', whatsappClientModule.client ? whatsappClientModule.client.info : 'client object missing');
            return res.status(503).json({ success: false, message: 'WhatsApp client belum siap. Silakan coba lagi sebentar.' });
        }

        try {
            console.log('Received webhook body:', body);
            // Panggil handleWebhook dari whatsappClientModule
            if (!whatsappClientModule.handleWebhook || typeof whatsappClientModule.handleWebhook !== 'function') {
                throw new Error('whatsappClientModule.handleWebhook is not available or not a function.');
            }
            const result = await whatsappClientModule.handleWebhook(body.list_number, body.message);

            if (result.success) {
                res.json({ success: true, message: 'Webhook berhasil diproses.', results: result.results });
            } else {
                res.status(500).json({ success: false, message: 'Gagal memproses webhook.', error: result.message }); // Menggunakan result.message dari handleWebhook
            }
        } catch (error) {
            console.error('Error saat memproses permintaan /webhook:', error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.', error: error.message });
        }
    });


    /**
     * Endpoint untuk memeriksa status bot dan WhatsApp client.
     * Tidak memerlukan API Key untuk kemudahan debugging dan monitoring.
     */
    router.get('/status', (req, res) => {

        // Mendapatkan state dari client.getState(), jika mengembalikan objek kosong, set default 'UNKNOWN'
        let clientState = 'UNKNOWN';
        if (whatsappClientModule.client) {
            const stateResult = whatsappClientModule.client.getState();
            if (typeof stateResult === 'string') {
                clientState = stateResult;
            } else if (stateResult && Object.keys(stateResult).length === 0) {
                // Ini kasus Anda: getState() mengembalikan objek kosong
                clientState = 'EMPTY_STATE_OBJECT';
            } else if (stateResult) {
                clientState = JSON.stringify(stateResult); // Jika ada isi lain
            }
        }

        const clientInfo = whatsappClientModule.client ? whatsappClientModule.client.info : 'N/A';

        // Log di konsol server untuk debug
        console.log('--- API /status check ---');
        console.log('whatsappClientModule.client:', whatsappClientModule.client ? 'Present' : 'Absent');
        console.log('whatsappClientModule.client.isReady (raw):', whatsappClientModule.client ? whatsappClientModule.client.isReady : 'N/A');
        console.log('isClientTrulyReady (based on info):', clientInfo.client ? 'Yes' : 'No');
        console.log('clientState from getState():', clientState);
        console.log('clientInfo:', clientInfo);
        console.log('-------------------------');

        res.json({
            success: true,
            api_status: 'running',
            whatsapp_client_info: clientInfo,
            message: clientInfo.client ? 'WhatsApp client siap menerima perintah.' : 'WhatsApp client belum siap atau sedang terhubung kembali.'
        });
    });

    /**
     * Endpoint untuk mendapatkan QR code terbaru.
     * Metode: GET
     * URL: /qr-code
     * Tidak memerlukan API Key
     */
    router.get('/qr-code', (req, res) => {
        const qrCode = whatsappClientModule.getQrCode(); // Menggunakan fungsi getQrCode dari whatsappClient
        const botStatusFromClient = whatsappClientModule.getBotStatus(); // Menggunakan fungsi getBotStatus

        if (qrCode) {
            res.json({ success: true, qr: qrCode, status: botStatusFromClient, message: 'QR Code tersedia untuk dipindai.' });
        } else {
            res.json({ success: false, qr: null, status: botStatusFromClient, message: 'QR code tidak tersedia atau bot sudah terhubung/offline.' });
        }
    });

    /**
     * Endpoint untuk mendapatkan status bot sederhana untuk UI.
     * Metode: GET
     * URL: /bot-status
     * Tidak memerlukan API Key
     */
    router.get('/bot-status', (req, res) => {
        const currentStatus = whatsappClientModule.getBotStatus();

        res.json({
            success: true,
            status: currentStatus,
            client_ready: clientInfo.client, // Indikator kesiapan berdasarkan info
            message: clientInfo.client ? 'Bot siap beroperasi.' : 'Bot sedang dalam proses koneksi.'
        });
    });


    // =================================================================
    // BARU: Tambahkan endpoint untuk logout di sini
    // =================================================================
    /**
     * Endpoint untuk melakukan logout dan mereset sesi WhatsApp.
     * Metode: POST
     * URL: /logout
     * Header: app-api-secret-key: YOUR_API_KEY
     */
    router.post('/logout', authenticateApiKey, async (req, res) => {
        console.log('API call received for /logout');
        const result = await whatsappClientModule.logoutClient();
        
        if (result.success) {
            res.status(200).json(result);
            // Tambahan: Beri sedikit waktu sebelum server restart/exit
            // agar respons JSON bisa terkirim dengan baik.
            setTimeout(() => {
                // Menghentikan proses server agar bisa dimulai ulang oleh process manager (seperti PM2)
                // atau agar pengguna bisa menjalankannya kembali secara manual.
                console.log('Server is shutting down for a restart to apply logout.');
                process.exit(0); 
            }, 1000);
        } else {
            res.status(500).json(result);
        }
    });
    // =================================================================

    console.log('Routes module created. Will be configured when client module is passed.');
    return router;
};

module.exports = { createRouter };