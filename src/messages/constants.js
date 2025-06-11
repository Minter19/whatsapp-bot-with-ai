// Perintah Bot
const CMD_PING = '!ping';
const CMD_AI = '!ai '; // Perhatikan ada spasi di belakang karena perintah diikuti teks

// Pesan Default
const MSG_WELCOME = 'Halo! Saya adalah WhatsApp bot. Ketik `!ai [pertanyaan Anda]` untuk berinteraksi dengan AI Gemini.';
const MSG_UNKNOWN_COMMAND = 'Maaf, saya tidak memahami perintah itu. Ketik `!ai` untuk berinteraksi dengan AI.';

module.exports = {
    CMD_PING,
    CMD_AI,
    MSG_WELCOME,
    MSG_UNKNOWN_COMMAND,
};