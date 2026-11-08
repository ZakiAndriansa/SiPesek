import "server-only";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db";

const JENDELA_DETIK = 60 * 60;

/** Sidik IP agar alamat asli tidak tersimpan di database. */
const sidikIp = (ip: string) =>
  createHmac("sha256", process.env.JWT_SECRET ?? "").update(`batas-tamu:${ip}`).digest("base64url");

/**
 * Batas Cek Cepat tamu per IP dalam jendela satu jam, dibagi semua instance server lewat Postgres.
 * Satu query menghitung pemakaian lalu mencatat permintaan ini bila masih di bawah batas. Waktu memakai jam
 * database (UTC). Mengembalikan null bila boleh, atau lama tunggu dalam detik bila batas tercapai.
 * Bila database bermasalah, permintaan diizinkan: lebih baik tamu tetap bisa cek daripada semua terkunci.
 * Dua permintaan yang tepat bersamaan di ambang batas bisa sama-sama lolos; untuk pembatas ini tidak masalah.
 */
export async function cobaBatasTamu(ip: string, batas: number): Promise<number | null> {
  const kunci = sidikIp(ip);
  try {
    const [r] = await prisma.$queryRaw<{ n: number; tunggu: number | null }[]>`
      WITH jendela AS (
        SELECT count(*)::int AS n, min(waktu) AS tertua
        FROM "BatasTamu"
        WHERE kunci = ${kunci} AND waktu > (now() AT TIME ZONE 'UTC') - make_interval(secs => ${JENDELA_DETIK})
      ), tambah AS (
        INSERT INTO "BatasTamu" (kunci, waktu)
        SELECT ${kunci}, now() AT TIME ZONE 'UTC' FROM jendela WHERE n < ${batas}
        RETURNING 1
      )
      SELECT n, ceil(extract(epoch FROM tertua + make_interval(secs => ${JENDELA_DETIK}) - (now() AT TIME ZONE 'UTC')))::int AS tunggu
      FROM jendela`;
    // Bersihkan baris kedaluwarsa sesekali, agar tabel tidak terus tumbuh.
    if (Math.random() < 0.02) {
      await prisma.$executeRaw`DELETE FROM "BatasTamu" WHERE waktu < (now() AT TIME ZONE 'UTC') - make_interval(secs => ${JENDELA_DETIK})`;
    }
    return r && r.n >= batas ? Math.max(1, r.tunggu ?? JENDELA_DETIK) : null;
  } catch (e) {
    console.warn("Batas cek tamu dilewati karena database bermasalah:", e instanceof Error ? e.message : e);
    return null;
  }
}
