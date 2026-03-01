import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = "losev-gonulluluk-2026";
  return createHash("sha256").update(password + salt).digest("hex");
}

// Tüm seed kullanıcıları için varsayılan şifre: 123456
const DEFAULT_PASSWORD = hashPassword("123456");

async function main() {
  console.log("🌱 Veritabanı seed işlemi başlatılıyor...");

  // Mevcut verileri temizle
  await prisma.badge.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();

  // ──────────────────────────────────────────────
  // Kullanıcılar
  // ──────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      adSoyad: "Sistem Yöneticisi",
      email: "admin@losev.org",
      sifre: DEFAULT_PASSWORD,
      okul: "LÖSEV Merkez",
      sinif: "-",
      rol: "ADMIN",
    },
  });

  const teacher = await prisma.user.create({
    data: {
      adSoyad: "Ayşe Öğretmen",
      email: "ayse@losev.org",
      sifre: DEFAULT_PASSWORD,
      okul: "Ankara Fen Lisesi",
      sinif: "-",
      rol: "TEACHER",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      adSoyad: "Mehmet Yılmaz",
      email: "mehmet@okul.edu.tr",
      sifre: DEFAULT_PASSWORD,
      okul: "Ankara Fen Lisesi",
      sinif: "11-A",
      rol: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      adSoyad: "Zeynep Kaya",
      email: "zeynep@okul.edu.tr",
      sifre: DEFAULT_PASSWORD,
      okul: "Ankara Fen Lisesi",
      sinif: "10-B",
      rol: "STUDENT",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      adSoyad: "Ali Demir",
      email: "ali@okul.edu.tr",
      sifre: DEFAULT_PASSWORD,
      okul: "İstanbul Anadolu Lisesi",
      sinif: "12-C",
      rol: "STUDENT",
    },
  });

  console.log("✅ Kullanıcılar oluşturuldu.");

  // ──────────────────────────────────────────────
  // Faaliyetler
  // ──────────────────────────────────────────────

  await prisma.activity.createMany({
    data: [
      {
        ogrenciId: student1.id,
        tarih: new Date("2026-01-15"),
        tur: "SEMINER",
        saat: 3,
        aciklama: "Lösemi farkındalık semineri düzenlendi",
        durum: "APPROVED",
      },
      {
        ogrenciId: student1.id,
        tarih: new Date("2026-02-10"),
        tur: "STANT",
        saat: 5,
        aciklama: "Okul bahçesinde bilgilendirme standı kuruldu",
        durum: "APPROVED",
      },
      {
        ogrenciId: student1.id,
        tarih: new Date("2026-02-20"),
        tur: "BAGIS",
        saat: 2,
        aciklama: "Bağış toplama kampanyası",
        durum: "PENDING",
      },
      {
        ogrenciId: student2.id,
        tarih: new Date("2026-01-20"),
        tur: "SOSYAL_MEDYA",
        saat: 4,
        aciklama: "Instagram ve Twitter'da farkındalık paylaşımları",
        durum: "APPROVED",
      },
      {
        ogrenciId: student2.id,
        tarih: new Date("2026-02-15"),
        tur: "KERMES",
        saat: 6,
        aciklama: "Okul kermesinde gönüllü çalışma",
        durum: "APPROVED",
      },
      {
        ogrenciId: student3.id,
        tarih: new Date("2026-02-25"),
        tur: "SEMINER",
        saat: 2,
        aciklama: "Kan bağışı bilgilendirme semineri",
        durum: "PENDING",
      },
    ],
  });

  console.log("✅ Faaliyetler oluşturuldu.");

  // ──────────────────────────────────────────────
  // Rozetler
  // ──────────────────────────────────────────────

  // Mehmet: 8 saat onaylı → henüz rozet yok
  // Zeynep: 10 saat onaylı → henüz rozet yok
  // Rozet barajları: BRONZ=25, GUMUS=50, ALTIN=100, PLATIN=200

  console.log("✅ Seed işlemi tamamlandı!");
  console.log(`   Admin:    ${admin.email} (şifre: 123456)`);
  console.log(`   Öğretmen: ${teacher.email} (şifre: 123456)`);
  console.log(`   Öğrenci:  ${student1.email}, ${student2.email}, ${student3.email} (şifre: 123456)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
