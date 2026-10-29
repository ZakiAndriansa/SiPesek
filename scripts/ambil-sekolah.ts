/**
 * Mengambil semua SMA dan SMK (negeri dan swasta) di Kota Depok dari
 * Data Referensi Kemendikdasmen, lalu menulis data/sekolah-depok.csv.
 *
 * Jalankan: npm run data:sekolah
 * Sumber: https://referensi.data.kemendikdasmen.go.id/pendidikan/dikmen/026600/2
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as cheerio from "cheerio";
import Papa from "papaparse";

const BASIS = "https://referensi.data.kemendikdasmen.go.id";
const JEDA_MS = 1000;
const AGEN = "SiPesek/0.1 (riset lomba MIA 2026; data publik)";

const KECAMATAN: Record<string, string> = {
  "026601": "Sawangan",
  "026602": "Pancoran Mas",
  "026603": "Sukmajaya",
  "026604": "Cimanggis",
  "026605": "Beji",
  "026606": "Limo",
  "026607": "Cipayung",
  "026608": "Cilodong",
  "026609": "Cinere",
  "026610": "Tapos",
  "026611": "Bojongsari",
};

// Kotak batas kasar Kota Depok untuk menolak koordinat yang jelas salah.
// Sisi utara -6,30 karena Kelurahan Cinere dan Pangkalan Jati berada di sekitar -6,32.
const BATAS = { latMin: -6.46, latMax: -6.3, lngMin: 106.71, lngMax: 106.92 };

type BarisDaftar = { npsn: string; nama: string; alamat: string; kelurahan: string; status: string; kecamatan: string };

type Sekolah = {
  npsn: string;
  nama: string;
  jenjang: "SMA" | "SMK";
  status: "NEGERI" | "SWASTA";
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  lat: number | null;
  lng: number | null;
  akreditasi: string;
  sumber_url: string;
  diambil_pada: string;
};

const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ambilHtml(url: string): Promise<string> {
  for (let percobaan = 1; percobaan <= 3; percobaan++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": AGEN } });
      if (res.ok) return await res.text();
      console.warn(`  HTTP ${res.status} ${url} (percobaan ${percobaan})`);
    } catch (e) {
      console.warn(`  gagal ${url} (percobaan ${percobaan}): ${(e as Error).message}`);
    }
    await tidur(JEDA_MS * percobaan * 2);
  }
  throw new Error(`Gagal mengambil ${url}`);
}

const bersih = (s: string) => s.replace(/\s+/g, " ").trim();

function bacaDaftar(html: string, kecamatan: string): BarisDaftar[] {
  const $ = cheerio.load(html);
  return $("#table1 tbody tr")
    .toArray()
    .map((tr) => {
      const td = $(tr).find("td");
      return {
        npsn: bersih(td.eq(1).text()),
        nama: bersih(td.eq(2).text()),
        alamat: bersih(td.eq(3).text()),
        kelurahan: bersih(td.eq(4).text()),
        status: bersih(td.eq(5).text()).toUpperCase(),
        kecamatan,
      };
    })
    .filter((b) => b.npsn);
}

// MA, MAS, MAN, dan SLB jelas bukan SMA/SMK, jadi detailnya tidak perlu diambil.
// Nama lain tetap dicek lewat "Bentuk Pendidikan", karena ada SMK yang namanya
// ditulis lengkap ("SEKOLAH MENENGAH KEJURUAN NEGERI 5 KOTA DEPOK").
const bukanSmaSmk = (nama: string) => /^(MA|MAS|MAN|SLB)\b/i.test(nama);

function bacaDetail(html: string) {
  const $ = cheerio.load(html);
  const nilai = (label: string) => {
    for (const tr of $("tr").toArray()) {
      const td = $(tr).find("td");
      if (td.length >= 4 && bersih(td.eq(1).text()) === label) return bersih(td.eq(3).text());
    }
    return "";
  };
  const teks = $.root().text();
  const lat = Number(/Lintang:\s*(-?[\d.]+)/.exec(teks)?.[1]);
  const lng = Number(/Bujur:\s*(-?[\d.]+)/.exec(teks)?.[1]);
  return {
    bentuk: nilai("Bentuk Pendidikan").toUpperCase(),
    akreditasi: nilai("Akreditasi"),
    alamat: nilai("Alamat"),
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

const dalamDepok = (lat: number | null, lng: number | null) =>
  lat !== null &&
  lng !== null &&
  lat >= BATAS.latMin &&
  lat <= BATAS.latMax &&
  lng >= BATAS.lngMin &&
  lng <= BATAS.lngMax;

async function main() {
  const diambilPada = new Date().toISOString().slice(0, 10);
  const daftar: BarisDaftar[] = [];

  for (const [kode, kecamatan] of Object.entries(KECAMATAN)) {
    const baris = bacaDaftar(await ambilHtml(`${BASIS}/pendidikan/dikmen/${kode}/3`), kecamatan);
    console.log(`${kecamatan}: ${baris.length} satuan pendidikan`);
    daftar.push(...baris);
    await tidur(JEDA_MS);
  }

  const kandidat = daftar.filter((b) => !bukanSmaSmk(b.nama));
  console.log(`\nMengambil detail ${kandidat.length} sekolah (sekitar ${kandidat.length} detik)...`);

  const hasil: Sekolah[] = [];
  const bentukLain: string[] = [];
  const tanpaKoordinat: string[] = [];
  const gagal: string[] = [];

  for (const [i, b] of kandidat.entries()) {
    const url = `${BASIS}/pendidikan/npsn/${b.npsn}`;
    let d: ReturnType<typeof bacaDetail>;
    try {
      d = bacaDetail(await ambilHtml(url));
    } catch {
      gagal.push(`${b.npsn} ${b.nama}`);
      continue;
    } finally {
      await tidur(JEDA_MS);
    }
    if (d.bentuk !== "SMA" && d.bentuk !== "SMK") {
      bentukLain.push(`${b.npsn} ${b.nama} (${d.bentuk || "kosong"})`);
      continue;
    }
    const koordinatSah = dalamDepok(d.lat, d.lng);
    if (!koordinatSah) tanpaKoordinat.push(`${b.npsn} ${b.nama} (${d.lat}, ${d.lng})`);
    hasil.push({
      npsn: b.npsn,
      nama: b.nama,
      jenjang: d.bentuk,
      status: b.status === "NEGERI" ? "NEGERI" : "SWASTA",
      alamat: d.alamat || b.alamat,
      kelurahan: b.kelurahan,
      kecamatan: b.kecamatan,
      lat: koordinatSah ? d.lat : null,
      lng: koordinatSah ? d.lng : null,
      akreditasi: d.akreditasi,
      sumber_url: url,
      diambil_pada: diambilPada,
    });
    if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${kandidat.length}`);
  }

  hasil.sort((a, b) => a.kecamatan.localeCompare(b.kecamatan) || a.nama.localeCompare(b.nama));
  writeFileSync(join("data", "sekolah-depok.csv"), Papa.unparse(hasil) + "\n");

  console.log(`\n== Laporan ==`);
  console.log(`Ditulis: data/sekolah-depok.csv (${hasil.length} sekolah)`);
  for (const kecamatan of Object.values(KECAMATAN)) {
    const di = hasil.filter((s) => s.kecamatan === kecamatan);
    const hitung = (j: string, st: string) => di.filter((s) => s.jenjang === j && s.status === st).length;
    console.log(
      `  ${kecamatan.padEnd(13)} SMA ${hitung("SMA", "NEGERI")} negeri + ${hitung("SMA", "SWASTA")} swasta | ` +
        `SMK ${hitung("SMK", "NEGERI")} negeri + ${hitung("SMK", "SWASTA")} swasta`,
    );
  }
  const negeri = hasil.filter((s) => s.status === "NEGERI");
  console.log(`Negeri: ${negeri.length} (rencana: 20)`);
  for (const s of negeri) console.log(`  ${s.npsn} ${s.nama}`);
  console.log(`Tanpa koordinat sah: ${tanpaKoordinat.length}`);
  for (const s of tanpaKoordinat) console.log(`  ${s}`);
  console.log(`Dilewati karena bentuk bukan SMA/SMK: ${bentukLain.length}`);
  for (const s of bentukLain) console.log(`  ${s}`);
  if (gagal.length) {
    console.log(`GAGAL diambil, jalankan ulang script: ${gagal.length}`);
    for (const s of gagal) console.log(`  ${s}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
