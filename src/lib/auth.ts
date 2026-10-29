/**
 * Sesi admin berbasis cookie JWT httpOnly.
 * Modul ini sengaja tidak mengimpor database agar bisa dipakai di src/proxy.ts.
 */
import "server-only";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { galat } from "@/lib/http";

export const NAMA_COOKIE = "sipesek_sesi";
export const UMUR_SESI_DETIK = 8 * 60 * 60;

function kunci() {
  const rahasia = process.env.JWT_SECRET;
  if (!rahasia || rahasia.length < 32) throw new Error("JWT_SECRET belum diisi (minimal 32 karakter).");
  return new TextEncoder().encode(rahasia);
}

export async function buatTokenSesi(adminId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(`${UMUR_SESI_DETIK}s`)
    .sign(kunci());
}

export async function verifikasiTokenSesi(token: string | undefined): Promise<{ adminId: number } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, kunci(), { algorithms: ["HS256"] });
    const adminId = Number(payload.sub);
    return Number.isInteger(adminId) ? { adminId } : null;
  } catch {
    return null;
  }
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
