import { describe, expect, it } from "vitest";
import { bacaIdAnak, tentukanAnakAktif } from "./anak-aktif";

const a = (id: number, cek: number) => ({ id, riwayat: Array.from({ length: cek }) });

describe("tentukanAnakAktif", () => {
  it("memakai pilihan terakhir bila anaknya masih ada, walau belum punya hasil", () => {
    expect(tentukanAnakAktif([a(1, 3), a(2, 0)], 2)).toBe(2);
  });
  it("pilihan yang sudah tidak ada: anak pertama yang punya hasil", () => {
    expect(tentukanAnakAktif([a(1, 0), a(2, 4), a(3, 1)], 9)).toBe(2);
  });
  it("tanpa pilihan dan tanpa hasil: anak pertama; tanpa anak: null", () => {
    expect(tentukanAnakAktif([a(5, 0), a(6, 0)], null)).toBe(5);
    expect(tentukanAnakAktif([], 1)).toBeNull();
  });
});

describe("bacaIdAnak", () => {
  it("hanya menerima bilangan bulat positif", () => {
    expect(bacaIdAnak("12")).toBe(12);
    for (const v of [null, undefined, "", "0", "-3", "1.5", "abc"]) expect(bacaIdAnak(v)).toBeNull();
  });
});
