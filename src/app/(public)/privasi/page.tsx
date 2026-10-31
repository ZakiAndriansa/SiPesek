import type { Metadata } from "next";
import { Container, PageHeader, Section } from "@/components";
import { MasukGoogle } from "@/components/masuk-google/MasukGoogle";
import { EMAIL_KONTAK } from "@/data/kontak";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Data apa yang disimpan SiPesek, untuk apa dipakai, dan cara menghapusnya.",
};

// Isi halaman ini harus sesuai dengan yang benar-benar disimpan di prisma/schema.prisma dan
// src/app/api/peluang/route.ts. Ubah keduanya bersamaan.
export default function PrivasiPage() {
  return (
    <Container reading>
      <PageHeader
        title="Kebijakan Privasi"
        desc="Berlaku sejak 30 Oktober 2026. Kami hanya menyimpan data yang perlu untuk menghitung dan mengingat peluang SPMB anak."
      />

      <Section id="ringkas">
        <div className="card">
          <h2 className="card__title">Ringkasnya</h2>
          <ol className="privasi__daftar">
            <li>Cek Cepat tanpa akun tidak menyimpan isian maupun hasilnya.</li>
            <li>Titik lokasi rumah, NISN lengkap, serta nilai rapor dan TKA per mata pelajaran tidak pernah disimpan.</li>
            <li>Data tidak dijual, dan SiPesek tidak memasang iklan atau pelacak.</li>
            <li>Bapak/Ibu bisa menghapus data anak atau seluruh akun kapan saja.</li>
          </ol>
        </div>
      </Section>

      <Section id="tanpa-akun">
        <div className="card">
          <h2 className="card__title">Cek Cepat tanpa akun</h2>
          <p className="card__text">
            Isian, termasuk NISN dan titik rumah, dikirim ke server SiPesek hanya untuk dihitung. NISN diperiksa bentuknya
            (10 digit dan kewajaran tahun lahir), lalu semua isian dibuang. Hasil langsung ditampilkan tanpa disimpan.
          </p>
          <p className="card__text">
            Hasil baru disimpan bila Bapak/Ibu masuk dengan Google lalu menekan Simpan dan menyetujuinya. Yang disimpan
            sama dengan daftar di bawah; titik rumah dan nilai rapor tetap tidak disimpan.
          </p>
          <p className="card__text">
            Untuk mencegah penyalahgunaan, Cek Cepat dibatasi 10 kali per jam. Karena itu alamat IP perangkat dicatat di
            memori server paling lama satu jam, tidak ditulis ke database, dan hilang saat server dimulai ulang.
          </p>
        </div>
      </Section>

      <Section id="dengan-akun">
        <div className="card">
          <h2 className="card__title">Yang disimpan bila masuk dengan Google</h2>
          <ol className="privasi__daftar">
            <li>
              <strong>Dari akun Google:</strong> ID akun, alamat email, nama, serta waktu pertama dan terakhir masuk.
              Foto profil Google hanya ditampilkan di header dan tidak disimpan di database. SiPesek tidak meminta
              akses ke Gmail, Drive, kontak, atau data Google lainnya.
            </li>
            <li>
              <strong>Data anak:</strong> nama anak dan NISN dalam bentuk sidik (hash satu arah dengan kunci rahasia)
              ditambah 3 digit terakhirnya. Sidik dipakai agar satu NISN hanya terdaftar di satu akun; NISN lengkap
              tidak bisa dibaca kembali darinya.
            </li>
            <li>
              <strong>Riwayat cek peluang:</strong> tanggal, tahun acuan, jenjang, kecamatan sesuai KK, daftar sekolah
              dan jalur yang dihitung beserta label peluangnya, jarak rumah ke sekolah yang dibulatkan ke 50 meter,
              serta skor gabungan hasil hitungan dan rentangnya per 10 poin.
            </li>
          </ol>
          <p className="card__text">
            Isian di menu Isi data anak (nilai rapor, TKA, kondisi keluarga, dan kecamatan) disimpan di browser perangkat
            Bapak/Ibu sendiri, bukan di server, agar pengisian bisa dilanjutkan nanti. Isian Cek Cepat yang disimpan ke data anak juga ikut tersimpan di situ, agar cek berikutnya tidak perlu mengisi ulang. NISN dan titik rumah tidak ikut
            disimpan, dan semua isian itu terhapus dari perangkat saat Bapak/Ibu keluar.
          </p>
          <p className="card__text">
            Jalur afirmasi (KETM dan disabilitas), anak guru, dan perpindahan tugas orang tua hanya dihitung bila
            kondisinya dipilih. Artinya, riwayat cek juga menunjukkan kondisi tersebut. Data ini hanya terlihat oleh
            pemilik akun dan tidak ditampilkan di dashboard.
          </p>
        </div>
      </Section>

      <Section id="tidak-disimpan">
        <div className="card">
          <h2 className="card__title">Yang tidak pernah disimpan</h2>
          <ol className="privasi__daftar">
            <li>Titik lokasi rumah (koordinat peta). Lokasi hanya dipakai saat menghitung jarak.</li>
            <li>Nilai rapor dan nilai TKA per mata pelajaran.</li>
            <li>NISN lengkap.</li>
            <li>Nomor HP dan kata sandi. Masuk sepenuhnya lewat Google.</li>
          </ol>
        </div>
      </Section>

      <Section id="penggunaan">
        <div className="card">
          <h2 className="card__title">Untuk apa data dipakai</h2>
          <ol className="privasi__daftar">
            <li>Menghitung peluang dan menampilkan riwayat cek untuk orang tua pemilik akun.</li>
            <li>
              Statistik minat di dashboard publik, berupa jumlah anak per sekolah dan per kecamatan, tanpa nama atau
              data yang bisa mengenali anak. Tiap anak dihitung sekali, dari cek terakhirnya.
            </li>
          </ol>
          <p className="card__text">
            Data tidak dibagikan ke pihak lain. Pihak yang ikut memproses: Google (proses masuk), Vercel (menyajikan
            halaman), server pengelola SiPesek (menghitung peluang dan menyimpan database), dan OpenStreetMap (gambar peta
            di Cek Cepat; menerima alamat IP saat peta dimuat, tetapi tidak pernah menerima titik rumah).
          </p>
        </div>
      </Section>

      <Section id="cookie">
        <div className="card">
          <h2 className="card__title">Cookie</h2>
          <p className="card__text">
            SiPesek hanya memakai cookie yang diperlukan agar Bapak/Ibu tetap masuk dan anak yang dipilih tetap aktif,
            paling lama 30 hari. Tidak ada cookie iklan atau analitik.
          </p>
        </div>
      </Section>

      <Section id="hak">
        <div className="card">
          <h2 className="card__title">Hak Bapak/Ibu</h2>
          <p className="card__text">
            Sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, data anak hanya diproses dengan
            persetujuan orang tua atau wali, yang diberikan saat menambahkan anak.
          </p>
          <ol className="privasi__daftar">
            <li>Melihat data anak dan riwayat cek kapan saja setelah masuk.</li>
            <li>
              Mengunduh salinan data akun lewat Unduh Salinan Data di halaman Data Anak, berupa berkas JSON untuk arsip yang tidak
              bisa diimpor kembali.
            </li>
            <li>Menghapus satu hasil cek dari riwayat anak.</li>
            <li>Menghapus satu anak; seluruh riwayat cek anak itu ikut terhapus.</li>
            <li>
              Menghapus akun lewat Hapus Akun dan Seluruh Data; semua data anak dan riwayatnya ikut terhapus dari database saat
              itu juga.
            </li>
            <li>Menarik persetujuan, dengan cara menghapus data anak atau akun.</li>
          </ol>
          <p className="card__text">
            Data disimpan sampai Bapak/Ibu menghapusnya. Untuk pertanyaan atau permintaan penghapusan, hubungi{" "}
            <a href={`mailto:${EMAIL_KONTAK}`}>{EMAIL_KONTAK}</a>.
          </p>
          <div className="privasi__masuk">
            <MasukGoogle />
          </div>
        </div>
      </Section>
    </Container>
  );
}
