import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { muatDataMesin } from "@/lib/peluang/muat";

const TANPA_CACHE = { "Cache-Control": "no-store" } as const;

/**
 * Diketuk pinger (`.github/workflows/pinger.yml`) selama masa penilaian, agar database Neon tidak tidur
 * dan fungsi Vercel tetap hangat beserta cache data mesin peluang. Murah: satu `SELECT 1`, data mesin
 * biasanya sudah ada di cache. 503 bila database tidak bisa dihubungi.
 */
export async function GET() {
  await connection(); // selalu dijalankan saat diminta, tidak pernah dirender saat build
  const mulai = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbMs = Math.round(performance.now() - mulai);
    await muatDataMesin();
    return Response.json({ ok: true, dbMs }, { headers: TANPA_CACHE });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: TANPA_CACHE });
  }
}
