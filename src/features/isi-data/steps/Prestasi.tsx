import { Field, Select } from "@/components";

export function Prestasi({ data }: { data?: Record<string, string> }) {
  return (
    <>
      <Field
        id="bidang"
        label="Bidang lomba"
        optional
        placeholder="Contoh: Olimpiade Matematika"
      />
      <Select
        id="tingkat"
        label="Tingkat"
        options={["Kecamatan", "Kota/Kabupaten", "Provinsi", "Nasional"]}
        placeholder="Pilih tingkat"
        selected={data?.tingkat}
        optional
      />
      <Select
        id="peringkat"
        label="Peringkat"
        options={["Juara 1", "Juara 2", "Juara 3", "Finalis"]}
        placeholder="Pilih peringkat"
        optional
      />
      <Select
        id="tahun"
        label="Tahun"
        options={["2026", "2025", "2024"]}
        placeholder="Pilih tahun"
        optional
      />
    </>
  );
}
