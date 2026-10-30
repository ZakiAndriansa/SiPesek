"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { Alert, Button, Choice, ChoiceGroup, Form } from "@/components";
import { ACCOUNTS } from "@/lib/accounts";
import { signIn } from "@/lib/session-actions";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type Gis = {
  accounts: {
    id: {
      initialize(opsi: { client_id: string; callback: (r: { credential: string }) => void }): void;
      renderButton(el: HTMLElement, opsi: Record<string, string | number>): void;
    };
  };
};

declare global {
  interface Window {
    google?: Gis;
  }
}

// `next` dibaca saat tombol dipakai, bukan dari searchParams, agar kartu ini ikut App Shell statis.
const tujuan = () => new URLSearchParams(window.location.search).get("next") ?? undefined;

/** Tombol resmi Google Identity Services. Tanpa Client ID, tampil mode demo agar prototipe tetap bisa dicoba. */
export function MasukGoogle() {
  const tombol = useRef<HTMLDivElement>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  if (!CLIENT_ID) return <MasukDemo />;

  async function setelahGoogle({ credential }: { credential: string }) {
    setMemproses(true);
    setGalat(null);
    let berhasil = false;
    try {
      const r = await fetch("/api/ortu/masuk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      if (r.ok) berhasil = true;
      else {
        const isi = (await r.json().catch(() => null)) as { galat?: string } | null;
        setGalat(isi?.galat ?? "Masuk dengan Google gagal. Silakan coba lagi.");
      }
    } catch {
      setGalat("Tidak bisa terhubung ke server. Periksa koneksi internet, lalu coba lagi.");
    }
    if (!berhasil) return setMemproses(false);
    // shortcut: pasang sesi prototipe juga, sampai halaman orang tua membaca sesi Google langsung.
    await signIn("google", tujuan());
  }

  function pasangTombol() {
    const el = tombol.current;
    if (!window.google || !el || !CLIENT_ID) return;
    window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: setelahGoogle });
    window.google.accounts.id.renderButton(el, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      logo_alignment: "left",
      locale: "id",
      // Google membatasi lebar tombol 200 sampai 400 piksel.
      width: Math.max(200, Math.min(el.clientWidth, 400)),
    });
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client?hl=id"
        strategy="afterInteractive"
        onReady={pasangTombol}
        onError={() => setGalat("Tombol Google gagal dimuat. Muat ulang halaman ini.")}
      />
      <div ref={tombol} className="masuk-google__tombol" hidden={memproses} />
      {memproses && (
        <p className="masuk-google__status" role="status">
          Memproses masuk...
        </p>
      )}
      {galat && (
        <Alert kind="danger" title="Belum berhasil masuk">
          {galat}
        </Alert>
      )}
    </>
  );
}

function MasukDemo() {
  return (
    <>
      <Alert kind="warning" title="Mode demo">
        Tombol Google muncul setelah NEXT_PUBLIC_GOOGLE_CLIENT_ID diisi. Sementara itu, pilih akun contoh.
      </Alert>
      <Form
        onValid={() => {
          const picked = document.querySelector<HTMLInputElement>('input[name="akun"]:checked');
          void signIn(picked?.value ?? "orang-tua", tujuan());
        }}
      >
        <ChoiceGroup legend="Masuk sebagai (mode demo)">
          {Object.entries(ACCOUNTS)
            .filter(([key, a]) => a.role === "orang-tua" && key !== "google")
            .map(([key, a], i) => (
              <Choice key={key} type="radio" name="akun" value={key} title={a.label} desc={a.name} checked={i === 0} />
            ))}
        </ChoiceGroup>
        <Button variant="primary" block type="submit">
          Masuk (demo)
        </Button>
      </Form>
    </>
  );
}
