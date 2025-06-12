const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Buat instance client WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "whatsapp-bot-gemini", dataPath: './session' }), // Menyimpan sesi login secara lokal
    puppeteer: {
        headless: true, // Menjalankan browser di background
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null, // Path ke executable Chrome jika diperlukan
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Penting untuk deployment di beberapa lingkungan
    }
});

// Event saat QR code dihasilkan
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true }); // Tampilkan QR code di terminal
});

// Event saat client siap
client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

// Event saat client disconnected (misalnya, ponsel offline)
client.on('disconnected', (reason) => {
    console.log('Client was disconnected', reason);
});

// Event error
client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('message_create', (msg) => {
    // Ini akan menangkap setiap pesan yang dibuat (dikirim dan diterima)
    // Kita akan memproses pesan yang diterima di handler terpisah.
    if (msg.fromMe) {
        // console.log('Pesan saya:', msg.body);
    } else {
        // console.log('Pesan masuk:', msg.body);
    }
});


/**
 * Fungsi untuk mengirim pesan teks
 * @param {string} number Nomor tujuan (misal: '6281234567890')
 * @param {string} message Teks pesan
 */
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

/**
 * Fungsi untuk mengirim gambar dari URL
 * @param {string} number Nomor tujuan (misal: '6281234567890')
 * @param {string} imageUrl URL gambar
 * @param {string} caption Teks keterangan gambar (opsional)
 */
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

// Fungsi untuk melakukan handle pada webhook pesan masuk
async function handleWebhook(list_number, message) {
    try {
        // Validasi nomor
        if (!list_number || !Array.isArray(list_number) || list_number.length === 0) {
            throw new Error('List number is required and must be a non-empty array.');
        }

        // Kirim pesan ke setiap nomor dalam list_number
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

// Ekspor client dan fungsi pengiriman pesan
module.exports = {
    client,
    sendTextMessage,
    sendMediaFromUrl,
    handleWebhook
};