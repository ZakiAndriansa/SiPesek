"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Field, Form } from "@/components";

const FORM = "masuk-petugas";

/** Tujuan setelah masuk: hanya halaman admin di situs ini, bukan alamat luar. */
function tujuan() {
  const next = new URLSearchParams(window.location.search).get("next") ?? "";
  return next.startsWith("/admin-") ? next : "/admin-sekolah";
}

/** Masuk admin dinas dengan email dan kata sandi (POST /api/admin/masuk, sesi JWT 8 jam). */
export function MasukPetugas() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [galat, setGalat] = useState("");

  async function masuk() {
    if (busy) return;
    const f = new FormData(document.getElementById(FORM) as HTMLFormElement);
    setBusy(true);
    setGalat("");
    try {
      const res = await fetch("/api/admin/masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(f.get("email") ?? "").trim(), password: String(f.get("password") ?? "") }),
      });
      if (res.ok) {
        router.replace(tujuan());
        router.refresh();
        return;
      }
      setGalat(res.status === 401 ? "Email atau kata sandi salah." : "Belum bisa masuk. Coba lagi sebentar lagi.");
    } catch {
      setGalat("Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.");
    }
    setBusy(false);
  }

  return (
    <div className="card">
      <Form id={FORM} onValid={masuk}>
        <Field id="email" label="Email" type="email" autoComplete="username" required errorRequired="Isi email akun admin." />
        <Field
          id="password"
          label="Kata sandi"
          type="password"
          autoComplete="current-password"
          required
          errorRequired="Isi kata sandi."
        />
        {galat && <Alert kind="danger">{galat}</Alert>}
        <Button variant="primary" block type="submit">
          {busy ? "Memeriksa…" : "Masuk"}
        </Button>
      </Form>
    </div>
  );
}
