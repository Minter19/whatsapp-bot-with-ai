# Dockerfile untuk aplikasi Node.js yang menggunakan whatsapp-web.js
# dan Puppeteer di atas image Node.js berbasis Alpine Linux.
FROM node:alpine3.22

# Set working directory di dalam container
WORKDIR /app

# Menginstal dependensi sistem yang dibutuhkan oleh Puppeteer (whatsapp-web.js)
# dan Chromium. Ini penting untuk menjalankan browser headless.
# `apk add --no-cache` untuk instalasi paket yang lebih bersih di Alpine.
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    unzip \
    git \
    && rm -rf /var/cache/apk/*

# Copy package.json dan package-lock.json (atau npm-shrinkwrap.json)
# ini memungkinkan Docker memanfaatkan layer cache saat menginstal dependensi
COPY package.json package-lock.json ./

# Instal dependensi Node.js.
# Karena whatsapp-web.js Anda menggunakan referensi Git, `npm install` perlu akses git.
# `--omit=dev` mencegah instalasi devDependencies di lingkungan produksi.
# --unsafe-perm diperlukan untuk beberapa paket yang menginstal script native.
RUN npm install --omit=dev --unsafe-perm

# Copy sisa kode aplikasi ke dalam container
COPY . .

# Pastikan variabel lingkungan Puppeteer diset untuk Chrome yang kita instal
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
ENV PUPPETEER_CACHE_DIR="/app/.cache/puppeteer"

# Expose port yang digunakan oleh REST API Anda
# Pastikan ini sesuai dengan PORT di file .env Anda (default 3000)
EXPOSE 3000

# Perintah untuk menjalankan aplikasi ketika container dimulai
# `npm start` akan menjalankan `node server.js` berdasarkan scripts di package.json Anda
CMD ["npm", "start"]