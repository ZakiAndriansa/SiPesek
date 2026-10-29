import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { buatTokenSesi, NAMA_COOKIE, opsiCookieSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";

const skema = z.object({ email: z.email(), password: z.string().min(1).max(200) });
const PESAN_GAGAL = "Email atau kata sandi salah.";

export async function POST(request: Request) {
  const masukan = await bacaJson(request, skema, PESAN_GAGAL);
  if ("gagal" in masukan) return galat(PESAN_GAGAL, 401);

  const admin = await prisma.admin.findUnique({ where: { email: masukan.data.email } });
  if (!admin || !(await bcrypt.compare(masukan.data.password, admin.passwordHash))) return galat(PESAN_GAGAL, 401);

  (await cookies()).set(NAMA_COOKIE, await buatTokenSesi(admin.id), opsiCookieSesi);
  return Response.json({ nama: admin.nama });
}
