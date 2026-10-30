"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Choice,
  ChoiceGroup,
  Field,
  Form,
  MoreLink,
} from "@/components";
import { ACCOUNTS } from "@/lib/accounts";
import { signIn } from "@/lib/session-actions";

/** Dua langkah masuk: nomor HP, lalu kode OTP. Kartu tidak aktif disembunyikan (atribut hidden). */
export function MasukFlow({ next }: { next?: string }) {
  const [step, setStep] = useState<"hp" | "kode">("hp");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) return void (first.current = false);
    document
      .querySelector<HTMLInputElement>(
        step === "kode" ? "#langkah-kode input" : "#langkah-hp input",
      )
      ?.focus();
  }, [step]);

  // Android Chrome: isi kode otomatis dari SMS, tanpa salin-tempel.
  // shortcut: butuh SMS berformat "@domain #kode" dari backend; iOS sudah terisi lewat saran keyboard.
  useEffect(() => {
    if (step !== "kode" || !("OTPCredential" in window)) return;
    const abort = new AbortController();
    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: abort.signal,
      } as CredentialRequestOptions)
      .then((c) => {
        const input = document.querySelector<HTMLInputElement>(
          "#langkah-kode input",
        );
        const code = (c as unknown as { code?: string } | null)?.code;
        if (!input || !code) return;
        input.value = code;
        input.form?.requestSubmit();
      })
      .catch(() => {});
    return () => abort.abort();
  }, [step]);

  return (
    <>
      <div className="card" data-step="" id="langkah-hp" hidden={step !== "hp"}>
        <h2 className="card__title">Nomor HP Bapak/Ibu</h2>
        <Form reveal="#langkah-kode" onValid={() => setStep("kode")}>
          <Field
            id="hp"
            label="Nomor HP"
            type="tel"
            hint="Contoh: 081234567890. Kami kirim kode 6 angka lewat WhatsApp atau SMS."
            required
            inputMode="tel"
            autoComplete="tel"
            pattern="0[0-9]{9,12}"
            errorRequired="Nomor HP belum diisi. Tulis nomor yang aktif di WhatsApp atau SMS."
            errorPattern="Nomor HP tampaknya belum lengkap. Tulis diawali 0, contoh 081234567890."
          />
          <ChoiceGroup legend="Persetujuan" errorName="setuju">
            <Choice
              type="checkbox"
              name="setuju"
              value="ya"
              title="Saya setuju data saya dipakai untuk menghitung peluang"
              desc="Data hanya dipakai di aplikasi ini dan tidak dijual."
              required
              errorRequired="Centang persetujuan ini untuk melanjutkan."
            />
          </ChoiceGroup>
          <p className="text-caption">
            <MoreLink href="/panduan#privasi">Baca kebijakan privasi</MoreLink>
          </p>
          <Button variant="primary" block type="submit">
            Kirim Kode
          </Button>
        </Form>
      </div>
      <div
        className="card"
        data-step=""
        id="langkah-kode"
        hidden={step !== "kode"}
      >
        <h2 className="card__title">Masukkan kode</h2>
        <Alert kind="info" title="Cek pesan WhatsApp atau SMS di HP Bapak/Ibu">
          Kode 6 angka sudah dikirim. Salin kode itu, lalu tempel di kolom di
          bawah.
        </Alert>
        <Form
          onValid={() => {
            const picked = document.querySelector<HTMLInputElement>('input[name="akun"]:checked');
            void signIn(picked?.value ?? "orang-tua", next);
          }}
        >
          <Field
            id="kode"
            label="Kode 6 angka"
            hint="Kode berlaku 5 menit."
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            errorRequired="Kode belum diisi. Lihat pesan WhatsApp atau SMS dari kami."
            errorPattern="Kode terdiri dari 6 angka. Periksa lagi pesan yang masuk."
          />
          {/* shortcut: pilihan akun hanya untuk demo; hapus saat autentikasi asli terpasang. */}
          <ChoiceGroup legend="Masuk sebagai (mode demo)">
            {Object.entries(ACCOUNTS)
              .filter(([, a]) => a.role === "orang-tua") // dashboard kebijakan dan admin milik Zaki, belum ada di branch ini
              .map(([key, a], i) => (
              <Choice
                key={key}
                type="radio"
                name="akun"
                value={key}
                title={a.label}
                desc={`${a.name}`}
                checked={i === 0}
              />
            ))}
          </ChoiceGroup>
          <ButtonGroup>
            <Button variant="primary" block type="submit">
              Masuk
            </Button>
            <Button
              variant="secondary"
              block
              toast={{ message: "Kode baru sudah dikirim.", variant: "info" }}
            >
              Kirim ulang kode
            </Button>
            <Button
              variant="ghost"
              block
              data-show="#langkah-hp"
              onClick={() => setStep("hp")}
            >
              Ubah nomor
            </Button>
          </ButtonGroup>
        </Form>
      </div>
    </>
  );
}
