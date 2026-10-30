"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, parseProgress } from "./accounts";
import { draftToWizard, validateInput, type QuickCheckInput } from "./quick-check";
import { getSession } from "./session";


const OPTS = { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 30 } as const;

/**
 * Pindahkan isian cek cepat ke akun. Hanya untuk orang tua yang login, dan hanya bila
 * orang tua menyetujui. Inilah satu-satunya tempat data cek cepat ditulis.
 * Perhitungan Cek Cepat sendiri (estimate) berjalan penuh di browser, tanpa server action.
 */
export async function importQuickCheck(payload: {
  nama: string;
  setuju: boolean;
  input: QuickCheckInput;
}): Promise<{ ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "orang-tua") return { ok: false, error: "Masuk dulu sebagai orang tua untuk menyimpan." };
  if (payload?.setuju !== true) return { ok: false, error: "Centang persetujuan untuk menyimpan data ke akun." };
  const nama = String(payload?.nama ?? "").trim().slice(0, 60);
  if (!nama) return { ok: false, error: "Nama anak belum diisi. Tulis nama seperti di akta kelahiran." };
  // Titik rumah tidak pernah dikirim ke server; orang tua menandainya lagi di langkah 5.
  if (payload.input?.lokasi) return { ok: false, error: "Titik rumah tidak ikut dipindahkan. Tandai ulang di langkah 5." };
  const error = validateInput(payload.input);
  if (error) return { ok: false, error };

  const store = await cookies();
  const childId = `anak-${Date.now()}`;
  const progress = parseProgress(store.get(COOKIE.progress)?.value);
  progress[childId] = { steps: 4, name: nama, data: draftToWizard(payload.input, nama) };
  store.set(COOKIE.progress, JSON.stringify(progress), OPTS);
  store.set(COOKIE.child, childId, OPTS);
  redirect("/isi-data/5?dari=cek-cepat");
}
