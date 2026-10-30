import { cookies } from "next/headers";
import { buildSession, COOKIE, type Session } from "./accounts";
import { bacaProfilOrtu, NAMA_COOKIE_ORTU } from "./auth";

/** Sesi dari cookie untuk Server Component. Null = tamu. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
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
