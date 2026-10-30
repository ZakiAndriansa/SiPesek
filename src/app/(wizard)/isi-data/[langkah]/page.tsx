import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, Button, ButtonGroup, PageHeader } from "@/components";
import { getSession } from "@/lib/session";
import { WizardForm } from "@/features/isi-data/WizardForm";
import {
  AFTER_LAST,
  BEFORE_FIRST,
  getStep,
  STEPS,
  stepHref,
  TOTAL,
} from "@/features/isi-data/steps";

type Props = {
  params: Promise<{ langkah: string }>;
  searchParams: Promise<{ terkunci?: string; dari?: string }>;
};

const LOCKED_LABEL: Record<string, string> = {
  hasil: "Hasil Sekolah",
  strategi: "Strategi",
  dokumen: "Dokumen",
};

export function generateStaticParams() {
  return STEPS.map((_, i) => ({ langkah: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getStep((await params).langkah);
  if (!found) return {};
  const title = `Langkah ${found.n}: ${found.step.title} · SiPesek`;
  return { title, description: found.step.desc };
}

export default async function IsiDataPage({ params, searchParams }: Props) {
  const found = getStep((await params).langkah);
  if (!found) notFound();
  const { n, step } = found;
  const isLast = n === TOTAL;
  const next = isLast ? AFTER_LAST : stepHref(n + 1);
  const prev = n === 1 ? BEFORE_FIRST : stepHref(n - 1);
  const query = await searchParams;
  const locked = LOCKED_LABEL[query.terkunci ?? ""];
  const fromQuick = query.dari === "cek-cepat";
  const data = (await getSession())?.child?.data;

  return (
    <>
      {locked && (
        <Alert kind="info" title={`${locked} belum bisa dibuka`}>
          Lengkapi data anak sampai langkah terakhir dulu. Setelah itu {locked} langsung terbuka.
        </Alert>
      )}
      {fromQuick && (
        <Alert kind="success" title="Hasil Cek Cepat sudah masuk akun">
          Data dari Cek Cepat sudah terisi di langkah 1 sampai 4. Periksa langkah terakhir, lalu lanjutkan.
        </Alert>
      )}
      <PageHeader
        art="profile" title={step.title} desc={step.desc} />

      <div className="card wizard__card">
        <WizardForm step={n} next={next}>
          <step.Body data={data} />
          <div className="wizard__actions">
            <ButtonGroup>
              <Button
                variant="primary"
                block
                type="submit"
                icon={isLast ? undefined : "arrow-right"}
              >
                {step.nextText ?? "Simpan & Lanjut"}
              </Button>
              {step.skippable && (
                <Button variant="ghost" block href={next}>
                  Lewati Langkah Ini
                </Button>
              )}
              <Button variant="secondary" block href={prev} iconLeft="chevron-left">
                Kembali
              </Button>
            </ButtonGroup>
          </div>
        </WizardForm>
      </div>

      {step.Dialogs && <step.Dialogs />}
    </>
  );
}

