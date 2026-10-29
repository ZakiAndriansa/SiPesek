import { cookies } from "next/headers";
import { NAMA_COOKIE } from "@/lib/auth";

export async function POST() {
  (await cookies()).delete(NAMA_COOKIE);
  return Response.json({ ok: true });
}
