import { afterEach, describe, expect, it, vi } from "vitest";
import { ambil, WaktuHabis } from "./ambil";

const res = (status: number) => ({ status, ok: status < 300 }) as Response;
afterEach(() => vi.unstubAllGlobals());

describe("ambil", () => {
  it("GET dicoba ulang sekali bila server 503 (misal cold start), lalu berhasil", async () => {
    const f = vi.fn().mockResolvedValueOnce(res(503)).mockResolvedValueOnce(res(200));
    vi.stubGlobal("fetch", f);
    expect((await ambil("/api/x")).status).toBe(200);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("GET dicoba ulang sekali bila jaringan putus", async () => {
    const f = vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValueOnce(res(200));
    vi.stubGlobal("fetch", f);
    expect((await ambil("/api/x")).status).toBe(200);
  });

  it("POST tidak pernah dicoba ulang otomatis", async () => {
    const f = vi.fn().mockResolvedValue(res(503));
    vi.stubGlobal("fetch", f);
    expect((await ambil("/api/x", { method: "POST" })).status).toBe(503);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("menyerah dengan WaktuHabis bila server tidak menjawab", async () => {
    const f = vi.fn(
      (_: string, init: RequestInit) =>
        new Promise<Response>((_, tolak) => init.signal!.addEventListener("abort", () => tolak(init.signal!.reason))),
    );
    vi.stubGlobal("fetch", f);
    await expect(ambil("/api/x", { batasMs: 20, ulang: 0 })).rejects.toBeInstanceOf(WaktuHabis);
  });

  it("4xx tidak dicoba ulang", async () => {
    const f = vi.fn().mockResolvedValue(res(404));
    vi.stubGlobal("fetch", f);
    expect((await ambil("/api/x")).status).toBe(404);
    expect(f).toHaveBeenCalledTimes(1);
  });
});
