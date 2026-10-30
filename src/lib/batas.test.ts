import { describe, expect, it } from "vitest";
import { ipKlien, PembatasJendela } from "./batas";

const JAM = 60 * 60 * 1000;

describe("PembatasJendela", () => {
  it("mengizinkan 10 permintaan per jam lalu menolak yang ke-11", () => {
    const p = new PembatasJendela(10, JAM, () => 0);
    for (let i = 0; i < 10; i++) expect(p.coba("1.2.3.4")).toBeNull();
    expect(p.coba("1.2.3.4")).toBe(3600);
  });

  it("menghitung setiap IP terpisah", () => {
    const p = new PembatasJendela(1, JAM, () => 0);
    expect(p.coba("a")).toBeNull();
    expect(p.coba("b")).toBeNull();
    expect(p.coba("a")).not.toBeNull();
  });

  it("jendela bergeser: kuota kembali setelah permintaan tertua lewat satu jam", () => {
    let t = 0;
    const p = new PembatasJendela(2, JAM, () => t);
    p.coba("a");
    t = 30 * 60 * 1000;
    p.coba("a");
    expect(p.coba("a")).toBe(30 * 60);
    t = JAM + 1;
    expect(p.coba("a")).toBeNull();
    expect(p.coba("a")).not.toBeNull();
  });
});

describe("ipKlien", () => {
  it("mendahulukan header Vercel, lalu x-real-ip, lalu entri pertama x-forwarded-for", () => {
    expect(ipKlien(new Headers({ "x-vercel-forwarded-for": "1.1.1.1", "x-forwarded-for": "9.9.9.9" }))).toBe("1.1.1.1");
    expect(ipKlien(new Headers({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "9.9.9.9" }))).toBe("2.2.2.2");
    expect(ipKlien(new Headers({ "x-forwarded-for": "3.3.3.3, 10.0.0.1" }))).toBe("3.3.3.3");
    expect(ipKlien(new Headers())).toBeNull();
  });
});
