import {
  Alert,
  ChoiceGroup,
  Choice,
  Dialog,
  Field,
  HelpLink,
} from "@/components";

const SEMESTER = [1, 2, 3, 4, 5];

export function NilaiRapor({ data }: { data?: Record<string, string> }) {
  return (
    <>
      <p>
        <HelpLink opens="dlg-rapor">Di mana nilai ada di rapor?</HelpLink>
      </p>
      {SEMESTER.map((s) => (
        <Field
          key={s}
          id={`nilai-${s}`}
          label={`Rata-rata nilai semester ${s}`}
          optional
          placeholder="Contoh: 85,5"
          errorPattern="Nilai ditulis dengan angka, misalnya 85,5. Bapak/Ibu bisa melihatnya di rapor halaman terakhir."
          inputMode="decimal"
          pattern="[0-9]{2,3}([,.][0-9]{1,2})?"
          defaultValue={data?.[`nilai-${s}`]}
        />
      ))}
      <ChoiceGroup legend="Rapor semester berjalan">
        <Choice
          type="checkbox"
          name="perkiraan"
          value="ya"
          title="Rapor semester ini belum keluar"
          desc="Kami pakai perkiraan dan menandai hasilnya sebagai perkiraan."
        />
      </ChoiceGroup>
      <Alert kind="info" title="Boleh dikosongkan">
        Hasil bisa kurang akurat bila nilai belum lengkap. Kami akan menunjukkan
        bagian mana yang masih kurang.
      </Alert>
    </>
  );
}

export function NilaiRaporDialogs() {
  return (
    <Dialog id="dlg-rapor" title="Di mana nilai ada di rapor?">
      <p>
        Buka halaman terakhir rapor tiap semester, lalu cari baris{" "}
        <strong>Nilai rata-rata</strong>. Tulis angkanya apa adanya, misalnya
        85,5.
      </p>
      <div className="card">
        <p className="card__title">Contoh halaman rapor</p>
        <p className="card__text">
          Matematika 84 · Bahasa Indonesia 88 · IPA 85
        </p>
        <p className="card__title">Nilai rata-rata: 85,5</p>
      </div>
    </Dialog>
  );
}
