// server.js

// 1. Impor semua modul yang dibutuhkan
require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// DIUBAH: Impor 'initialize' dari whatsappClientModule
const whatsappClientModule = require('./src/auth/whatsappClient');
const { createRouter } = require('./src/api/routes');
const { processFeatures } = require('./src/features');
const { MSG_UNKNOWN_COMMAND } = require('./src/messages/constants');

// 2. Inisialisasi Server Express, HTTP, dan Socket.IO
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});
const PORT = process.env.PORT || 3000;

// Blok io.on('connection') (TETAP ADA DAN PENTING)
io.on('connection', (socket) => {
    console.log('🔌 A new client connected:', socket.id);

    // Periksa status bot saat ini dari whatsappClientModule
    const currentStatus = whatsappClientModule.getBotStatus();
    const qrDataURL = whatsappClientModule.getQrCode();

    console.log(`INFO: New client check. Current Bot Status: ${currentStatus}`);

    // Logika baru yang lebih andal:
    // 1. Jika bot sudah ready, langsung kirim sinyal ready.
    // 2. Jika tidak, baru periksa apakah ada QR code untuk dikirim.
    if (currentStatus === 'Ready') {
        console.log('INFO: Bot is already ready. Sending ready status to new client.');
        socket.emit('client_ready');
    } else if (qrDataURL) {
        console.log('INFO: Sending existing QR code to new client.');
        socket.emit('qr_code', qrDataURL);
    }
    // Jika tidak keduanya, UI akan tetap di status "Menunggu QR..." yang sudah benar.
});

// 3. Pasang Middleware & Router API
app.use(express.json());
const apiRouter = createRouter(whatsappClientModule);
app.use('/api', apiRouter);

// 4. Konfigurasi untuk melayani file UI statis
app.use(express.static(path.join(__dirname, 'public')));

// 5. Hubungkan Event WhatsApp (HANYA UNTUK 'message')
// DIHAPUS: Semua listener client.on('qr'), client.on('ready'), client.on('disconnected')
// sekarang ditangani di dalam whatsappClient.js
const { client } = whatsappClientModule;
client.on('message', async msg => {
    console.log(`Pesan masuk dari ${msg.from}: ${msg.from}`);
    const handled = await processFeatures(msg);
    if (!handled && !msg.fromMe && !msg.body.startsWith('!')) {
        msg.reply(MSG_UNKNOWN_COMMAND);
    }
});

// 6. Mulai Inisialisasi Client dan Jalankan Server
console.log('Menginisialisasi WhatsApp bot...');
// DIUBAH: Panggil fungsi initialize dan berikan 'io'
whatsappClientModule.initialize(io);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});