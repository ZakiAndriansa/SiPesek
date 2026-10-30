import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { bacaProfilOrtu, buatTokenOrtu, buatTokenSesi, verifikasiTokenOrtu, verifikasiTokenSesi } from "./auth";

const RAHASIA = "rahasia-uji-yang-panjangnya-lebih-dari-32-karakter";

beforeAll(() => {
  process.env.JWT_SECRET = RAHASIA;
});

describe("sesi admin dan orang tua", () => {
  it("token diterima oleh perannya sendiri", async () => {
    expect(await verifikasiTokenSesi(await buatTokenSesi(7))).toEqual({ adminId: 7 });
    expect(await verifikasiTokenOrtu(await buatTokenOrtu(9))).toEqual({ orangTuaId: 9, nama: null, foto: null });
  });

  it("token orang tua membawa nama dan foto Google", async () => {
    const foto = "https://lh3.googleusercontent.com/a/x=s96-c";
    expect(await verifikasiTokenOrtu(await buatTokenOrtu(3, { nama: "Bunda Sari", foto }))).toEqual({
      orangTuaId: 3,
      nama: "Bunda Sari",
      foto,
    });
  });

  it("token orang tua tidak bisa dipakai sebagai admin, dan sebaliknya", async () => {
    expect(await verifikasiTokenSesi(await buatTokenOrtu(1))).toBeNull();
    expect(await verifikasiTokenOrtu(await buatTokenSesi(1))).toBeNull();
  });

  it("menolak token tanpa audience (format lama) dan token kedaluwarsa", async () => {
    const kunci = new TextEncoder().encode(RAHASIA);
    const lama = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject("1").setExpirationTime("1h").sign(kunci);
    expect(await verifikasiTokenSesi(lama)).toBeNull();

    const kedaluwarsa = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setAudience("ortu")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(kunci);
    expect(await verifikasiTokenOrtu(kedaluwarsa)).toBeNull();
  });

  it("menolak token kosong atau rusak", async () => {
    expect(await verifikasiTokenOrtu(undefined)).toBeNull();
    expect(await verifikasiTokenOrtu("bukan.token.sah")).toBeNull();
  });
});

describe("bacaProfilOrtu", () => {
  it("membaca nama dan foto Google dari token orang tua", async () => {
    const foto = "https://lh3.googleusercontent.com/a/x=s96-c";
    expect(bacaProfilOrtu(await buatTokenOrtu(3, { nama: "Bunda Sari", foto }))).toEqual({ nama: "Bunda Sari", foto });
  });

  it("membuang foto dari luar Google dan menolak token admin atau rusak", async () => {
    expect(bacaProfilOrtu(await buatTokenOrtu(3, { foto: "https://penipu.example/a.png" }))).toEqual({ nama: null, foto: null });
    expect(bacaProfilOrtu(await buatTokenSesi(1))).toBeNull();
    expect(bacaProfilOrtu("bukan.token.sah")).toBeNull();
    expect(bacaProfilOrtu(undefined)).toBeNull();
  });
});
