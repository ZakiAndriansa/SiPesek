import { Alert, Select, Toolbar } from "@/components";
import { KEC_FILTER } from "@/data/kecamatan";

/** Filter standar dashboard kebijakan: tahun, kecamatan, jenjang, jalur. */
export function KebijakanFilters() {
  return (
    <Toolbar wide>
      <Select
        id="f-tahun"
        label="Tahun ajaran"
        options={["2027/2028", "2026/2027"]}
      />
      <Select id="f-kec" label="Kecamatan" options={KEC_FILTER} />
      <Select
        id="f-jenjang"
        label="Jenjang"
        options={["SMA dan SMK", "SMA", "SMK"]}
      />
      <Select
        id="f-jalur"
        label="Jalur"
        options={["Semua jalur", "Domisili", "Afirmasi", "Prestasi", "Mutasi"]}
      />
    </Toolbar>
  );
}

/** Catatan wajib di dashboard: data minat berasal dari simulasi. */
export function MethodNote() {
  return (
    <Alert kind="info" title="Catatan metodologi">
      Data minat berasal dari simulasi pengguna aplikasi, bukan pendaftaran
      resmi. Kecamatan dengan pengguna kurang dari 10 disamarkan agar tidak
      mengidentifikasi keluarga.
    </Alert>
  );
}
