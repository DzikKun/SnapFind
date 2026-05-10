# Bab 4.2: Logika Sistem SNAPFIND
## Platform Agregator Fotografi Event berbasis Face-Matching AI

---

## 4.2.1 Logika Sistem: Autentikasi & Login (RBAC - Role Based Access Control)

Sistem autentikasi SNAPFIND mengimplementasikan mekanisme kontrol akses berbasis peran (Role-Based Access Control) untuk membedakan hak akses antara tiga kategori pengguna: Admin, Fotografer (Photographer), dan Peserta Event (User). Berikut adalah alur kerja logis sistem autentikasi:

### Alur Autentikasi dan RBAC:

1. **Validasi Input Kredensial Frontend**
   - Pengguna memasukkan username dan password melalui formulir login di halaman Login.tsx
   - Frontend melakukan validasi input dasar (tidak kosong, format valid) sebelum mengirimkan ke backend
   - Jika validasi gagal, pesan error ditampilkan di UI tanpa melakukan request ke server

2. **Pengiriman Kredensial ke Backend Server**
   - Frontend mengirimkan HTTP POST request ke endpoint `/api/login` dengan payload berisi username dan password dalam format JSON
   - Request header menyertakan `Content-Type: application/json` untuk mengidentifikasi tipe data
   - Server menerima request dan melakukan parsing terhadap body JSON yang dikirim

3. **Proses Autentikasi di Backend**
   - Backend (Node.js Server) memanggil fungsi `authenticateUser(username, password)` dari module `database.cjs`
   - Fungsi ini melakukan pencocokan credential pengguna terhadap database pengguna demo yang tersimpan dalam struktur data lokal:
     * Username: `user` dengan password: `user123` → Role: `user`
     * Username: `photographer` dengan password: `photo123` → Role: `photographer`
     * Username: `admin` dengan password: `admin123` → Role: `admin`
   - Jika kredensial cocok, backend mereturn response JSON: `{ success: true, role: <role>, username: <username> }`
   - Jika kredensial tidak cocok, backend mereturn HTTP status 401 dengan response: `{ success: false, error: "Invalid credentials" }`

4. **Penyimpanan Session di Frontend (localStorage)**
   - Frontend menerima response dari server dengan status sukses
   - Data user `{ username: <username>, role: <role> }` disimpan di `localStorage` dengan key `'user'` dalam format JSON string
   - Penyimpanan di localStorage memungkinkan user tetap login meskipun melakukan refresh halaman (persistent session)
   - AuthContext React mengupdate state global `user` dengan data yang baru login

5. **Implementasi Protected Routes dengan RBAC**
   - Setiap route yang memerlukan autentikasi dibungkus dengan component `ProtectedRoute`
   - ProtectedRoute melakukan pengecekan:
     * Apakah user sudah authenticated (ada di `user` state)
     * Apakah role user sesuai dengan `allowedRoles` yang ditetapkan pada route
   - Jika user belum authenticated, system me-redirect ke halaman `/login`
   - Jika user authenticated tetapi role tidak sesuai, system me-redirect ke dashboard sesuai rolenya:
     * Role `user` → redirect ke `/user` (User Dashboard)
     * Role `photographer` → redirect ke `/photographer` (Photographer Dashboard)
     * Role `admin` → redirect ke `/admin` (Admin Dashboard)

6. **Pengecekan Otomatis Session saat Aplikasi Pertama Kali Dimuat**
   - Saat aplikasi React pertama kali di-render (mounting), AuthContext melakukan lifecycle check via `useEffect`
   - Jika `localStorage` masih menyimpan data user, maka user secara otomatis di-login ulang tanpa perlu input kredensial
   - Jika `localStorage` kosong atau error saat parsing, user dianggap belum login dan diarahkan ke halaman login

7. **Logout dan Penghapusan Session**
   - Saat user mengklik tombol logout, fungsi `logout()` dari AuthContext dijalankan
   - State global `user` di-set menjadi `null`
   - Data user dihapus dari `localStorage` dengan method `removeItem('user')`
   - User diarahkan/redirect ke halaman login (`/login`)

8. **Fallback Login Lokal (Offline Mode)**
   - Jika backend server tidak tersedia (network error), sistem memiliki mekanisme fallback
   - Frontend melakukan validasi kredensial secara lokal menggunakan daftar demo user yang di-hardcode
   - Dengan cara ini, login tetap berfungsi meski backend sedang down (graceful degradation)
   - Kondisi ini ditandai dengan console warning untuk debugging

