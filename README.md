# LÖSEV İnci Gönüllülük Takip Sistemi

LÖSEV bünyesinde faaliyet gösteren İnci Gönüllüleri'nin gönüllülük saatlerini takip eden web tabanlı uygulama.

## Teknolojiler

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Veritabanı:** SQLite + Prisma ORM
- **UI:** Radix UI (shadcn/ui), Recharts, Lucide Icons
- **Paket Yöneticisi:** pnpm

## Kurulum

### Gereksinimler

- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
pnpm install

# Prisma client oluştur
npx prisma generate

# Veritabanını oluştur
npx prisma db push

# Seed verilerini yükle
npx prisma db seed

# Geliştirme sunucusunu başlat
pnpm dev
```

Uygulama: http://localhost:3000

### Docker ile Çalıştırma

```bash
# Build ve çalıştır (tek komut)
docker compose up --build -d

# Durdur
docker compose down

# Logları görüntüle
docker compose logs -f
```

Uygulama: http://localhost:3000

## Test Giriş Bilgileri

| Rol          | E-posta            | Şifre  |
| ------------ | ------------------ | ------ |
| **Admin**    | admin@losev.org    | 123456 |
| **Öğretmen** | ayse@losev.org     | 123456 |
| **Öğrenci**  | mehmet@okul.edu.tr | 123456 |
| **Öğrenci**  | zeynep@okul.edu.tr | 123456 |
| **Öğrenci**  | ali@okul.edu.tr    | 123456 |

## Roller ve Yetkiler

### Öğrenci

- Gönüllülük faaliyeti girişi (seminer, stant, bağış, kermes, sosyal medya, farkındalık)
- Saat takibi (toplam, aylık, yıllık)
- Rozet/sertifika görüntüleme
- Hedef ilerleme takibi

### Öğretmen

- Öğrenci faaliyetlerini onaylama/reddetme
- Okul bazlı özet istatistikler
- Sınıf listesi görüntüleme

### Admin (Genel Merkez)

- Tüm okul/öğrenci istatistikleri
- En aktif öğrenci ve okul sıralamaları
- Faaliyet türü dağılım grafikleri

## Rozet Sistemi

| Rozet     | Gerekli Saat |
| --------- | ------------ |
| 🥉 Bronz  | 25 saat      |
| 🥈 Gümüş  | 50 saat      |
| 🥇 Altın  | 100 saat     |
| 💎 Platin | 200 saat     |

## Proje Yapısı

```
├── actions/          # Server actions (auth, activity, user)
├── app/              # Next.js App Router sayfaları
│   ├── (auth)/       # Login & Register
│   └── dashboard/    # Ana panel
├── components/       # React bileşenleri
│   ├── dashboard/    # Panel bileşenleri
│   └── ui/           # shadcn/ui bileşenleri
├── prisma/           # Veritabanı şeması ve seed
├── lib/              # Yardımcı fonksiyonlar
└── hooks/            # React hooks
```

## Lisans

Bu proje LÖSEV için geliştirilmiştir.
