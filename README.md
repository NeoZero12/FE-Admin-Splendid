# Splendid Admin

Panel Pasar Splendid Malang menggunakan Next.js App Router.

## Menjalankan aplikasi lokal

Pastikan layanan MySQL/MariaDB Laragon aktif, lalu jalankan backend di terminal pertama:

```powershell
cd "..\backend admin"
Copy-Item .env.example .env
# Atur ADMIN_EMAIL, ADMIN_PASSWORD, dan AUTH_TOKEN_SECRET di .env
npm install
npm run dev
```

`AUTH_TOKEN_SECRET` harus berisi minimal 32 karakter. Backend membuat database `admin_splendid` bila belum ada dan membuat tabel khusus untuk bunga, burung, ikan hias, hewan peliharaan, perlengkapan, inventaris, pengguna, forum, lokasi pasar, dan profil admin. Pastikan `DB_USER` memiliki izin membuat database jika database belum dibuat.

Jalankan frontend di terminal kedua:

```powershell
cd "..\splendid-admin"
Copy-Item .env.example .env.local
npm install
npm run dev
```

Buka `http://localhost:3000`. Permintaan `/api` diteruskan oleh Next.js ke `BACKEND_API_URL` (default `http://127.0.0.1:4000/api`), jadi backend dan MySQL perlu tetap berjalan. Jika backend mati, halaman menampilkan pesan koneksi yang bisa ditindaklanjuti alih-alih error browser `Failed to fetch`.

## API admin

- `POST /api/auth/login` menerima `{ "email", "password" }` dan mengembalikan token Bearer.
- `POST /api/auth/register` menerima `{ "name", "email", "password" }` untuk membuat akun admin; endpoint ini memerlukan token admin aktif.
- `GET /api/auth/me` memvalidasi token sesi.
- `POST /api/auth/logout` mengakhiri sesi aktif.
- `POST /api/auth/change-password` menerima `{ "currentPassword", "newPassword" }` untuk mengganti kata sandi admin yang sedang masuk.
- `GET /api/data/:collection` mencantumkan data koleksi.
- `GET /api/data/:collection/:id` mengambil satu data.
- `POST /api/data/:collection` membuat data.
- `PUT` atau `PATCH /api/data/:collection/:id` memperbarui data.
- `DELETE /api/data/:collection/:id` menghapus data.

Semua endpoint `/api/data/*` memerlukan header `Authorization: Bearer <token>`. Koleksi menerima huruf, angka, tanda hubung, dan garis bawah, misalnya `flowers`, `birds`, `pets`, `supplies`, `users`, atau `inventory`. Setiap record memiliki `id`, `createdAt`, dan `updatedAt` yang dikelola API.
