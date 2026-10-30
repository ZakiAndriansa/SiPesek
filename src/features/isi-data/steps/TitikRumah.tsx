import type { CSSProperties } from "react";
import { KEC_NAMES } from "@/data/kecamatan";
import {
  Alert,
  Button,
  Choice,
  ChoiceGroup,
  Dialog,
  Field,
  Icon,
  Select,
} from "@/components";

const pos = (vars: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [`--${k}`, v]),
  ) as CSSProperties;
const KEC_WIZARD = KEC_NAMES;

export function TitikRumah({ data }: { data?: Record<string, string> }) {
  return (
    <>
      <div className="stack">
        <div
          className="map"
          role="img"
          aria-label="Peta lokasi rumah. Pin berada di Kelurahan Mekar Baru, Kecamatan Harapan Jaya."
        >
          <span
            className="map__road"
            style={pos({ x: "0%", y: "40%", w: "100%", h: "7%" })}
            aria-hidden="true"
          />
          <span
            className="map__road"
            style={pos({ x: "30%", y: "0%", w: "6%", h: "100%" })}
            aria-hidden="true"
          />
          <span className="map__home" style={pos({ x: "50%", y: "58%" })}>
            <Icon name="home" className="icon icon--sm" />
            Rumah
          </span>
        </div>
        <Button variant="secondary" block iconLeft="map-pin" opens="dlg-lokasi">
          Gunakan lokasi saya
        </Button>
      </div>
      <Field
        id="cari"
        label="Cari alamat"
        type="search"
        optional
        placeholder="Nama jalan atau kelurahan"
      />
      <div className="accordion">
        <details className="accordion__item">
          <summary className="accordion__summary">
            Peta tidak muncul? Pilih dari daftar
            <Icon name="chevron-down" className="icon accordion__icon" />
          </summary>
          <div className="accordion__panel">
            <Select
              id="kec"
              label="Kecamatan"
              options={KEC_WIZARD}
              placeholder="Pilih kecamatan"
              selected={data?.kec}
            />
            <Select
              id="kel"
              label="Kelurahan"
              options={["Mekar Baru", "Harapan Mulia"]}
              placeholder="Pilih kelurahan"
            />
            <Field id="rtrw" label="RT/RW" placeholder="Contoh: 03/05" />
          </div>
        </details>
      </div>
      <Alert
        kind="success"
        title="Rumah di Kelurahan Mekar Baru, Kecamatan Harapan Jaya"
      >
        Sudah benar?
      </Alert>
      <ChoiceGroup legend="Konfirmasi titik rumah">
        <Choice
          type="radio"
          name="titik"
          value="benar"
          title="Ya, sudah benar"
          checked
        />
        <Choice
          type="radio"
          name="titik"
          value="salah"
          title="Belum, saya perbaiki"
        />
      </ChoiceGroup>
      <h2 className="text-heading-sm">Alamat di Kartu Keluarga</h2>
      <Select
        id="kec-kk"
        label="Kecamatan di KK"
        options={KEC_WIZARD}
        placeholder="Pilih kecamatan"
        hint="Cukup dipilih dan diketik. Tidak perlu mengunggah foto KK."
      />
      <Field
        id="kel-kk"
        label="Kelurahan di KK"
        optional
        placeholder="Contoh: Mekar Baru"
      />
      <Alert kind="info" title="Bila berbeda dengan titik rumah">
        Jalur dekat rumah (Domisili) bisa terpengaruh. Kami tetap menampilkan hasil dan
        menjelaskan dampaknya, lalu menyarankan jalur lain bila perlu.
      </Alert>
      <ChoiceGroup legend="Persetujuan lokasi" errorName="setuju-lokasi">
        <Choice
          type="checkbox"
          name="setuju-lokasi"
          value="ya"
          title="Saya mengizinkan lokasi rumah dipakai untuk menghitung jarak"
          desc="Lokasi disimpan terenkripsi. Dinas hanya melihat data gabungan per kecamatan."
          required
          errorRequired="Centang persetujuan ini untuk melanjutkan."
        />
      </ChoiceGroup>
    </>
  );
}

export function TitikRumahDialogs() {
  return (
    <Dialog id="dlg-lokasi" title="Kenapa kami meminta lokasi?">
      <p>
        Lokasi dipakai hanya untuk menandai letak rumah dan menghitung jarak ke
        sekolah. Bapak/Ibu akan diminta izin oleh HP. Bila menolak, tetap bisa
        memilih alamat dari daftar.
      </p>
    </Dialog>
  );
}
