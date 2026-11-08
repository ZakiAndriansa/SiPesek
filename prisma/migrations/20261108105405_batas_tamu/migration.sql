-- CreateTable
CREATE TABLE "BatasTamu" (
    "id" BIGSERIAL NOT NULL,
    "kunci" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatasTamu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatasTamu_kunci_waktu_idx" ON "BatasTamu"("kunci", "waktu");

-- CreateIndex
CREATE INDEX "BatasTamu_waktu_idx" ON "BatasTamu"("waktu");