### Aturan Bisnis RBAC:

- **Admin**: Memiliki akses penuh ke Admin Dashboard, dapat melihat semua event, foto, transaksi, dan withdrawal request dari fotografer
- **Fotografer**: Dapat mengakses Photographer Dashboard, upload foto untuk event tertentu, lihat statistik penjualan, dan submit withdrawal request
- **User/Peserta**: Dapat mengakses User Dashboard dan Search Photos page, melakukan search menggunakan foto selfie, melihat foto yang cocok, dan melakukan pembelian

---

## 4.2.2 Logika Sistem: Proses Unggah dan Ekstraksi Wajah oleh Fotografer

Proses unggah foto oleh fotografer melibatkan serangkaian operasi di backend untuk memastikan kualitas data, keamanan, dan kesiapan untuk proses face-matching. Berikut adalah alur logis sistem unggah dan ekstraksi wajah:

### Alur Proses Unggah dan Ekstraksi Wajah:

1. **Inisiasi Upload dari Frontend Fotografer**
   - Fotografer memilih event tertentu dari daftar event aktif di Photographer Dashboard
   - Fotografer mengunggah file foto melalui file input element dengan validasi client-side:
     * Tipe file harus image (jpg, jpeg, png, gif, webp)
     * Ukuran file maksimal 10 MB
   - Frontend menampilkan preview thumbnail foto sebelum upload untuk konfirmasi

2. **Preparasi FormData dan Pengiriman Multipart Request**
   - Frontend membuat FormData object yang berisi:
     * File foto (binary data)
     * eventId (ID event tempat foto diambil)
   - Frontend mengirimkan HTTP POST request ke endpoint `/api/events/{eventId}/photos` dengan content-type `multipart/form-data`
   - Request ini dilakukan dengan authentication context yang memastikan hanya fotografer yang bisa upload

3. **Penerimaan File di Backend dengan Multer Middleware**
   - Backend menggunakan middleware Multer untuk proses upload file
   - Multer mengvalidasi file:
     * Memastikan MIME type dimulai dengan `image/`
     * Memastikan ukuran file tidak melebihi limit 10 MB
   - Jika validasi gagal, Multer return error dan request di-terminate
   - File yang valid disimpan ke folder `/backend/uploads/` dengan nama unik: `{timestamp}-{random-number}.{extension}`

4. **Simpan Metadata Foto ke JSON Database**
   - Backend menerima file path dari Multer dan membuat object foto:
     ```
     {
       id: {timestamp},
       eventId: {eventId},
       url: http://localhost:4000/uploads/{filename},
       price: {price},
       watermark: true,
       createdAt: {ISO-timestamp}
     }
     ```
   - Metadata foto ditambahkan ke array `photos` di file `db.json` melalui fungsi `addPhotoToEvent(eventId, photoData)`
   - Database file di-update (write) dengan data terbaru

5. **Ekstraksi Fitur Wajah dan Pembuatan Face Embedding**
   - Backend menjalankan Python script `match_engine.py` untuk mengekstraksi fitur wajah dari foto yang baru diupload
   - Proses ekstraksi menggunakan library face-api.js atau TensorFlow.js yang sudah pre-trained:
     * Model: `tiny_face_detector_model` untuk deteksi wajah
     * Model: `face_landmark_68_model` untuk ekstraksi landmark wajah
     * Model: `face_recognition_model` untuk generate embedding vector 128-dimensi
   - Embeddings disimpan sebagai array float32 di database untuk setiap foto yang terdeteksi wajahnya

6. **Validasi Deteksi Wajah**
   - Jika foto berisi wajah yang terdeteksi dengan confidence score > threshold tertentu (misalnya 0.5), proses lanjut
   - Jika tidak ada wajah yang terdeteksi atau confidence rendah, foto tetap disimpan tapi ditandai sebagai `detectionFailed: true`
   - Error handling: Jika Python script gagal, error di-log di console backend dan foto tetap disimpan dengan `faceEmbeddings: []`

