import { NAMA_COOKIE } from "@/lib/auth";

export async function POST() {
  const respons = Response.json({ ok: true });
  respons.headers.append("Set-Cookie", `${NAMA_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return respons;
}
