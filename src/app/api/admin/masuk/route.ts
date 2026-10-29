import bcrypt from "bcryptjs";
import { z } from "zod";
import { buatTokenSesi, NAMA_COOKIE, UMUR_SESI_DETIK } from "@/lib/auth";
import { prisma } from "@/lib/db";

const skema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const masukan = skema.safeParse(await request.json().catch(() => null));
  const gagal = () => Response.json({ galat: "Email atau kata sandi salah." }, { status: 401 });
  if (!masukan.success) return gagal();

  const admin = await prisma.admin.findUnique({ where: { email: masukan.data.email } });
  if (!admin || !(await bcrypt.compare(masukan.data.password, admin.passwordHash))) return gagal();

  const token = await buatTokenSesi(admin.id);
  const respons = Response.json({ nama: admin.nama });
  respons.headers.append(
    "Set-Cookie",
    [
      `${NAMA_COOKIE}=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${UMUR_SESI_DETIK}`,
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
  return respons;
}
