-- CreateEnum
CREATE TYPE "Jenjang" AS ENUM ('SMA', 'SMK');

-- CreateEnum
CREATE TYPE "StatusSekolah" AS ENUM ('NEGERI', 'SWASTA');

-- CreateEnum
CREATE TYPE "KategoriSekolah" AS ENUM ('REGULER', 'UNGGULAN_PROVINSI');

-- CreateEnum
CREATE TYPE "Metrik" AS ENUM ('JARAK_METER', 'SKOR');

-- CreateEnum
CREATE TYPE "Label" AS ENUM ('PELUANG_BESAR', 'MASIH_MUNGKIN', 'PELUANG_KECIL', 'TIDAK_DIHITUNG');

-- CreateEnum
CREATE TYPE "JenisWilayahRayon" AS ENUM ('UTAMA', 'IRISAN');

-- CreateTable
CREATE TABLE "Sekolah" (
    "id" SERIAL NOT NULL,
    "npsn" TEXT NOT NULL,
    "kodeDiData" TEXT,
    "nama" TEXT NOT NULL,
    "jenjang" "Jenjang" NOT NULL,
    "status" "StatusSekolah" NOT NULL,
    "kategori" "KategoriSekolah" NOT NULL DEFAULT 'REGULER',
    "alamat" TEXT NOT NULL,
    "kelurahan" TEXT,
    "kecamatan" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "akreditasi" TEXT,
    "sumberUrl" TEXT NOT NULL,
    "diambilPada" TIMESTAMP(3) NOT NULL,
    "biayaRingkas" TEXT,
    "biayaResmi" BOOLEAN,
    "biayaUrl" TEXT,
    "rayonKode" TEXT,

    CONSTRAINT "Sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rayon" (
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Rayon_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "RayonKecamatan" (
    "id" SERIAL NOT NULL,
    "rayonKode" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "jenis" "JenisWilayahRayon" NOT NULL,

    CONSTRAINT "RayonKecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramKeahlian" (
    "id" SERIAL NOT NULL,
    "sekolahId" INTEGER NOT NULL,
    "bidang" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelompokBobot" TEXT,

    CONSTRAINT "ProgramKeahlian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jalur" (
    "kode" TEXT NOT NULL,
    "namaTampilan" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,

    CONSTRAINT "Jalur_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "SubJalur" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "namaDiData" TEXT NOT NULL,
    "jalurKode" TEXT NOT NULL,
    "namaTampilan" TEXT NOT NULL,
    "metrik" "Metrik" NOT NULL,

    CONSTRAINT "SubJalur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TahunSpmb" (
    "tahun" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT false,
    "aturan" JSONB NOT NULL,
    "catatan" TEXT,

    CONSTRAINT "TahunSpmb_pkey" PRIMARY KEY ("tahun")
);

-- CreateTable
CREATE TABLE "StatistikSeleksi" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "sekolahId" INTEGER NOT NULL,
    "subJalurId" INTEGER NOT NULL,
    "programId" INTEGER,
    "pendaftar" INTEGER,
    "pendaftarPilihan1" INTEGER,
    "diterima" INTEGER NOT NULL,
    "nilaiMinDiterima" DOUBLE PRECISION,
    "nilaiMedianDiterima" DOUBLE PRECISION,
    "nilaiMaksDiterima" DOUBLE PRECISION,

    CONSTRAINT "StatistikSeleksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatistikKecamatan" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "cakupan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "pendaftarUnik" INTEGER NOT NULL,
    "diterimaUnik" INTEGER NOT NULL,

    CONSTRAINT "StatistikKecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayaTampung" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "sekolahId" INTEGER NOT NULL,
    "programId" INTEGER,
    "kuota" INTEGER NOT NULL,
    "sumber" TEXT NOT NULL,

    CONSTRAINT "DayaTampung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CekPeluang" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tahunAcuan" INTEGER NOT NULL,
    "kecamatan" TEXT,
    "jenjang" TEXT NOT NULL,
    "jalurDicek" TEXT[],
    "rentangSkor" TEXT,
    "hasil" JSONB NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CekPeluang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasilCek" (
    "id" SERIAL NOT NULL,
    "cekId" TEXT NOT NULL,
    "sekolahId" INTEGER NOT NULL,
    "subJalurId" INTEGER NOT NULL,
    "label" "Label" NOT NULL,

    CONSTRAINT "HasilCek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogImpor" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "namaFile" TEXT NOT NULL,
    "jumlahBaris" INTEGER NOT NULL,
    "jumlahSekolah" INTEGER NOT NULL,
    "adminId" INTEGER,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogImpor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sekolah_npsn_key" ON "Sekolah"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "Sekolah_kodeDiData_key" ON "Sekolah"("kodeDiData");

-- CreateIndex
CREATE INDEX "Sekolah_jenjang_status_idx" ON "Sekolah"("jenjang", "status");

-- CreateIndex
CREATE INDEX "RayonKecamatan_kecamatan_idx" ON "RayonKecamatan"("kecamatan");

-- CreateIndex
CREATE UNIQUE INDEX "RayonKecamatan_rayonKode_kecamatan_key" ON "RayonKecamatan"("rayonKode", "kecamatan");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramKeahlian_sekolahId_nama_key" ON "ProgramKeahlian"("sekolahId", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "SubJalur_kode_key" ON "SubJalur"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "SubJalur_namaDiData_key" ON "SubJalur"("namaDiData");

-- CreateIndex
CREATE INDEX "StatistikSeleksi_tahun_sekolahId_idx" ON "StatistikSeleksi"("tahun", "sekolahId");

-- CreateIndex
CREATE UNIQUE INDEX "StatistikKecamatan_tahun_cakupan_kecamatan_key" ON "StatistikKecamatan"("tahun", "cakupan", "kecamatan");

-- CreateIndex
CREATE INDEX "DayaTampung_tahun_sekolahId_idx" ON "DayaTampung"("tahun", "sekolahId");

-- CreateIndex
CREATE UNIQUE INDEX "CekPeluang_token_key" ON "CekPeluang"("token");

-- CreateIndex
CREATE INDEX "HasilCek_sekolahId_label_idx" ON "HasilCek"("sekolahId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Sekolah" ADD CONSTRAINT "Sekolah_rayonKode_fkey" FOREIGN KEY ("rayonKode") REFERENCES "Rayon"("kode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RayonKecamatan" ADD CONSTRAINT "RayonKecamatan_rayonKode_fkey" FOREIGN KEY ("rayonKode") REFERENCES "Rayon"("kode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramKeahlian" ADD CONSTRAINT "ProgramKeahlian_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubJalur" ADD CONSTRAINT "SubJalur_jalurKode_fkey" FOREIGN KEY ("jalurKode") REFERENCES "Jalur"("kode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikSeleksi" ADD CONSTRAINT "StatistikSeleksi_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikSeleksi" ADD CONSTRAINT "StatistikSeleksi_subJalurId_fkey" FOREIGN KEY ("subJalurId") REFERENCES "SubJalur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikSeleksi" ADD CONSTRAINT "StatistikSeleksi_programId_fkey" FOREIGN KEY ("programId") REFERENCES "ProgramKeahlian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayaTampung" ADD CONSTRAINT "DayaTampung_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayaTampung" ADD CONSTRAINT "DayaTampung_programId_fkey" FOREIGN KEY ("programId") REFERENCES "ProgramKeahlian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilCek" ADD CONSTRAINT "HasilCek_cekId_fkey" FOREIGN KEY ("cekId") REFERENCES "CekPeluang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilCek" ADD CONSTRAINT "HasilCek_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilCek" ADD CONSTRAINT "HasilCek_subJalurId_fkey" FOREIGN KEY ("subJalurId") REFERENCES "SubJalur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogImpor" ADD CONSTRAINT "LogImpor_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