7. **Pembuatan Watermark pada Foto**
   - Backend menjalankan image processing untuk menambahkan watermark ke foto asli
   - Watermark berisi text: "© SNAPFIND" dan timestamp upload
   - Watermarked image disimpan sebagai versi preview (resolusi lebih rendah ~800px)
   - Foto original tanpa watermark disimpan secara terpisah untuk keperluan unlock (setelah pembayaran)

8. **Penyimpanan ke Vector Database (Optional - untuk skala production)**
   - Jika sistem menggunakan Vector DB terpisah (misal: Pinecone, Weaviate, atau Milvus):
     * Face embeddings di-insert ke Vector DB dengan metadata: `{ photoId, eventId, similarity_metrics }`
     * Setiap embedding di-index untuk query cepat menggunakan similarity search
   - Untuk skala development/demo, embeddings disimpan langsung di JSON database

9. **Response dan Notifikasi Sukses**
   - Backend mereturn HTTP 201 (Created) dengan response JSON:
     ```
     {
       message: "Photo uploaded successfully",
       photo: { id, url, price, watermark, ... },
       event: { eventId, name, foundCount, ... }
     }
     ```
   - Frontend menampilkan notifikasi sukses kepada fotografer
   - Foto muncul di gallery event dengan status "Pending Embedding" jika masih dalam proses ekstraksi
   - Setelah ekstraksi selesai, status berubah menjadi "Ready for Search"

### Aturan Bisnis Unggah Foto:

- Hanya role `photographer` yang dapat melakukan upload foto
- Foto hanya dapat diupload ke event yang status-nya `active`
- Setiap foto dikenakan biaya hosting yang ditambahkan ke revenue fotografer
- Watermark otomatis ditambahkan untuk semua foto preview yang dilihat user non-pembeli
- Foto yang tidak berhasil deteksi wajah tetap disimpan tapi tidak dapat di-search

---

## 4.2.3 Logika Sistem: Pencarian Foto via Face-Matching AI oleh Peserta

Proses pencarian foto menggunakan teknologi face-matching AI yang mengekstraksi wajah dari selfie peserta dan mencocokkannya dengan database foto event menggunakan algoritma similarity search. Berikut adalah alur logis sistem pencarian:

### Alur Proses Face-Matching Search:

1. **Inisiasi Upload Selfie dari Frontend Peserta**
   - Peserta (User) memilih event tertentu dari halaman Search Photos
   - Peserta mengupload file foto selfie (foto wajah pribadi mereka) melalui file input
   - Frontend melakukan validasi:
     * File harus bertipe image
     * Ukuran file maksimal 10 MB
   - Frontend menampilkan preview selfie sebelum melakukan search

2. **Pengiriman Selfie ke Backend untuk Ekstraksi**
   - Frontend membuat FormData berisi:
     * File selfie (binary)
     * eventId (ID event yang dicari)
   - Frontend mengirimkan HTTP POST request ke endpoint `/api/search` dengan content-type `multipart/form-data`
   - Request dilakukan dengan timeout tertentu (misal 30 detik) karena proses ekstraksi memakan waktu

3. **Penerimaan Selfie di Backend dengan Validasi Awal**
   - Backend menerima request melalui Multer middleware
   - Multer melakukan validasi file (MIME type, ukuran)
   - File selfie disimpan sementara di folder `/backend/uploads/` dengan timestamp unique
   - Backend mengekstraksi eventId dari request body

4. **Validasi Parameter dan Database Check**
   - Backend memvalidasi apakah eventId valid dan event masih aktif
   - Backend mengquery database untuk mengambil daftar semua foto yang terkait dengan eventId tersebut:
     ```
     photos = db.photos.filter(p => p.eventId === eventId)
     ```
   - Jika tidak ada foto untuk event, backend return: `{ matchedFaces: 0, matches: [] }`

5. **Ekstraksi Face Embedding dari Selfie Peserta**
   - Backend menjalankan Python script `match_engine.py` dengan parameter: `[userSelfiePath, null]` (mode ekstraksi saja)
   - Script menggunakan pre-trained face models untuk:
     * Deteksi wajah di foto selfie
     * Ekstraksi facial landmarks
     * Generate 128-dimensional embedding vector dari wajah
   - Jika wajah terdeteksi, embedding disimpan dalam memory sebagai `userEmbedding`
   - Jika tidak ada wajah terdeteksi (confidence < threshold), return error: `{ error: "No face detected in selfie" }`

