# AbsenApp 🚀

AbsenApp adalah aplikasi *mobile* berbasis React Native (Expo) yang dirancang secara spesifik untuk mengotomatisasi pengisian absensi presensi dalam media Google Forms.

Aplikasi ini sangat menghemat waktu Anda tiap harinya karena mampu secara cerdas meng-*inject* (menyuntikkan) data profil pengguna secara langsung ke dalam formulir web dan mengeklik *"Kirim"* sedetik setelah *loading* selesai.

## ✨ Fitur Utama
1. **Multi-Profil Karyawan:** Menunjang pembuatan lebih dari satu profil (*Ops ID*, Nama Lengkap, Nomor WhatsApp) sehingga bisa digunakan oleh banyak staf secara bergantian hanya dalam satu HP yang sama.
2. **Google Form Autofill:** Menyuntikkan _JavaScript_ khusus penambang elemen ke dalam WebView yang secara akurat akan membedah HTML formulir, lantas otomatis mengisi *Ops ID*, mengeklik *Rekam Email*, mengetik *Nama*, memutar Radio Button *Kehadiran*, hingga membongkar Dropdown Google Form murni.
3. **Google Auth Pre-flight Login:** Aplikasi dibekali jendela layar **Login Akun Google Khusus** yang mereservasi dan melindungi tautan *cookies* secara mandiri dan mengakali pembatasan Google terhadap akses WebView.
4. **Deteksi Berhasil Presisi:** Menggunakan deteksi dan pencocokan teks untuk memastikan absensi terekam sempurna (dengan notifikasi ramah).

## 🛠️ Stack Teknologi
- **Framework Utama:** [React Native](https://reactnative.dev) + [Expo](https://expo.dev)
- **Bahasa:** TypeScript
- **Manajemen Navigasi:** React Navigation (Native Stack)
- **Penyimpanan Lokal:** AsyncStorage (`@react-native-async-storage/async-storage`)
- **Pembungkus Web/Form:** React Native WebView (`react-native-webview`)

## 🚀 Cara Menjalankan Aplikasi (Tahap *Development*)

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di komputer/laptop Anda.

1. Buka repositori proyek (`absen-app`) ini secara lokal dalam Terminal.
2. Isolasi *library* dan dependensi node:
   ```bash
   npm install
   ```
3. Mulai server pengembangan Expo:
   ```bash
   npx expo start
   ```
4. Buka aplikasi **Expo Go** di HP Android (atau iOS) Anda lalu sorot dan *scan QR Code* yang muncul di terminal komputer Anda.

## 📦 Cara Build Menjadi APK Mentah (Android)

Proyek ini telah kami modifikasi strukturnya pada `eas.json` untuk dapat diekspor menjadi aplikasi *standalone* (bukan app bundle) berformat **.apk**. 

1. Install eksekutif kompilasi pembangun APK dari Expo:
   ```bash
   npm install -g eas-cli
   ```
2. Login ke kredensial akun Expo Anda secara manual di terminal (Pastikan Anda sudah daftar di [expo.dev](https://expo.dev)):
   ```bash
   eas login
   ```
3. Lakukan proses *Build* (pembentukan Android Pack):
   ```bash
   eas build -p android --profile preview
   ```
4. Jawab *pertanyaan-pertanyaan prompt* dari Expo. Jika ditanya "What would you like your Android application id/package to be?", ketik dan beri nama `com.absen.app` lalu tekan Enter. Jika ditanyakan untuk membuat Keystore, tekan  **`Y`** *(Yes)* agar perizinan dan kunci APK tertuang secara otomatis.
5. Tunggu mesin kompilasi bekerja di awan. Jika selesai, salin dan unduh tautan `build` yang disuguhkan lalu nikmati `AbsenApp.apk` Anda di mana saja!

---
> ⚠️ **Disclaimer**
> *Kode ini dibuat terutamanya diperuntukkan agar pengguna dapat belajar memanipulasi DOM dan webview menggunakan scripting eksternal yang diisolasi di react-native-webview. Pengisi-otomatis disiapkan sesuai format/field struktur Google Form per hari ini, pastikan script disesuaikan bilamana Google Forms mengubah arsitektur class di waktu mendatang.*
