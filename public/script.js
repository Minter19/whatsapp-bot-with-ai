// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Cache semua elemen DOM yang akan dimanipulasi
    const elements = {
        statusText: document.getElementById('status-text'),
        loaderContainer: document.getElementById('loader-container'),
        qrcodeContainer: document.getElementById('qrcode-container'),
        qrcodeImg: document.getElementById('qrcode-img'),
        statusContainer: document.getElementById('status-container'),
        statusIcon: document.getElementById('status-icon'),
        statusMessage: document.getElementById('status-message'),
        logoutButton: document.getElementById('logout-button')
    };

    /**
     * Fungsi utama untuk mengelola semua perubahan UI.
     */
    function updateUI(state, data) {
        // Sembunyikan semua container utama terlebih dahulu
        elements.loaderContainer.classList.add('hidden');
        elements.qrcodeContainer.classList.add('hidden');
        elements.statusContainer.classList.add('hidden');

        switch (state) {
            case 'connecting':
                elements.statusText.textContent = 'Menghubungkan ke server...';
                elements.loaderContainer.classList.remove('hidden');
                break;
            
            case 'waiting_qr':
                elements.statusText.textContent = 'Menunggu QR Code...';
                elements.loaderContainer.classList.remove('hidden');
                break;

            case 'qr':
                elements.statusText.textContent = 'Pindai untuk terhubung';
                elements.qrcodeImg.src = data;
                elements.qrcodeContainer.classList.remove('hidden');
                break;

            case 'ready':
                elements.statusText.textContent = 'Terhubung';
                elements.statusIcon.textContent = '✅';
                elements.statusMessage.textContent = 'WhatsApp berhasil terhubung!';
                // Tampilkan container status
                elements.statusContainer.classList.remove('hidden');
                // Tampilkan tombol logout di dalamnya
                elements.logoutButton.classList.remove('hidden');
                break;

            case 'disconnected':
                elements.statusText.textContent = 'Koneksi Terputus';
                elements.statusIcon.textContent = '🔌';
                elements.statusMessage.textContent = 'Koneksi terputus. Silakan refresh halaman.';
                // Tampilkan container status, tapi tombol logout akan tetap tersembunyi
                // karena kita tidak menghapus class 'hidden'-nya di sini.
                elements.statusContainer.classList.remove('hidden');
                elements.logoutButton.classList.add('hidden'); // Eksplisit sembunyikan
                break;
        }
    }

    // Event listener untuk tombol logout
    elements.logoutButton.addEventListener('click', async () => {
        if (!confirm('Apakah Anda yakin ingin logout? Sesi saat ini akan dihapus dan server akan di-restart.')) {
            return;
        }

        const apiKey = prompt('Untuk keamanan, silakan masukkan API Key Anda:');
        if (!apiKey) {
            alert('API Key tidak boleh kosong.');
            return;
        }

        elements.logoutButton.disabled = true;
        elements.logoutButton.textContent = 'Logging out...';

        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'app-api-secret-key': apiKey 
                }
            });
            const result = await response.json();
            if (response.ok) {
                alert('Logout berhasil! Server akan berhenti. Silakan jalankan kembali server secara manual.');
            } else {
                throw new Error(result.message || 'Gagal melakukan logout.');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
            elements.logoutButton.disabled = false;
            elements.logoutButton.textContent = 'Logout & Reset Sesi';
        }
    });

    // --- Event Listeners dari Socket.IO ---
    socket.on('connect', () => {
        console.log('✅ Terhubung ke server!');
        updateUI('waiting_qr');
    });

    socket.on('qr_code', (qr) => {
        console.log('QR Code diterima.');
        updateUI('qr', qr);
    });

    socket.on('client_ready', () => {
        console.log('Client WhatsApp siap!');
        updateUI('ready');
    });

    socket.on('client_disconnected', () => {
        console.log('Client WhatsApp terputus.');
        updateUI('disconnected');
    });

    socket.on('disconnect', () => {
        console.log('🔌 Koneksi ke server terputus.');
        updateUI('disconnected');
    });

    // Inisialisasi UI ke status awal
    updateUI('connecting');
});