import { cookies } from "next/headers";
import { buatTokenOrtu, NAMA_COOKIE_ORTU, opsiCookieOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifikasiTokenGoogle } from "@/lib/google";
import { bacaJson, galat } from "@/lib/http";
import type { ResponsOrtu } from "@/lib/kontrak";
import { skemaMasukGoogle } from "@/lib/validasi";

const PESAN_GAGAL = "Masuk dengan Google gagal. Silakan coba lagi.";

// Browser mengirim ID token dari tombol Google; yang disimpan hanya ID Google, email, dan nama.
// Foto profil hanya ikut di token sesi untuk ditampilkan di header, tidak disimpan di database.
export async function POST(request: Request) {
  const masukan = await bacaJson(request, skemaMasukGoogle, PESAN_GAGAL);
  if ("gagal" in masukan) return galat(PESAN_GAGAL, 400);

  const akun = await verifikasiTokenGoogle(masukan.data.credential);
  if (!akun) return galat(PESAN_GAGAL, 401);

  const data = { email: akun.email, nama: akun.nama, terakhirMasuk: new Date() };
  const ortu = await prisma.orangTua.upsert({
    where: { googleSub: akun.sub },
    update: data,
    create: { googleSub: akun.sub, ...data },
  });

  const token = await buatTokenOrtu(ortu.id, { nama: ortu.nama, foto: akun.foto });
  (await cookies()).set(NAMA_COOKIE_ORTU, token, opsiCookieOrtu);
  return Response.json({ nama: ortu.nama, email: ortu.email, foto: akun.foto } satisfies ResponsOrtu);
}
