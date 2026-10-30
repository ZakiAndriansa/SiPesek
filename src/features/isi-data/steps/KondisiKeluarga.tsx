import { Choice, ChoiceGroup, Dialog, HelpLink } from "@/components";

const BANTUAN = [
  ["kip", "KIP (Kartu Indonesia Pintar)"],
  ["pkh", "PKH (Program Keluarga Harapan)"],
  ["dtks", "Terdaftar di DTKS (Data Terpadu Kesejahteraan Sosial)"],
  ["lain", "Bantuan lainnya"],
];

export function KondisiKeluarga({ data }: { data?: Record<string, string> }) {
  return (
    <>
      <ChoiceGroup
        legend="Apakah keluarga termasuk kurang mampu (KETM, Keluarga Ekonomi Tidak Mampu)?"
        hint={<HelpLink opens="dlg-ketm">Apa ini?</HelpLink>}
        errorName="ketm"
      >
        <Choice
          type="radio"
          name="ketm"
          value="ya"
          title="Ya"
          desc="Kami menerima bantuan sosial."
          checked={data?.ketm === "ya"}
          required
          errorRequired="Pilih salah satu jawaban dulu. Bila belum yakin, pilih Belum yakin."
        />
        <Choice
          type="radio"
          name="ketm"
          value="tidak"
          title="Tidak"
          desc="Kami cek jalur lain yang cocok."
          checked={data?.ketm === "tidak"}
          required
        />
        <Choice
          type="radio"
          name="ketm"
          value="ragu"
          title="Belum yakin"
          desc="Kami bantu jelaskan cara mengeceknya."
          checked={data?.ketm === "ragu"}
          required
        />
      </ChoiceGroup>
      <ChoiceGroup legend="Bantuan yang diterima (bila ada)">
        {BANTUAN.map(([value, title]) => (
          <Choice
            key={value}
            type="checkbox"
            name="bantuan"
            value={value}
            title={title}
          />
        ))}
      </ChoiceGroup>
      <ChoiceGroup
        legend="Kondisi anak"
        hint={<HelpLink opens="dlg-afirmasi">Apa itu Jalur keluarga kurang mampu (Afirmasi)?</HelpLink>}
      >
        <Choice
          type="checkbox"
          name="disabilitas"
          value="ya"
          title="Anak penyandang disabilitas"
          desc="Kami cek syarat Jalur keluarga kurang mampu (Afirmasi) untuk disabilitas."
        />
      </ChoiceGroup>
      <ChoiceGroup
        legend="Persetujuan data sensitif"
        errorName="setuju-keluarga"
      >
        <Choice
          type="checkbox"
          name="setuju-keluarga"
          value="ya"
          title="Saya mengizinkan data kondisi keluarga dipakai untuk menghitung peluang"
          desc="Data ini hanya dipakai untuk menentukan jalur dan tidak dibagikan."
          required
          errorRequired="Centang persetujuan ini untuk melanjutkan."
        />
      </ChoiceGroup>
    </>
  );
}

export function KondisiKeluargaDialogs() {
  return (
    <>
      <Dialog id="dlg-ketm" title="Apa itu KETM?">
        <p>
          KETM adalah singkatan dari Keluarga Ekonomi Tidak Mampu. Keluarga ini
          biasanya menerima bantuan sosial atau terdaftar di Data Terpadu
          Kesejahteraan Sosial (DTKS).
        </p>
        <p>Bila belum yakin, tanyakan ke kantor kelurahan.</p>
      </Dialog>
      <Dialog id="dlg-afirmasi" title="Apa itu Jalur keluarga kurang mampu (Afirmasi)?">
        <p>
          Jalur khusus untuk siswa dari keluarga kurang mampu dan siswa
          penyandang disabilitas. Kuotanya terpisah dari jalur lain, jadi
          bersaingnya dengan sesama anak di jalur ini.
        </p>
      </Dialog>
    </>
  );
}