6. **Iterasi Pencocokan dengan Semua Foto Event (Face-Matching Loop)**
   - Backend membuat loop untuk setiap foto di event:
     ```
     for each photo in eventPhotos {
       photoPath = path.join('uploads/', extractFileName(photo.url))
       faceEmbedding = photo.faceEmbeddings
       similarity = cosineSimilarity(userEmbedding, faceEmbedding)
       if (similarity > 0.4) { // threshold 40%
         matches.push({ photoId, similarity, url })
       }
     }
     ```

7. **Penghitungan Similarity Score menggunakan Cosine Similarity**
   - Untuk setiap foto, backend menghitung cosine similarity antara user embedding dan photo embedding:
     ```
     similarity = (userEmbedding · photoEmbedding) / 
                  (||userEmbedding|| × ||photoEmbedding||)
     ```
   - Hasil similarity score adalah nilai float antara 0.0 hingga 1.0 (atau 0-100 persen)
   - Threshold minimum similarity ditetapkan 0.4 (40%) untuk menghindari false positives
   - Foto dengan similarity score di atas threshold ditambahkan ke hasil matches

8. **Sorting dan Limiting Results**
   - Backend mengurutkan hasil matches berdasarkan similarity score secara descending (skor tertinggi dahulu)
   - Backend membatasi hasil maksimal 12 foto (untuk performance dan UX)
   - Results yang telah di-sort dan di-limit disimpan dalam array `matches`

9. **Auto-Burn (Penghapusan Otomatis) Data Selfie untuk Privasi**
   - Setelah proses ekstraksi dan matching selesai, backend langsung menghapus file selfie dari disk:
     ```
     if (fs.existsSync(userSelfiePath)) {
       fs.unlinkSync(userSelfiePath)
     }
     ```
   - Selfie tidak disimpan ke database atau storage jangka panjang
   - Embedding vector selfie tidak disimpan, hanya digunakan dalam memory untuk sesi search saat itu
   - Prinsip ini memastikan privasi peserta: tidak ada foto wajah peserta yang tersimpan di server

10. **Response dengan Hasil Pencarian**
    - Backend mereturn HTTP 200 dengan response JSON:
      ```
      {
        matchedFaces: {count},
        matches: [
          { photoId, similarity, url, price, watermark: true },
          { photoId, similarity, url, price, watermark: true },
          ...
        ]
      }
      ```
    - Frontend menerima hasil dan menampilkan foto-foto yang cocok dalam grid gallery format
    - Setiap foto ditampilkan dengan:
      * Thumbnail dengan watermark
      * Similarity score percentage (misal: "92% Match")
      * Harga foto
      * Tombol "Buy Now" atau "View Details"

11. **Error Handling dan User Feedback**
    - Jika tidak ada wajah terdeteksi di selfie: display error message "Wajah tidak terdeteksi, coba lagi dengan foto yang lebih jelas"
    - Jika tidak ada match ditemukan: display message "Tidak ada foto yang cocok untuk event ini"
    - Jika backend error: display error message "Terjadi kesalahan saat pencarian, coba lagi"

### Aturan Bisnis Face-Matching:

- Peserta hanya dapat search untuk event yang masih status `active`
- Setiap search request dicatat di database untuk keperluan analytics
- Similarity threshold minimum 0.4 (40%) untuk menghindari false positives dan maintain kualitas
- Selfie peserta tidak pernah disimpan (auto-burn) untuk menjaga privasi
- Watermark otomatis ditampilkan pada semua foto di hasil search sampai peserta melakukan pembayaran
- Peserta dapat melihat harga foto dan similarity score sebelum membeli

---

## 4.2.4 Logika Sistem: Transaksi Pembelian dan Pembukaan Akses Foto

Proses transaksi pembelian melibatkan integrasi payment gateway, validasi pembayaran, dan pemberian akses ke foto resolusi tinggi tanpa watermark. Berikut adalah alur logis sistem transaksi:

### Alur Proses Transaksi Pembelian:

1. **Inisiasi Pembelian dari Frontend**
   - Peserta mengklik tombol "Beli Sekarang" atau "Buy Now" pada foto yang ingin dibeli di search results gallery
   - Frontend membuka modal/dialog konfirmasi pembelian yang menampilkan:
     * Preview foto dengan watermark
     * Detail harga: Harga Foto (Rp 15.000) + Biaya Admin (Rp 5.000) = Total (Rp 20.000)
     * Opsi download resolusi tinggi (tanpa watermark) atau print
   - Peserta mengkonfirmasi pembelian dengan mengklik tombol "Lanjutkan ke Pembayaran"

