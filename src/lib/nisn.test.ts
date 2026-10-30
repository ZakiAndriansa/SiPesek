import { describe, expect, it } from "vitest";
import { periksaNisn, sidikNisn } from "./nisn";

const PEPPER = "pepper-uji-yang-panjangnya-lebih-dari-32-karakter";

describe("periksaNisn", () => {
  it("menolak yang bukan 10 digit angka", () => {
    expect(periksaNisn("011234567").sah).toBe(false);
    expect(periksaNisn("01123456789").sah).toBe(false);
    expect(periksaNisn("01123456a8").sah).toBe(false);
    expect(periksaNisn("").sah).toBe(false);
  });

  it("awalan 0 atau 3 dengan tahun lahir calon siswa dianggap lazim", () => {
    expect(periksaNisn("0111234567", 2026)).toEqual({ sah: true, nisn: "0111234567", lazim: true, nisnAkhir: "567" });
    expect(periksaNisn("3101234567", 2026)).toMatchObject({ sah: true, lazim: true });
    expect(periksaNisn("0081234567", 2026)).toMatchObject({ lazim: true });
    expect(periksaNisn("0141234567", 2026)).toMatchObject({ lazim: true });
  });

  it("menerima tetapi menandai NISN yang tidak lazim", () => {
    expect(periksaNisn("0171234567", 2026)).toMatchObject({ sah: true, lazim: false });
    expect(periksaNisn("7111234567", 2026)).toMatchObject({ sah: true, lazim: false });
    expect(periksaNisn("0071234567", 2026)).toMatchObject({ sah: true, lazim: false });
  });

  it("mengabaikan spasi", () => {
    expect(periksaNisn(" 011 123 4567 ", 2026)).toMatchObject({ sah: true, nisn: "0111234567" });
  });
});

describe("sidikNisn", () => {
  it("konsisten untuk pepper yang sama dan berbeda untuk pepper lain", () => {
    expect(sidikNisn("0111234567", PEPPER)).toBe(sidikNisn("0111234567", PEPPER));
    expect(sidikNisn("0111234567", PEPPER)).not.toBe(sidikNisn("0111234567", `${PEPPER}x`));
    expect(sidikNisn("0111234567", PEPPER)).not.toContain("0111234567");
  });

  it("menolak pepper kosong atau pendek", () => {
    expect(() => sidikNisn("0111234567", "pendek")).toThrow();
    expect(() => sidikNisn("0111234567", "")).toThrow();
  });
});
