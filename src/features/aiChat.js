const { getGeminiResponse } = require('../services/geminiService');
const { CMD_AI } = require('../messages/constants'); // Akan dibuat di langkah berikutnya

/**
 * Menangani pesan yang ditujukan untuk interaksi AI.
 * @param {object} msg Objek pesan dari whatsapp-web.js
 */
async function handleAIChat(msg) {
    const text = msg.body;

    // Memastikan pesan dimulai dengan perintah AI (misal: '!ai ')
    if (!text.toLowerCase().startsWith(CMD_AI.toLowerCase())) {
        return false; // Bukan perintah AI, biarkan handler lain yang menanganinya
    }

    const prompt = text.substring(CMD_AI.length).trim(); // Ambil teks setelah perintah
    if (!prompt) {
        msg.reply('Mohon sertakan pertanyaan atau perintah setelah !ai. Contoh: !ai Apa itu AI?');
        return true; // Pesan sudah ditangani
    }

    console.log(`Permintaan AI dari ${msg.from}: ${prompt}`);

    // Memberikan indikasi bahwa bot sedang mengetik atau memproses
    await msg.react('thinking'); // Reaksi 'thinking'

    try {
        const aiResponse = await getGeminiResponse(prompt);
        await msg.reply(aiResponse);
        await msg.react(''); // Hapus reaksi setelah selesai
        console.log(`Respons AI terkirim ke ${msg.from}`);
    } catch (error) {
        console.error('Gagal mendapatkan respons AI:', error);
        msg.reply('Maaf, saya tidak bisa memproses permintaan AI Anda saat ini.');
        await msg.react('❌'); // Reaksi error
    }
    return true; // Pesan sudah ditangani
}

module.exports = { handleAIChat };