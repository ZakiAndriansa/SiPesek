// Draf Cek Cepat hanya hidup di memori tab ini (variabel modul).
// SENGAJA tidak memakai cookie, localStorage, sessionStorage, atau URL: menutup tab atau
// memuat ulang halaman menghapusnya. Draf ditulis hanya saat orang tua menekan tombol simpan,
// dan bertahan selama pindah halaman di dalam aplikasi (termasuk masuk dengan Google).
import type { ResponsPeluang } from "@/lib/kontrak";
import type { QuickCheckInput, QuickDraft } from "@/lib/quick-check";

let draft: QuickDraft | null = null;

export const getDraft = () => draft;
export const setDraft = (value: QuickDraft) => {
  draft = value;
};
export const clearDraft = () => {
  draft = null;
};

// Hasil yang baru disimpan, lengkap dengan rincian skor dan isian (keduanya tidak disimpan di server),
// supaya halaman /hasil/[token] tepat setelah simpan tampil sama seperti di Cek Cepat.
/** `pesan`: kalimat sukses di atas hasil, mis. anak baru ditambahkan atau hasil masuk ke riwayat. */
type BaruDisimpan = { result: ResponsPeluang; input: QuickCheckInput; pesan: string };
let baruDisimpan: BaruDisimpan | null = null;

export const setBaruDisimpan = (value: BaruDisimpan) => {
  baruDisimpan = value;
};
export const ambilBaruDisimpan = (token: string) => (baruDisimpan?.result.token === token ? baruDisimpan : null);
