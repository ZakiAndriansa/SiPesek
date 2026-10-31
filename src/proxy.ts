import { NextResponse, type NextRequest } from "next/server";
import { NAMA_COOKIE, verifikasiTokenSesi } from "@/lib/auth";
import {
  buildSession,
  COOKIE,
  homeFor,
  nextWizardHref,
  rolesFor,
  stageOf,
  stageStatus,
} from "@/lib/accounts";

// Dua penjaga dalam satu proxy (Next 16 hanya mengizinkan satu berkas):
// 1. Halaman /admin-* dan /api/admin: sesi admin asli (JWT dari POST /api/admin/masuk).
// 2. Halaman orang tua: login, peran, dan tahap terkunci (sesi berbasis cookie; data asli dijaga API).

// Penjaga lapis pertama untuk halaman admin. API admin tetap memeriksa sesi sendiri.
async function penjagaAdmin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/api/admin/masuk") return NextResponse.next();
  const sesi = await verifikasiTokenSesi(request.cookies.get(NAMA_COOKIE)?.value);
  if (sesi) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ galat: "Silakan masuk sebagai admin." }, { status: 401 });
  }
  const masuk = new URL("/masuk-petugas", request.url);
  masuk.searchParams.set("next", pathname + search);
  return NextResponse.redirect(masuk);
}

function penjagaOrangTua(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = buildSession(
    request.cookies.get(COOKIE.account)?.value,
    request.cookies.get(COOKIE.child)?.value,
    request.cookies.get(COOKIE.progress)?.value,
  );
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url));
  // Cek Cepat tidak boleh di-cache atau diindeks: isiannya pribadi dan tidak disimpan.
  const next = () => {
    const response = NextResponse.next();
    if (pathname.startsWith("/cek-cepat")) {
      response.headers.set("Cache-Control", "no-store");
      response.headers.set("X-Robots-Tag", "noindex");
    }
    return response;
  };
  if (pathname === "/masuk") return session ? go(homeFor(session)) : next();
  const roles = rolesFor(pathname);
  if (!roles) return next();
  // Halaman petugas (kebijakan, admin) punya pintu masuk sendiri, terpisah dari orang tua.
  if (!session) return go(`${roles.includes("orang-tua") ? "/masuk" : "/masuk-petugas"}?next=${encodeURIComponent(pathname + search)}`);
  if (!roles.includes(session.role)) return go(`/akses-ditolak?dari=${encodeURIComponent(pathname)}`);
  // Orang tua: Hasil, Strategi, Dokumen hanya terbuka bila data anak aktif sudah lengkap.
  // Akun Google tidak dikunci di sini: datanya ada di API, dan tiap halaman menangani anak yang belum punya hasil.
  if (session.role === "orang-tua" && session.account !== "google") {
    const stage = stageOf(pathname);
    if (stage && stage !== "data" && stageStatus(session.child)[stage] === "terkunci") {
      return go(`${nextWizardHref(session.child)}?terkunci=${stage}`);
    }
  }
  return next();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin/")) {
    return penjagaAdmin(request);
  }
  // Admin yang sudah masuk tidak perlu melihat halaman masuk petugas lagi.
  if (pathname === "/masuk-petugas" && (await verifikasiTokenSesi(request.cookies.get(NAMA_COOKIE)?.value))) {
    return NextResponse.redirect(new URL("/admin-sekolah", request.url));
  }
  return penjagaOrangTua(request);
}

export const config = {
  matcher: ["/((?!_next/|assets/|api/|favicon|icon).*)", "/api/admin/:path*"],
};
