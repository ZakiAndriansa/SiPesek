import { NextResponse, type NextRequest } from "next/server";
import { NAMA_COOKIE, NAMA_COOKIE_ORTU, verifikasiTokenOrtu, verifikasiTokenSesi } from "@/lib/auth";

// Penjaga lapis pertama untuk halaman admin dan halaman orang tua. API tetap memeriksa sesi sendiri.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return jagaAdmin(request);
  return jagaOrtu(request);
}

async function jagaAdmin(request: NextRequest) {
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

// Halaman /anak, /cek, /hasil, dan /riwayat hanya untuk orang tua yang sudah masuk dengan Google.
async function jagaOrtu(request: NextRequest) {
  const sesi = await verifikasiTokenOrtu(request.cookies.get(NAMA_COOKIE_ORTU)?.value);
  if (sesi) return NextResponse.next();

  const masuk = new URL("/masuk", request.url);
  masuk.searchParams.set("lanjut", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(masuk);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/anak/:path*", "/cek/:path*", "/hasil/:path*", "/riwayat/:path*"],
};
