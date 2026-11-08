import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Satu instance per proses agar hot reload Next.js tidak membuka koneksi baru terus-menerus.
const globalUntukPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buatPrisma() {
  // Gagal cepat bila koneksi tidak terbentuk (mis. Neon sedang bangun dan macet), agar klien bisa mencoba
  // lagi; bawaan pg menunggu tanpa batas sampai batas waktu fungsi Vercel habis.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
  return new PrismaClient({ adapter });
}

export const prisma = globalUntukPrisma.prisma ?? buatPrisma();

if (process.env.NODE_ENV !== "production") globalUntukPrisma.prisma = prisma;
