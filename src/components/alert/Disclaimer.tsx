import { Alert } from "./Alert";

/** Pernyataan batasan yang wajib tampil di halaman hasil (PRD 7.4). */
export function Disclaimer() {
  return (
    <Alert kind="info" title="Perkiraan, bukan jaminan">
      Hasil ini adalah perkiraan berdasarkan data tahun-tahun sebelumnya dan
      bukan jaminan diterima. Keputusan akhir ada pada panitia SPMB.
    </Alert>
  );
}
