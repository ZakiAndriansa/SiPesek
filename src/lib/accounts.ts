// Model akun, anak, dan tahap perjalanan. Murni (tanpa next/headers) agar bisa dipakai proxy dan komponen.
// shortcut: akun dan progres disimpan di cookie sebagai tiruan; ganti dengan backend + sesi asli nanti.

export type Role = "orang-tua" | "kebijakan" | "admin";
export type AccountKey = "google" | "orang-tua" | "orang-tua-baru" | "kebijakan" | "admin";

export type Child = {
  id: string;
  name: string;
  /** Jumlah langkah wizard yang sudah disimpan (0..WIZARD_TOTAL). */
  steps: number;
  /** Isian wizard yang sudah ada (misal dari Cek Cepat), dipakai sebagai nilai awal. */
  data?: Record<string, string>;
};

export type Session = {
  account: AccountKey;
  role: Role;
  name: string;
  children: Child[];
  /** Anak yang sedang dilihat; null bila belum ada anak. */
  child: Child | null;
};

export const WIZARD_TOTAL = 5;

export const COOKIE = {
  account: "sipesek_akun",
  child: "sipesek_anak",
  progress: "sipesek_progres",
} as const;

type AccountSeed = { role: Role; name: string; label: string; children: Child[] };

export const ACCOUNTS: Record<AccountKey, AccountSeed> = {
  // Jembatan sementara: dipasang setelah POST /api/ortu/masuk berhasil. Data asli tetap dijaga
  // cookie sipesek_ortu di API; anak dan progres di sini masih tiruan sampai halaman disambungkan.
  google: { role: "orang-tua", name: "Orang tua", label: "Akun Google", children: [] },
  "orang-tua": {
    role: "orang-tua",
    name: "Ibu Sari",
    label: "Orang tua (2 anak, contoh)",
    children: [
      { id: "dimas", name: "Dimas Pratama", steps: 5 },
      { id: "nadia", name: "Nadia Pratama", steps: 1 },
    ],
  },
  "orang-tua-baru": {
    role: "orang-tua",
    name: "Pak Budi",
    label: "Orang tua (akun baru)",
    children: [],
  },
  kebijakan: { role: "kebijakan", name: "Ibu Rina", label: "Pembuat Kebijakan", children: [] },
  admin: { role: "admin", name: "Pak Andi", label: "Admin", children: [] },
};

export const ROLE_LABEL: Record<Role, string> = {
  "orang-tua": "Orang tua",
  kebijakan: "Pembuat Kebijakan",
  admin: "Admin",
};

/** Progres tersimpan: { [childId]: { steps, name } }. */
export type Progress = Record<string, { steps: number; name?: string; data?: Record<string, string> }>;

export function parseProgress(raw: string | undefined): Progress {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === "object" ? (value as Progress) : {};
  } catch {
    return {};
  }
}

const isAccount = (v: string | undefined): v is AccountKey =>
  !!v && Object.prototype.hasOwnProperty.call(ACCOUNTS, v);

/** Bangun sesi dari nilai cookie. Null = tamu. */
export function buildSession(
  account: string | undefined,
  childId: string | undefined,
  progressRaw: string | undefined,
): Session | null {
  if (!isAccount(account)) return null;
  const seed = ACCOUNTS[account];
  const progress = parseProgress(progressRaw);
  const children = seed.children.map((c) => ({
    ...c,
    steps: Math.max(c.steps, progress[c.id]?.steps ?? 0),
    name: progress[c.id]?.name || c.name,
    data: progress[c.id]?.data,
  }));
  // Anak yang ditambah lewat wizard (belum ada di data contoh).
  for (const [id, p] of Object.entries(progress)) {
    if (seed.role === "orang-tua" && !children.some((c) => c.id === id)) {
      children.push({ id, name: p.name || "Anak baru", steps: p.steps, data: p.data });
    }
  }
  const child = children.find((c) => c.id === childId) ?? children[0] ?? null;
  return { account, role: seed.role, name: seed.name, children, child };
}

// ---------- Tahap perjalanan orang tua ----------

