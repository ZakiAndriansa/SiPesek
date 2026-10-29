import { NextResponse, type NextRequest } from "next/server";
import { NAMA_COOKIE, verifikasiTokenSesi } from "@/lib/auth";

// Penjaga lapis pertama untuk halaman admin. API admin tetap memeriksa sesi sendiri.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/masuk" || pathname === "/api/admin/masuk") return NextResponse.next();

  const sesi = await verifikasiTokenSesi(request.cookies.get(NAMA_COOKIE)?.value);
  if (sesi) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ galat: "Silakan masuk sebagai admin." }, { status: 401 });
  }
  const masuk = new URL("/admin/masuk", request.url);
  masuk.searchParams.set("lanjut", pathname);
  return NextResponse.redirect(masuk);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
