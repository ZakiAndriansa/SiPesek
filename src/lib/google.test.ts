import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload, type JWTVerifyGetKey } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { verifikasiTokenGoogle } from "./google";

// Kunci tiruan pengganti kunci publik Google, supaya tes tidak butuh internet.
const CLIENT_ID = "uji.apps.googleusercontent.com";
let jwks: JWTVerifyGetKey;
let kunciPrivat: CryptoKey;

beforeAll(async () => {
  const pasangan = await generateKeyPair("RS256");
  kunciPrivat = pasangan.privateKey;
  jwks = createLocalJWKSet({ keys: [{ ...(await exportJWK(pasangan.publicKey)), kid: "uji", alg: "RS256" }] });
});

const tokenGoogle = (klaim: JWTPayload = {}, opsi: { iss?: string; aud?: string } = {}) =>
  new SignJWT({ email: "bunda@example.com", email_verified: true, name: "Bunda", ...klaim })
    .setProtectedHeader({ alg: "RS256", kid: "uji" })
    .setIssuer(opsi.iss ?? "https://accounts.google.com")
    .setAudience(opsi.aud ?? CLIENT_ID)
    .setSubject("1234567890")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(kunciPrivat);

describe("verifikasiTokenGoogle", () => {
  it("menerima token sah dan mengembalikan sub, email, nama", async () => {
    expect(await verifikasiTokenGoogle(await tokenGoogle(), jwks, CLIENT_ID)).toEqual({
      sub: "1234567890",
      email: "bunda@example.com",
      nama: "Bunda",
    });
  });

  it("memakai email sebagai nama bila nama kosong", async () => {
    expect(await verifikasiTokenGoogle(await tokenGoogle({ name: " " }), jwks, CLIENT_ID)).toMatchObject({
      nama: "bunda@example.com",
    });
  });

  it("menolak token untuk aplikasi lain, penerbit lain, atau email belum terverifikasi", async () => {
    expect(await verifikasiTokenGoogle(await tokenGoogle({}, { aud: "lain.apps.googleusercontent.com" }), jwks, CLIENT_ID)).toBeNull();
    expect(await verifikasiTokenGoogle(await tokenGoogle({}, { iss: "https://penipu.example" }), jwks, CLIENT_ID)).toBeNull();
    expect(await verifikasiTokenGoogle(await tokenGoogle({ email_verified: false }), jwks, CLIENT_ID)).toBeNull();
  });

  it("menolak token yang ditandatangani kunci lain", async () => {
    const lain = await generateKeyPair("RS256");
    const palsu = await new SignJWT({ email: "x@example.com", email_verified: true })
      .setProtectedHeader({ alg: "RS256", kid: "uji" })
      .setIssuer("https://accounts.google.com")
      .setAudience(CLIENT_ID)
      .setSubject("1")
      .setExpirationTime("1h")
      .sign(lain.privateKey);
    expect(await verifikasiTokenGoogle(palsu, jwks, CLIENT_ID)).toBeNull();
  });

  it("melempar galat bila GOOGLE_CLIENT_ID belum diisi", async () => {
    await expect(verifikasiTokenGoogle("apa saja", jwks, "")).rejects.toThrow("GOOGLE_CLIENT_ID");
  });
});