export type StageKey = "data" | "hasil" | "strategi" | "dokumen";
export type StageState = "selesai" | "terbuka" | "terkunci";

export const STAGES: readonly {
  key: StageKey;
  n: number;
  label: string;
  short: string;
  href: string;
  icon: string;
}[] = [
  { key: "data", n: 1, label: "Data Anak", short: "Anak", href: "/anak-saya", icon: "users" },
  { key: "hasil", n: 2, label: "Hasil Sekolah", short: "Hasil", href: "/peta-sekolah", icon: "map-pin" },
  { key: "strategi", n: 3, label: "Strategi", short: "Strategi", href: "/strategi", icon: "clipboard" },
  { key: "dokumen", n: 4, label: "Dokumen", short: "Dokumen", href: "/unduhan", icon: "download" },
];

export const isComplete = (child: Child | null) => !!child && child.steps >= WIZARD_TOTAL;

/** Hasil, Strategi, dan Dokumen terbuka begitu data anak lengkap (rekomendasi langsung tersedia). */
export function stageStatus(child: Child | null): Record<StageKey, StageState> {
  const done = isComplete(child);
  return {
    data: done ? "selesai" : "terbuka",
    hasil: done ? "terbuka" : "terkunci",
    strategi: done ? "terbuka" : "terkunci",
    dokumen: done ? "terbuka" : "terkunci",
  };
}

/** Langkah wizard pertama yang belum disimpan. */
export const nextWizardHref = (child: Child | null) =>
  `/isi-data/${Math.min((child?.steps ?? 0) + 1, WIZARD_TOTAL)}`;

/** Tahap yang perlu dikerjakan berikutnya untuk satu anak. */
export function continueTarget(child: Child | null): { label: string; href: string } {
  if (!isComplete(child)) {
    return { label: "Lanjutkan isi data", href: nextWizardHref(child) };
  }
  return { label: "Lihat strategi", href: "/strategi" };
}

/** Tahap untuk sebuah path (halaman turunan menandai tahap induknya). */
export function stageOf(pathname: string): StageKey | null {
  const under = (p: string) => pathname === p || pathname.startsWith(`${p}/`);
  if (under("/anak-saya") || under("/isi-data")) return "data";
  if (under("/peta-sekolah") || under("/detail-sekolah")) return "hasil";
  if (under("/strategi") || under("/cadangan")) return "strategi";
  if (under("/unduhan")) return "dokumen";
  return null;
}

// ---------- Akses dan routing ----------

export const PUBLIC_PATHS = ["/", "/panduan", "/tanya-jawab", "/masuk", "/akses-ditolak", "/cek-cepat"];
const PARENT_PREFIXES = ["/anak-saya", "/isi-data", "/peta-sekolah", "/detail-sekolah", "/strategi", "/cadangan", "/unduhan"];

const underAny = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/** Peran yang boleh membuka path. Null = publik. */
export function rolesFor(pathname: string): Role[] | null {
  if (pathname === "/cek-cepat/simpan") return ["orang-tua"];
  if (underAny(pathname, PARENT_PREFIXES)) return ["orang-tua"];
  if (pathname.startsWith("/kebijakan-")) return ["kebijakan", "admin"];
  if (pathname.startsWith("/admin-")) return ["admin"];
  return null;
}

/** Beranda tiap peran setelah login. */
export function homeFor(session: Session): string {
  if (session.role === "kebijakan") return "/kebijakan-ringkasan";
  if (session.role === "admin") return "/admin-aturan";
  if (session.children.length === 0) return "/isi-data/1";
  if (session.children.length === 1 && !isComplete(session.child)) return nextWizardHref(session.child);
  return "/anak-saya";
}

/** `next` hanya diterima bila path internal dan boleh dibuka peran tersebut. */
export function safeNext(next: string | undefined | null, session: Session): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  const path = next.split(/[?#]/)[0];
  const roles = rolesFor(path);
  if (roles && !roles.includes(session.role)) return null;
  if (path === "/masuk" || path === "/akses-ditolak") return null;
  return next;
}
