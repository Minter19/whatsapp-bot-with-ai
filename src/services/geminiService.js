require('dotenv').config(); // Memastikan variabel lingkungan dimuat
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not defined in .env file.');
    // Mungkin Anda ingin menghentikan aplikasi di sini jika API Key sangat penting
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Mengambil respons dari Gemini AI berdasarkan prompt yang diberikan.
 * @param {string} prompt Teks pertanyaan atau instruksi untuk Gemini.
 * @returns {Promise<string>} Respons teks dari Gemini.
 */
async function getGeminiResponse(prompt) {
    try {
        // Pilih model yang akan digunakan. 'gemini-pro' cocok untuk teks.
        // Anda bisa eksplorasi model lain di dokumentasi Google AI Studio.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error('Error contacting Gemini API:', error);
        if (error.response && error.response.data && error.response.data.error) {
            console.error('Gemini API Error Details:', error.response.data.error.message);
        }
        return 'Maaf, saya sedang mengalami masalah teknis dan tidak bisa memproses permintaan Anda saat ini.';
    }
}

module.exports = { getGeminiResponse };