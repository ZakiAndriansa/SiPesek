import { describe, expect, it } from "vitest";
import { perluPramuat } from "./pramuat";

describe("perluPramuat", () => {
  it("hanya saat halaman dibuka sebagai dokumen, bukan saat pindah halaman di dalam aplikasi", () => {
    expect(perluPramuat("document")).toBe(true);
    expect(perluPramuat("empty")).toBe(false); // navigasi RSC dan prefetch
    expect(perluPramuat(null)).toBe(false);
  });
});
