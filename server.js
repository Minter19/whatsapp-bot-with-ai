// server.js
require('dotenv').config();

const { client, sendTextMessage, sendMediaFromUrl } = require('./src/auth/whatsappClient');
const { processFeatures } = require('./src/features');
const { MSG_UNKNOWN_COMMAND } = require('./src/messages/constants');
const { startApiServer } = require('./src/api/apiServer');

// Inisialisasi WhatsApp Client
client.initialize();

// Event saat QR code dihasilkan
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

// Event saat WhatsApp client siap, baru mulai API server
client.on('ready', () => {
    console.log('WhatsApp Client is ready! Waiting 5 seconds before starting API...');
    setTimeout(() => {
        console.log('Starting API Server...');
        // Teruskan client dan fungsi pengiriman pesan ke API server
        startApiServer({ client, sendTextMessage, sendMediaFromUrl });
        console.log('API Server should be started now.');
    }, 3000); // Tunggu 5 detik
});

// Tambahkan logging untuk status koneksi lebih lanjut
client.on('authenticated', (session) => {
    console.log('WhatsApp AUTHENTICATED successfully!');
});

client.on('disconnected', (reason) => {
    console.error('WhatsApp Client DISCONNECTED:', reason);
    // Jika terputus, pastikan client di-reset atau ditandai sebagai tidak siap
});

client.on('auth_failure', (msg) => {
    console.error('WhatsApp AUTH FAILURE:', msg);
});

client.on('change_state', (state) => {
    console.log('WhatsApp Client State Changed:', state);
    // States: CONNECTING, CONNECTED, DISCONNECTED, TIMEOUT, UNPAIRED, UNPAIRED_IDLE
});

client.on('message', async msg => {
    console.log(`Pesan masuk dari ${msg.from}: ${msg.body}`);
    const handled = await processFeatures(msg);
    if (!handled) {
        if (!msg.fromMe && !msg.body.startsWith('!')) {
            msg.reply(MSG_UNKNOWN_COMMAND);
        }
    }
});

client.on('message_create', (msg) => {
    if (msg.fromMe) {
        console.log(`Pesan terkirim dari bot: ${msg.body}`);
    }
});

console.log('WhatsApp bot starting...');