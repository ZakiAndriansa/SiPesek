"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NAMA_COOKIE_ORTU } from "./auth";
import {
  ACCOUNTS,
  buildSession,
  COOKIE,
  homeFor,
  nextWizardHref,
  parseProgress,
  stageOf,
  stageStatus,
  safeNext,
  WIZARD_TOTAL,
  type AccountKey,
} from "./accounts";

const OPTS = { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 30 } as const;

/** Masuk (tiruan): simpan akun, pilih anak aktif, lalu arahkan sesuai aturan routing. */
export async function signIn(account: string, next?: string) {
  if (!Object.prototype.hasOwnProperty.call(ACCOUNTS, account)) return;
  const store = await cookies();
  store.set(COOKIE.account, account, OPTS);
  const seed = ACCOUNTS[account as AccountKey];
  store.set(COOKIE.child, seed.children[0]?.id ?? `anak-${Date.now()}`, OPTS);
  store.delete(COOKIE.progress);
  const session = buildSession(account, store.get(COOKIE.child)?.value, undefined)!;
  redirect(safeNext(next, session) ?? homeFor(session));
}

export async function signOut() {
  const store = await cookies();
  for (const name of Object.values(COOKIE)) store.delete(name);
  store.delete(NAMA_COOKIE_ORTU);
  redirect("/");
}

/**
 * Sesi Google di API sudah habis (401) tetapi sesi prototipe masih ada: hapus keduanya tanpa pindah halaman,
 * supaya /masuk bisa dibuka lagi dan draf Cek Cepat di memori tab tidak hilang.
 */
export async function lupakanSesi() {
  const store = await cookies();
  for (const name of Object.values(COOKIE)) store.delete(name);
  store.delete(NAMA_COOKIE_ORTU);
}

/** Ganti anak aktif lalu kembali ke halaman yang sama (proxy mengalihkan bila tahap terkunci). */
export async function selectChild(formData: FormData) {
  const id = String(formData.get("anak") ?? "");
  const back = String(formData.get("kembali") ?? "/anak-saya");
  const store = await cookies();
  const session = buildSession(
    store.get(COOKIE.account)?.value,
    id,
    store.get(COOKIE.progress)?.value,
  );
  const child = session?.children.find((c) => c.id === id);
  if (child) store.set(COOKIE.child, id, OPTS);
  const target = back.startsWith("/") && !back.startsWith("//") ? back : "/anak-saya";
  // Arahkan langsung bila tahap terkunci untuk anak ini, supaya URL di browser ikut benar.
  const stage = stageOf(target.split(/[?#]/)[0]);
  if (child && stage && stage !== "data" && stageStatus(child)[stage] === "terkunci") {
    redirect(`${nextWizardHref(child)}?terkunci=${stage}`);
  }
  redirect(target);
}

/** Mulai profil anak baru di wizard. */
export async function addChild() {
  const store = await cookies();
  store.set(COOKIE.child, `anak-${Date.now()}`, OPTS);
  redirect("/isi-data/1");
}

/** Autosave tiruan: catat langkah wizard yang sudah disimpan untuk anak aktif. */
export async function saveStep(step: number, name?: string) {
  const store = await cookies();
  const childId = store.get(COOKIE.child)?.value;
  if (!childId || !Number.isInteger(step) || step < 1 || step > WIZARD_TOTAL) return;
  const progress = parseProgress(store.get(COOKIE.progress)?.value);
  const current = progress[childId] ?? { steps: 0 };
  progress[childId] = {
    steps: Math.max(current.steps, step),
    name: name?.trim().slice(0, 60) || current.name,
  };
  store.set(COOKIE.progress, JSON.stringify(progress), OPTS);
}
