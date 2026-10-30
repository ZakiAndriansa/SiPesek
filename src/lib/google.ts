/**
 * Verifikasi ID token dari tombol "Masuk dengan Google" (Google Identity Services).
 * Tanda tangan dicek dengan kunci publik Google, jadi tidak butuh client secret.
 */
import "server-only";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { fotoGoogle } from "@/lib/foto-google";

const JWKS_GOOGLE = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type AkunGoogle = { sub: string; email: string; nama: string; foto: string | null };


/** Mengembalikan null bila token tidak sah, kedaluwarsa, bukan untuk aplikasi ini, atau email belum terverifikasi. */
export async function verifikasiTokenGoogle(
  credential: string,
  jwks: JWTVerifyGetKey = JWKS_GOOGLE,
  clientId = process.env.GOOGLE_CLIENT_ID,
): Promise<AkunGoogle | null> {
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID belum diisi.");
  try {
    const { payload } = await jwtVerify(credential, jwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
      algorithms: ["RS256"],
    });
    if (!payload.sub || payload.email_verified !== true || typeof payload.email !== "string") return null;
    const nama = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : payload.email;
    return { sub: payload.sub, email: payload.email, nama, foto: fotoGoogle(payload.picture) };
  } catch {
    return null;
  }
}
