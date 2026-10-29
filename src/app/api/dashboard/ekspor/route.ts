import type { NextRequest } from "next/server";
import Papa from "papaparse";
import { muatDashboard, tahunAktif } from "@/lib/dashboard";
import type { ResponsGalat } from "@/lib/kontrak";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const diminta = Number(q.get("tahun"));
  const tahun = Number.isInteger(diminta) && diminta > 0 ? diminta : await tahunAktif();
  const jenis = q.get("jenis") === "kecamatan" ? "kecamatan" : "sekolah";
  if (!tahun) return Response.json({ galat: "Belum ada data SPMB." } satisfies ResponsGalat, { status: 404 });

  const d = await muatDashboard(tahun);
  const baris: Record<string, string | number>[] =
    jenis === "sekolah"
      ? d.sekolah.map((s) => ({
          npsn: s.sekolah.npsn,
          sekolah: s.sekolah.nama,
          jenjang: s.sekolah.jenjang,
          kecamatan: s.sekolah.kecamatan,
          rayon: s.sekolah.rayonKode ?? "",
          pendaftar: s.pendaftar ?? "",
          pendaftar_pilihan_1: s.pendaftarPilihan1 ?? "",
          diterima: s.diterima,
          pilihan_1_per_kursi_terisi: s.tekanan ?? "",
          radius_domisili_meter: s.radiusDomisiliMeter ?? "",
          daya_tampung: s.dayaTampung ?? "",
          kursi_kosong: s.kursiKosong ?? "",
        }))
      : d.kecamatan.map((k) => ({
          kecamatan: k.kecamatan,
          cakupan: k.cakupan,
          pendaftar_unik: k.pendaftarUnik,
          diterima_unik: k.diterimaUnik,
          persen_diterima: k.persenDiterima,
        }));

  // BOM agar Excel membaca UTF-8 dengan benar.
  return new Response("﻿" + Papa.unparse(baris), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="petakursi-${jenis}-${tahun}.csv"`,
    },
  });
}
