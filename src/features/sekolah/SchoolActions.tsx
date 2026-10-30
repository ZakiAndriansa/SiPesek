import { Button } from "@/components";
import type { School } from "@/data/schools";

/** Tombol "Tambah ke Pilihan" dengan toast bernama sekolah. */
export function AddSchoolButton({
  school,
  variant = "secondary",
  block,
}: {
  school: School;
  variant?: "primary" | "secondary";
  block?: boolean;
}) {
  return (
    <Button
      variant={variant}
      block={block}
      toast={{
        message: `${school.name} ditambahkan ke pilihan.`,
        variant: "success",
      }}
    >
      Tambah ke Pilihan
    </Button>
  );
}
