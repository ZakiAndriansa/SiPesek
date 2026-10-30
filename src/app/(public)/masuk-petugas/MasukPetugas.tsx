"use client";

import { Alert, Button, Choice, ChoiceGroup, Form } from "@/components";
import { ACCOUNTS } from "@/lib/accounts";
import { signIn } from "@/lib/session-actions";

const tujuan = () => new URLSearchParams(window.location.search).get("next") ?? undefined;

/**
 * Masuk petugas (mode demo): memilih akun contoh Pembuat Kebijakan atau Admin.
 * shortcut: ganti dengan sesi petugas asli (admin memakai /api/admin/masuk) saat dashboard disambungkan ke API.
 */
export function MasukPetugas() {
  return (
    <div className="card">
      <Alert kind="warning" title="Mode demo">
        Belum ada akun petugas sungguhan. Pilih akun contoh untuk melihat dashboard.
      </Alert>
      <Form
        onValid={() => {
          const picked = document.querySelector<HTMLInputElement>('input[name="akun"]:checked');
          void signIn(picked?.value ?? "kebijakan", tujuan());
        }}
      >
        <ChoiceGroup legend="Masuk sebagai">
          {Object.entries(ACCOUNTS)
            .filter(([, a]) => a.role !== "orang-tua")
            .map(([key, a], i) => (
              <Choice key={key} type="radio" name="akun" value={key} title={a.label} desc={a.name} checked={i === 0} />
            ))}
        </ChoiceGroup>
        <Button variant="primary" block type="submit">
          Masuk (demo)
        </Button>
      </Form>
    </div>
  );
}
