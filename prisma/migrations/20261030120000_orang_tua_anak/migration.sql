-- AlterTable
ALTER TABLE "CekPeluang" ADD COLUMN     "anakId" INTEGER;

-- CreateTable
CREATE TABLE "OrangTua" (
    "id" SERIAL NOT NULL,
    "googleSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terakhirMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrangTua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anak" (
    "id" SERIAL NOT NULL,
    "orangTuaId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "sidikNisn" TEXT NOT NULL,
    "nisnAkhir" TEXT NOT NULL,
    "nisnLazim" BOOLEAN NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrangTua_googleSub_key" ON "OrangTua"("googleSub");

-- CreateIndex
CREATE UNIQUE INDEX "Anak_sidikNisn_key" ON "Anak"("sidikNisn");

-- CreateIndex
CREATE INDEX "Anak_orangTuaId_idx" ON "Anak"("orangTuaId");

-- CreateIndex
CREATE INDEX "CekPeluang_anakId_dibuatPada_idx" ON "CekPeluang"("anakId", "dibuatPada");

-- AddForeignKey
ALTER TABLE "CekPeluang" ADD CONSTRAINT "CekPeluang_anakId_fkey" FOREIGN KEY ("anakId") REFERENCES "Anak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anak" ADD CONSTRAINT "Anak_orangTuaId_fkey" FOREIGN KEY ("orangTuaId") REFERENCES "OrangTua"("id") ON DELETE CASCADE ON UPDATE CASCADE;

