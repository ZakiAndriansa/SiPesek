"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Penjaga = { aktif: boolean; setAktif: (aktif: boolean) => void };

const KonteksPenjaga = createContext<Penjaga | null>(null);

/**
 * Membagikan tanda "ada isian yang akan hilang" dari halaman ke tombol Keluar di header fokus.
 * Header dan halaman sama-sama berada di dalam penjaga ini (lihat QuickChrome).
 */
export function PenjagaKeluar({ children }: { children: ReactNode }) {
  const [aktif, setAktif] = useState(false);
  const nilai = useMemo(() => ({ aktif, setAktif }), [aktif]);
  return <KonteksPenjaga.Provider value={nilai}>{children}</KonteksPenjaga.Provider>;
}

/** Dipanggil halaman: true selama keluar akan membuang isian. Otomatis false saat halaman ditinggalkan. */
export function useIsianBelumTersimpan(aktif: boolean) {
  const setAktif = useContext(KonteksPenjaga)?.setAktif;
  useEffect(() => {
    setAktif?.(aktif);
    return () => setAktif?.(false);
  }, [aktif, setAktif]);
}

/** Dibaca tombol Keluar: perlu minta konfirmasi sebelum meninggalkan halaman? */
export const usePerluKonfirmasiKeluar = () => useContext(KonteksPenjaga)?.aktif ?? false;
