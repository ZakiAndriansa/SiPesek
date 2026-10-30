// Draf Cek Cepat hanya hidup di memori tab ini (variabel modul).
// SENGAJA tidak memakai cookie, localStorage, sessionStorage, atau URL: menutup tab atau
// memuat ulang halaman menghapusnya. Draf ditulis hanya saat orang tua menekan "Simpan hasil ini ke akun".
import type { QuickDraft } from "@/lib/quick-check";

let draft: QuickDraft | null = null;

export const getDraft = () => draft;
export const setDraft = (value: QuickDraft) => {
  draft = value;
};
export const clearDraft = () => {
  draft = null;
};
