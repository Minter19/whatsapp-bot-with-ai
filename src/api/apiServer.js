// src/api/apiServer.js
const express = require('express');
const bodyParser = require('body-parser');
const { createRouter } = require('./routes'); // Import fungsi createRouter

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Variabel untuk menyimpan router yang sudah dikonfigurasi
let configuredApiRouter = null;

// Middleware untuk API
// Ini akan dipanggil untuk setiap request ke /api
app.use('/api', (req, res, next) => {
    // Jika router API belum dikonfigurasi (misal: WhatsApp client belum ready)
    if (!configuredApiRouter) {
        console.warn('API: Request ke /api diterima saat router belum terinisialisasi.');
        return res.status(503).json({ success: false, message: 'Server API belum sepenuhnya siap. Mohon tunggu WhatsApp client ready.' });
    }
    // Jika router sudah dikonfigurasi, serahkan request ke router tersebut
    configuredApiRouter(req, res, next);
});

/**
 * Memulai server API.
 * @param {object} whatsappClientModule Objek yang berisi client WhatsApp dan fungsi pengirimannya.
 */
function startApiServer(whatsappClientModule) {
    // Buat router dengan clientModule yang sudah valid
    configuredApiRouter = createRouter(whatsappClientModule); // Inisialisasi router di sini

    app.listen(PORT, () => {
        console.log(`🚀 REST API server berjalan di http://localhost:${PORT}`);
        console.log(`Endpoint untuk mengirim pesan: POST http://localhost:${PORT}/api/send-message`);
        console.log(`Endpoint status bot: GET http://localhost:${PORT}/api/status`);
    });
}

module.exports = { startApiServer };