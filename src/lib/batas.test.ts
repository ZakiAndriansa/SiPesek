import { describe, expect, it } from "vitest";
import { ipKlien } from "./batas";

describe("ipKlien", () => {
  it("mendahulukan header Vercel, lalu x-real-ip, lalu entri pertama x-forwarded-for", () => {
    expect(ipKlien(new Headers({ "x-vercel-forwarded-for": "1.1.1.1", "x-forwarded-for": "9.9.9.9" }))).toBe("1.1.1.1");
    expect(ipKlien(new Headers({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "9.9.9.9" }))).toBe("2.2.2.2");
    expect(ipKlien(new Headers({ "x-forwarded-for": "3.3.3.3, 10.0.0.1" }))).toBe("3.3.3.3");
    expect(ipKlien(new Headers())).toBeNull();
  });
});
