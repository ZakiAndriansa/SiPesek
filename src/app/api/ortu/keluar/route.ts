import { cookies } from "next/headers";
import { NAMA_COOKIE_ORTU } from "@/lib/auth";

export async function POST() {
  (await cookies()).delete(NAMA_COOKIE_ORTU);
  return Response.json({ ok: true });
}
