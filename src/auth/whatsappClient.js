// src/auth/whatsappClient.js

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

let currentQrCode = null;
let botStatus = 'Initializing';

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "whatsapp-bot-gemini", dataPath: './sessions' }),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// DIUBAH: Buat fungsi initialize untuk menerima 'io'
const initialize = (io) => {
    client.on('qr', async (qr) => {
        console.log('QR RECEIVED, generating for UI...');
        
        try {
            const qrDataURL = await qrcode.toDataURL(qr);
            currentQrCode = qrDataURL;
            botStatus = 'Waiting for Scan';
            console.log('INFO: QR code Data URL berhasil dibuat.');

            // BARU: Langsung emit dari sini setelah QR benar-benar siap
            io.emit('qr_code', currentQrCode);

        } catch (err) {
            console.error('ERROR: Gagal membuat QR Data URL.', err);
            currentQrCode = null;
            botStatus = 'QR Gen Failed';
        }
    });

    client.on('ready', () => {
        console.log('WhatsApp Client is ready!');
        currentQrCode = null;
        botStatus = 'Ready';
        io.emit('client_ready'); // Kirim status ready ke semua client
    });

    client.on('disconnected', (reason) => {
        console.log('Client was disconnected', reason);
        currentQrCode = null;
        botStatus = 'Disconnected';
        io.emit('client_disconnected'); // Kirim status dc ke semua client
    });

    // Mulai inisialisasi client dari dalam fungsi ini
    client.initialize();
};

const logoutClient = async () => {
    try {
        console.log('Attempting to logout...');
        // 1. Hancurkan sesi client yang sedang berjalan
        await client.destroy();
        console.log('Client session destroyed.');

        // 2. Hapus folder sesi untuk memastikan logout bersih
        const sessionPath = path.join(__dirname, '..', '..', 'sessions');
        console.log("path: ", sessionPath);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            console.log('Session folder deleted.');
        }

        // Reset status internal
        currentQrCode = null;
        botStatus = 'DISCONNECTED';
        
        return { success: true, message: 'Logout berhasil.' };
    } catch (error) {
        console.error('Error during logout:', error);
        return { success: false, message: 'Terjadi error saat logout.', error: error.message };
    }
};

async function sendTextMessage(number, message) {
    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        console.log(`Pesan teks terkirim ke ${number}`);
        return { success: true, message: 'Message sent successfully.' };
    } catch (error) {
        console.error(`Gagal mengirim pesan teks ke ${number}:`, error);
        return { success: false, message: 'Failed to send message.', error: error.message };
    }
}

async function sendMediaFromUrl(number, imageUrl, caption = '') {
    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        const media = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
        if (!media) {
            throw new Error('Failed to fetch media from URL.');
        }
        await client.sendMessage(chatId, media, { caption: caption });
        console.log(`Gambar terkirim ke ${number} dari URL: ${imageUrl}`);
        return { success: true, message: 'Image sent successfully.' };
    } catch (error) {
        console.error(`Gagal mengirim gambar ke ${number} dari URL ${imageUrl}:`, error);
        return { success: false, message: 'Failed to send image.', error: error.message };
    }
}

async function handleWebhook(list_number, message) {
    try {
        if (!list_number || !Array.isArray(list_number) || list_number.length === 0) {
            throw new Error('List number is required and must be a non-empty array.');
        }
        const results = [];
        for (const number of list_number) {
            const result = await sendTextMessage(number, message);
            results.push({ number, ...result });
        }
        return { success: true, results };
    } catch (error) {
        console.error('Error in handleWebhook:', error);
        return { success: false, message: error.message };
    }
}

function getQrCode() {
    return currentQrCode;
}

function getBotStatus() {
    return botStatus;
}


// Ekspor client dan semua fungsi yang dibutuhkan oleh modul lain
module.exports = {
    initialize,
    client,
    logoutClient,
    sendTextMessage,
    sendMediaFromUrl,
    handleWebhook,
    getQrCode,
    getBotStatus
};