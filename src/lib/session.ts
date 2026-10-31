import { cookies } from "next/headers";
import { buildSession, COOKIE, type Session } from "./accounts";
import { bacaProfilAdmin, bacaProfilOrtu, NAMA_COOKIE, NAMA_COOKIE_ORTU } from "./auth";

/** Sesi dari cookie untuk Server Component. Null = tamu. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  // Admin asli (email dan kata sandi, JWT) didahulukan dari sesi prototipe.
  const admin = bacaProfilAdmin(store.get(NAMA_COOKIE)?.value);
  if (admin) return { account: "admin", role: "admin", name: admin.nama, photo: null, children: [], child: null };
  const session = buildSession(
    store.get(COOKIE.account)?.value,
    store.get(COOKIE.child)?.value,
    store.get(COOKIE.progress)?.value,
  );
  if (session?.account !== "google") return session;
  // Akun Google: nama dan foto dari token sesi Google, bukan dari data contoh.
  const profil = bacaProfilOrtu(store.get(NAMA_COOKIE_ORTU)?.value);
  return profil ? { ...session, name: profil.nama ?? session.name, photo: profil.foto } : session;
}
