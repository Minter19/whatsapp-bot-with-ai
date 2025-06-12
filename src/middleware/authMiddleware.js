// src/middlewares/authMiddleware.js
require('dotenv').config(); // Pastikan variabel lingkungan dimuat

const API_KEY_SECRET = process.env.APP_API_SECRET_KEY;

if (!API_KEY_SECRET) {
    console.error('ERROR: API_KEY_SECRET is not defined in .env file. API security will be compromised.');
    // Dalam produksi, Anda mungkin ingin menghentikan aplikasi jika kunci tidak ada.
    // process.exit(1);
}

/**
 * Middleware untuk mengautentikasi permintaan API menggunakan app-api-secret-key.
 * API Key diharapkan ada di header 'app-api-secret-key'.
 */
function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['app-api-secret-key'];

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'Autentikasi gagal: app-api-secret-key tidak disediakan.' });
    }

    if (apiKey !== API_KEY_SECRET) {
        return res.status(403).json({ success: false, message: 'Autentikasi gagal: app-api-secret-key tidak valid.' });
    }
    next();
}

module.exports = { authenticateApiKey };