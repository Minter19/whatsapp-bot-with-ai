const { handleAIChat } = require('./aiChat');
const { CMD_PING } = require('../messages/constants');

/**
 * Mendaftarkan dan memproses semua fitur bot berdasarkan pesan masuk.
 * @param {object} msg Objek pesan dari whatsapp-web.js
 * @returns {Promise<boolean>} True jika pesan ditangani oleh salah satu fitur, false jika tidak.
 */
async function processFeatures(msg) {
    const lowerCaseBody = msg.body.toLowerCase();

    // Fitur dasar: !ping
    if (lowerCaseBody === CMD_PING) {
        msg.reply('pong');
        return true;
    }

    // Fitur AI Chat
    const handledByAIChat = await handleAIChat(msg);
    if (handledByAIChat) {
        return true;
    }

    // Tambahkan fitur lain di sini...

    return false; // Pesan tidak ditangani oleh fitur manapun
}

module.exports = { processFeatures };