2. **Persiapan Data Transaksi di Frontend**
   - Frontend membuat object transaksi sementara dengan informasi:
     ```
     {
       photoId: {photoId},
       userId: {username},
       eventId: {eventId},
       amount: 20000,
       itemDescription: "Foto Event - {eventName}",
       timestamp: {current-timestamp}
     }
     ```
   - Data transaksi disimpan di local state React untuk referensi selama proses pembayaran

3. **Integrasi Payment Gateway (Midtrans/Stripe/PayPal)**
   - Frontend mengakses SDK payment gateway yang sudah ter-integrasi
   - Frontend mengirimkan HTTP POST ke endpoint backend `/api/transactions` dengan payload berisi:
     * amount
     * itemDescription
     * photoId
     * userId
     * redirectUrl (URL untuk di-redirect setelah pembayaran)
   - Backend menerima request dan membuat transaction record di database:
     ```
     {
       transactionId: {unique-id},
       photoId: {photoId},
       userId: {userId},
       amount: 20000,
       status: "pending",
       createdAt: {timestamp}
     }
     ```

4. **Pembuatan Payment Token dan Redirect ke Payment Page**
   - Backend menggunakan SDK payment gateway untuk membuat payment token:
     * Contoh Midtrans: `snap.createTransaction()` dengan server_key
     * Token mengandung informasi pembayaran dan secure identifier
   - Backend mereturn response berisi Snap Token atau payment redirect URL
   - Frontend menerima token dan menginisialisasi Snap payment widget (Midtrans) atau redirect ke payment page provider
   - Peserta dialihkan ke halaman payment gateway yang aman

5. **Proses Pembayaran oleh Peserta**
   - Peserta memasukkan metode pembayaran (credit card, e-wallet, transfer bank, dll)
   - Peserta memasukkan data pembayaran (nomor kartu, PIN, OTP, dll) ke payment gateway
   - Payment gateway melakukan validasi dan proses pembayaran dengan institusi keuangan
   - Jika pembayaran berhasil: Payment gateway generate notifikasi sukses
   - Jika pembayaran gagal: Payment gateway menampilkan error message ke peserta

6. **Webhook Callback Pembayaran Berhasil dari Payment Gateway**
   - Setelah pembayaran sukses, payment gateway mengirimkan HTTP POST webhook request ke endpoint backend `/api/payments/callback`
   - Webhook berisi data:
     ```
     {
       transactionId: {transaction-id},
       transactionStatus: "settlement" / "capture",
       paymentType: "credit_card" / "bank_transfer" / etc,
       amount: 20000,
       timestamp: {timestamp},
       signature: {security-signature}
     }
     ```
   - Backend menerima webhook dan melakukan validasi signature untuk memastikan request authentic

7. **Validasi Signature dan Integritas Webhook**
   - Backend menggunakan server_key payment gateway untuk validate signature webhook:
     ```
     calculatedSignature = MD5(transactionId + status + serverKey)
     if (calculatedSignature === receivedSignature) {
       // Webhook valid, proses pembayaran
     } else {
       // Webhook invalid atau termodifikasi, reject
     }
     ```
   - Jika signature tidak valid, webhook di-reject dan transaction status tetap "pending"
   - Jika signature valid, backend melanjutkan proses pembayaran

8. **Update Status Transaksi di Database**
   - Backend update transaction record di database:
     ```
     transaction.status = "completed"
     transaction.paymentMethod = webhook.paymentType
     transaction.paidAt = webhook.timestamp
     db.write()
     ```
   - Transaction record sekarang memiliki status "completed"

9. **Pemberian Akses Unduh Foto Resolusi Tinggi**
   - Backend membuat purchase record baru di database:
     ```
     {
       purchaseId: {unique-id},
       photoId: {photoId},
       userId: {userId},
       transactionId: {transactionId},
       accessToken: {unique-random-token},
       expiresAt: {timestamp + 30-days},
       status: "active"
     }
     ```
   - Access token adalah string random yang akan digunakan untuk verifikasi download
   - Purchase record disimpan di database dengan validity period (misal: 30 hari)

