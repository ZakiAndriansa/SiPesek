import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const JENDELA_DETIK = 60 * 60;

/** Cookie anonim penanda perangkat tamu: kode acak, bukan data pribadi, hanya untuk batas cek per jam. */
export const NAMA_COOKIE_TAMU = "sipesek_tamu";
export const opsiCookieTamu = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // sesuai janji di halaman Privasi: cookie paling lama 30 hari
} as const;

const POLA_ID_PERANGKAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Id perangkat dari cookie, atau id baru (`baru: true`, perlu dipasang ke respons) bila tidak ada atau rusak. */
export function idPerangkatTamu(nilaiCookie: string | undefined): { id: string; baru: boolean } {
  return nilaiCookie && POLA_ID_PERANGKAT.test(nilaiCookie)
    ? { id: nilaiCookie, baru: false }
    : { id: randomUUID(), baru: true };
}

/** Sidik agar IP dan id perangkat asli tidak tersimpan di database. */
export const sidikBatas = (jenis: "ip" | "perangkat", nilai: string) =>
  createHmac("sha256", process.env.JWT_SECRET ?? "").update(`batas-tamu:${jenis}:${nilai}`).digest("base64url");

export type Batasan = { kunci: string; batas: number };
export type Penolakan = { tunggu: number; penuh: string[] };

/**
 * Batas Cek Cepat tamu dalam jendela satu jam untuk beberapa kunci sekaligus (misalnya perangkat dan IP),
 * dibagi semua instance server lewat Postgres. Satu query menghitung pemakaian tiap kunci, lalu mencatat
 * permintaan ini untuk semua kunci hanya bila tidak ada yang penuh. Waktu memakai jam database (UTC).
 * Mengembalikan null bila boleh, atau lama tunggu terlama dalam detik beserta kunci yang penuh.
 * Bila database bermasalah, permintaan diizinkan: lebih baik tamu tetap bisa cek daripada semua terkunci.
 * Dua permintaan yang tepat bersamaan di ambang batas bisa sama-sama lolos; untuk pembatas ini tidak masalah.
 */
export async function cobaBatasTamu(daftar: Batasan[]): Promise<Penolakan | null> {
  if (daftar.length === 0) return null;
  const nilai = Prisma.join(daftar.map((b) => Prisma.sql`(${b.kunci}::text, ${b.batas}::int)`));
  try {
    const baris = await prisma.$queryRaw<{ kunci: string; tunggu: number | null }[]>`
      WITH batasan (kunci, maks) AS (VALUES ${nilai}),
      jendela AS (
        SELECT b.kunci, b.maks, count(t.id)::int AS n, min(t.waktu) AS tertua
        FROM batasan b
        LEFT JOIN "BatasTamu" t
          ON t.kunci = b.kunci AND t.waktu > (now() AT TIME ZONE 'UTC') - make_interval(secs => ${JENDELA_DETIK})
        GROUP BY b.kunci, b.maks
      ),
      penuh AS (SELECT * FROM jendela WHERE n >= maks),
      tambah AS (
        INSERT INTO "BatasTamu" (kunci, waktu)
        SELECT kunci, now() AT TIME ZONE 'UTC' FROM jendela WHERE NOT EXISTS (SELECT 1 FROM penuh)
        RETURNING 1
      )
      SELECT kunci,
        ceil(extract(epoch FROM tertua + make_interval(secs => ${JENDELA_DETIK}) - (now() AT TIME ZONE 'UTC')))::int AS tunggu
      FROM penuh`;
    // Bersihkan baris kedaluwarsa sesekali, agar tabel tidak terus tumbuh.
    if (Math.random() < 0.02) {
      await prisma.$executeRaw`DELETE FROM "BatasTamu" WHERE waktu < (now() AT TIME ZONE 'UTC') - make_interval(secs => ${JENDELA_DETIK})`;
    }
    if (baris.length === 0) return null;
    return {
      tunggu: Math.max(1, ...baris.map((b) => b.tunggu ?? JENDELA_DETIK)),
      penuh: baris.map((b) => b.kunci),
    };
  } catch (e) {
    console.warn("Batas cek tamu dilewati karena database bermasalah:", e instanceof Error ? e.message : e);
    return null;
  }
}
