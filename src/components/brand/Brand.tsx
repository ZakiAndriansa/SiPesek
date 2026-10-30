import Link from "next/link";
/**
 * Logo SiPesek + nama. `small` dipakai di footer. `lofi` memakai versi garis hitam-putih
 * (untuk cetak atau latar yang tidak cocok dengan oranye). Berkas ada di public/logo.
 * Logo bersifat sementara (dibuat manual karena Imagen tidak tersedia).
 */
export function Brand({ href, small, lofi }: { href: string; small?: boolean; lofi?: boolean }) {
  return (
    <Link className={`brand${small ? " brand--sm" : ""}`} href={href}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="brand__logo"
        src={lofi ? "/logo/logo-lofi.svg" : "/logo/logo-hifi.svg"}
        alt=""
        aria-hidden="true"
        width={34}
        height={34}
      />
      <span>Sipesek</span>
    </Link>
  );
}