10. **Redirect dan Notifikasi Sukses Pembayaran**
    - Backend mereturn HTTP 200 response dengan success notification
    - Frontend menerima notifikasi dan menampilkan modal/page sukses pembayaran:
      * "Pembayaran Berhasil! Foto siap diunduh"
      * Tombol "Unduh Foto" dan "Lihat Akun Saya"
    - Frontend mengarahkan peserta ke halaman "Download/My Purchases" setelah konfirmasi

11. **Proses Unduh Foto Tanpa Watermark**
    - Peserta mengklik tombol "Unduh Foto" di halaman My Purchases atau Search Results (setelah pembayaran)
    - Frontend mengirimkan HTTP GET request ke endpoint `/api/photos/{photoId}/download` dengan parameter:
      * accessToken
      * userId
    - Backend melakukan validasi:
      * Cek apakah purchase record dengan kombinasi photoId + userId + accessToken valid
      * Cek apakah purchase belum expired (expiresAt > current-time)
      * Cek apakah status purchase adalah "active"
    - Jika validasi gagal, return HTTP 403 Forbidden
    - Jika validasi sukses, backend mereturn file foto original (resolusi tinggi, tanpa watermark)

12. **Pemberian Akses Download dan File Serving**
    - Backend membaca file foto original dari storage `/backend/uploads/original/{photoId}.jpg`
    - Backend mereturn file dengan HTTP header:
      ```
      Content-Type: image/jpeg
      Content-Disposition: attachment; filename="{photoId}.jpg"
      Content-Length: {file-size}
      ```
    - Browser peserta otomatis download file foto ke device lokal

13. **Pencatatan Event Transaksi untuk Analytics**
    - Backend mencatat event transaksi di transaction log:
      ```
      {
        type: "purchase",
        photoId: {photoId},
        userId: {userId},
        amount: 20000,
        photographer: {photographer-id},
        timestamp: {timestamp},
        status: "completed"
      }
      ```
    - Log ini digunakan untuk reporting, analytics, dan settlement ke fotografer

14. **Settlement dan Revenue Distribution**
    - Backend secara periodik (harian/mingguan) melakukan settlement:
      * Hitung total penjualan per fotografer dari transaction log
      * Hitung revenue yang harus dibayarkan ke fotografer (misal: 70% dari total, 30% untuk platform)
      * Buat withdrawal transaction untuk setiap fotografer
    - Fotografer dapat melihat revenue dan melakukan withdraw request di Photographer Dashboard

### Aturan Bisnis Pembelian dan Transaksi:

- Harga foto ditetapkan Rp 15.000 per foto (default, dapat disesuaikan admin)
- Biaya admin platform Rp 5.000 per transaksi
- Total harga = Harga Foto + Biaya Admin = Rp 20.000
- Revenue split: 75% untuk fotografer, 25% untuk platform
- Download akses valid selama 30 hari dari tanggal pembayaran
- Peserta dapat download ulang foto tanpa biaya tambahan selama periode validity
- Watermark hanya ditampilkan pada preview/gallery, file download adalah foto original tanpa watermark
- Webhook payment gateway harus valid dan authentic sebelum transaction status berubah
- Admin dapat melihat semua transaksi dan melakukan reconciliation di Admin Dashboard
- Fotografer dapat melihat revenue dan membuat withdrawal request minimal Rp 50.000

---

## CATATAN IMPLEMENTASI TEKNIS:

Dokumentasi ini menjelaskan alur logis ideal dari sistem SNAPFIND. Implementasi production harus mempertimbangkan:

- **Error Handling**: Semua proses harus memiliki fallback dan graceful error handling
- **Database Optimization**: Untuk skala production, gunakan relational database (MySQL/PostgreSQL) bukan JSON file
- **Vector Database**: Untuk similarity search cepat, gunakan dedicated vector DB (Pinecone, Weaviate, Milvus)
- **Caching**: Implementasikan caching untuk frequently accessed data (event, photo metadata)
- **Security**: Validasi input semua endpoint, gunakan authentication token (JWT), rate limiting
- **Logging & Monitoring**: Log semua transaksi dan aktivitas penting untuk audit trail
- **Scalability**: Gunakan cloud storage (S3, GCS) untuk file foto, bukan local disk
- **Performance**: Optimasi image processing, implement queue system untuk background jobs

