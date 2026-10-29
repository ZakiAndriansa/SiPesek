# Image untuk homeserver: aplikasi lengkap (halaman + API).
# Target "alat" berisi seluruh dependensi untuk migrasi dan seed.

FROM node:24-bookworm-slim AS dasar
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM dasar AS dep
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# postinstall menjalankan prisma generate; koneksi database tidak dibutuhkan di tahap ini.
RUN npm ci

FROM dep AS alat
COPY . .

FROM alat AS pembangun
ENV NEXT_OUTPUT=standalone
RUN npm run build

FROM dasar AS jalan
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=pembangun --chown=node:node /app/.next/standalone ./
COPY --from=pembangun --chown=node:node /app/.next/static ./.next/static
COPY --from=pembangun --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
