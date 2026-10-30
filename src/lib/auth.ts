/**
 * Sesi admin dan orang tua berbasis cookie JWT httpOnly.
 * Keduanya memakai JWT_SECRET yang sama, jadi setiap token diberi audience sesuai perannya
 * agar token orang tua tidak bisa dipakai sebagai token admin, dan sebaliknya.
 * Modul ini sengaja tidak mengimpor database agar bisa dipakai di src/proxy.ts.
 */
import "server-only";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { galat } from "@/lib/http";

type Peran = "admin" | "ortu";

export const NAMA_COOKIE = "sipesek_sesi";
export const UMUR_SESI_DETIK = 8 * 60 * 60;

export const NAMA_COOKIE_ORTU = "sipesek_ortu";
export const UMUR_SESI_ORTU_DETIK = 7 * 24 * 60 * 60;

function kunci() {
  const rahasia = process.env.JWT_SECRET;
  if (!rahasia || rahasia.length < 32) throw new Error("JWT_SECRET belum diisi (minimal 32 karakter).");
  return new TextEncoder().encode(rahasia);
}

function buatToken(peran: Peran, id: number, umurDetik: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(id))
    .setAudience(peran)
    .setIssuedAt()
    .setExpirationTime(`${umurDetik}s`)
    .sign(kunci());
}

async function verifikasiToken(peran: Peran, token: string | undefined): Promise<number | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, kunci(), { algorithms: ["HS256"], audience: peran });
    const id = Number(payload.sub);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}

// ---------- Admin ----------

export const buatTokenSesi = (adminId: number) => buatToken("admin", adminId, UMUR_SESI_DETIK);

export async function verifikasiTokenSesi(token: string | undefined): Promise<{ adminId: number } | null> {
  const adminId = await verifikasiToken("admin", token);
  return adminId === null ? null : { adminId };
}

/** Dipakai di setiap route handler /api/admin. */
export const sesiAdmin = (request: NextRequest) => verifikasiTokenSesi(request.cookies.get(NAMA_COOKIE)?.value);

export const tolakTanpaSesi = () => galat("Silakan masuk sebagai admin.", 401);

export const opsiCookieSesi = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: UMUR_SESI_DETIK,
} as const;

// ---------- Orang tua (masuk dengan Google) ----------

export const buatTokenOrtu = (orangTuaId: number) => buatToken("ortu", orangTuaId, UMUR_SESI_ORTU_DETIK);

export async function verifikasiTokenOrtu(token: string | undefined): Promise<{ orangTuaId: number } | null> {
  const orangTuaId = await verifikasiToken("ortu", token);
  return orangTuaId === null ? null : { orangTuaId };
}

export const sesiOrtu = (request: NextRequest) => verifikasiTokenOrtu(request.cookies.get(NAMA_COOKIE_ORTU)?.value);

export const tolakTanpaSesiOrtu = () => galat("Silakan masuk dengan Google terlebih dahulu.", 401);

export const opsiCookieOrtu = { ...opsiCookieSesi, maxAge: UMUR_SESI_ORTU_DETIK } as const;
