import { Choice, ChoiceGroup, Field } from "@/components";

export function DataAnak({ data }: { data?: Record<string, string> }) {
  return (
    <>
      <Field
        id="nama"
        label="Nama lengkap anak"
        required
        errorRequired="Nama belum diisi. Tulis nama lengkap seperti di akta kelahiran."
        autoComplete="off"
        defaultValue={data?.nama}
      />
      <Field id="lahir" label="Tanggal lahir" type="date" optional />
      <Field
        id="smp"
        label="SMP asal"
        optional
        placeholder="Contoh: SMP Negeri 3 Sukamaju"
      />
      <ChoiceGroup legend="Mau mendaftar ke mana?">
        <Choice
          type="radio"
          name="jenjang"
          value="sma"
          title="SMA"
          desc="Sekolah umum, lanjut ke perguruan tinggi."
          checked={!data?.jenjang || data.jenjang === "sma"}
        />
        <Choice
          type="radio"
          name="jenjang"
          value="smk"
          title="SMK"
          desc="Sekolah kejuruan, siap kerja."
          checked={data?.jenjang === "smk"}
        />
        <Choice
          type="radio"
          name="jenjang"
          value="belum"
          title="Belum tahu"
          desc="Kami tampilkan SMA dan SMK."
          checked={data?.jenjang === "belum"}
        />
      </ChoiceGroup>
    </>
  );
}
