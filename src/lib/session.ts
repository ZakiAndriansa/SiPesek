import { cookies } from "next/headers";
import { buildSession, COOKIE, type Session } from "./accounts";

/** Sesi dari cookie untuk Server Component. Null = tamu. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return buildSession(
    store.get(COOKIE.account)?.value,
    store.get(COOKIE.child)?.value,
    store.get(COOKIE.progress)?.value,
  );
}
