/**
 * Sesi admin dan orang tua berbasis cookie JWT httpOnly.
 * Keduanya memakai JWT_SECRET yang sama, jadi setiap token diberi audience sesuai perannya
 * agar token orang tua tidak bisa dipakai sebagai token admin, dan sebaliknya.
 * Modul ini sengaja tidak mengimpor database agar bisa dipakai di src/proxy.ts.
 */
import "server-only";
import { decodeJwt, jwtVerify, SignJWT, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { fotoGoogle } from "@/lib/foto-google";
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

function buatToken(peran: Peran, id: number, umurDetik: number, klaim: Record<string, string> = {}): Promise<string> {
  return new SignJWT(klaim)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(id))
    .setAudience(peran)
    .setIssuedAt()
    .setExpirationTime(`${umurDetik}s`)
    .sign(kunci());
}

async function verifikasiToken(peran: Peran, token: string | undefined): Promise<{ id: number; payload: JWTPayload } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, kunci(), { algorithms: ["HS256"], audience: peran });
    const id = Number(payload.sub);
    return Number.isInteger(id) ? { id, payload } : null;
  } catch {
    return null;
  }
}

// ---------- Admin ----------

/** Nama admin ikut ditandatangani agar header dashboard (tanpa akses database) bisa menampilkannya. */
export const buatTokenSesi = (adminId: number, nama?: string) =>
  buatToken("admin", adminId, UMUR_SESI_DETIK, nama ? { nama } : {});

export async function verifikasiTokenSesi(token: string | undefined): Promise<{ adminId: number } | null> {
  const sesi = await verifikasiToken("admin", token);
  return sesi === null ? null : { adminId: sesi.id };
}

/** Dipakai di setiap route handler /api/admin. */
export const sesiAdmin = (request: NextRequest) => verifikasiTokenSesi(request.cookies.get(NAMA_COOKIE)?.value);

export const tolakTanpaSesi = () => galat("Silakan masuk sebagai admin.", 401);

/**
 * Nama admin untuk header halaman, hanya membaca isi token tanpa memeriksa tanda tangan maupun masa berlaku
 * (sama seperti bacaProfilOrtu; cookie-nya sendiri berumur sama dengan token). Halaman /admin-* tetap dijaga
 * proxy dengan verifikasiTokenSesi, dan API admin memeriksa sendiri.
 */
export function bacaProfilAdmin(token: string | undefined): { nama: string } | null {
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    if (payload.aud !== "admin") return null;
    return { nama: teks(payload.nama) ?? "Admin" };
  } catch {
    return null;
  }
}

export const opsiCookieSesi = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: UMUR_SESI_DETIK,
} as const;

// ---------- Orang tua (masuk dengan Google) ----------

/**
 * Nama dan foto Google ikut ditandatangani di token agar header halaman (yang disajikan Vercel, tanpa
 * akses database) bisa menampilkannya. Foto tidak disimpan di database.
 */
export type ProfilOrtu = { nama: string | null; foto: string | null };

export const buatTokenOrtu = (orangTuaId: number, profil: Partial<ProfilOrtu> = {}) => {
  const klaim: Record<string, string> = {};
  if (profil.nama) klaim.nama = profil.nama;
  if (profil.foto) klaim.foto = profil.foto;
  return buatToken("ortu", orangTuaId, UMUR_SESI_ORTU_DETIK, klaim);
};

const teks = (v: unknown) => (typeof v === "string" && v ? v : null);

export async function verifikasiTokenOrtu(token: string | undefined): Promise<({ orangTuaId: number } & ProfilOrtu) | null> {
  const sesi = await verifikasiToken("ortu", token);
  return sesi === null ? null : { orangTuaId: sesi.id, nama: teks(sesi.payload.nama), foto: teks(sesi.payload.foto) };
}

/**
 * Nama dan foto untuk header halaman. Hanya membaca isi token tanpa memeriksa tanda tangan, karena
 * dipakai untuk tampilan saja (setara cookie sesi prototipe) dan pemeriksaan kripto di render halaman
 * membuat Next menganggapnya data tak-tercache. Akses data tetap lewat API yang memakai verifikasiTokenOrtu.
 */
export function bacaProfilOrtu(token: string | undefined): ProfilOrtu | null {
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    if (payload.aud !== "ortu") return null;
    return { nama: teks(payload.nama), foto: fotoGoogle(payload.foto) };
  } catch {
    return null;
  }
}

export const sesiOrtu = (request: NextRequest) => verifikasiTokenOrtu(request.cookies.get(NAMA_COOKIE_ORTU)?.value);

export const tolakTanpaSesiOrtu = () => galat("Silakan masuk dengan Google terlebih dahulu.", 401);

export const opsiCookieOrtu = { ...opsiCookieSesi, maxAge: UMUR_SESI_ORTU_DETIK } as const;
