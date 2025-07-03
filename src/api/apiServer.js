const express = require('express'); // Pastikan ini tetap ada jika createRouter menggunakannya
const { createRouter } = require('./routes'); // Import fungsi createRouter

/**
 * Mengatur rute-rute API ke instance Express yang diberikan.
 * Fungsi ini sekarang hanya bertanggung jawab untuk membuat router API
 * dan mengembalikannya, tanpa memasangnya ke instance app atau menangani listen.
 *
 * @param {object} whatsappClientModule Objek yang berisi client WhatsApp dan fungsi pengirimannya.
 * @returns {express.Router} Instance router Express yang sudah dikonfigurasi.
 */
function setupApiRoutes(whatsappClientModule) {
    // Buat instance router menggunakan createRouter dari routes.js
    // Ini akan mengkonfigurasi semua rute API yang diperlukan
    const router = createRouter(whatsappClientModule); // <--- LANGSUNG BUAT DAN SIMPAN KE 'router'

    // HAPUS BAGIAN app.listen() DI SINI

    return router; // <--- KEMBALIKAN INSTANCE ROUTER LANGSUNG
}

// Ubah export function dari startApiServer menjadi setupApiRoutes
module.exports = { setupApiRoutes };