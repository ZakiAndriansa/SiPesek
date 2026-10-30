import { Button, SchoolCard } from "@/components";
import type { School } from "@/data/schools";
import { AddSchoolButton } from "./SchoolActions";

/** Kartu sekolah di halaman hasil: Lihat Detail + Tambah ke Pilihan. */
export function SchoolResultCard({ school }: { school: School }) {
  return (
    <SchoolCard
      name={school.name}
      kec={school.kec}
      jalur={school.jalur}
      kind={school.kind}
      range={school.range}
      facts={school.facts}
      reason={school.reason}
    >
      <Button variant="primary" href={`/detail-sekolah/${school.id}`}>
        Lihat Detail
      </Button>
      <AddSchoolButton school={school} />
    </SchoolCard>
  );
}
