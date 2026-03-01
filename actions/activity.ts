"use server";

import { prisma } from "@/lib/prisma";
import {
  createActivitySchema,
  ROZET_BARAJLARI,
  FAALIYET_TURU_MAP,
  FAALIYET_TURU_LABEL,
  type ActionResult,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ──────────────────────────────────────────────
// Prisma Model Tip Tanımları (noImplicitAny uyumluluğu)
// ──────────────────────────────────────────────

interface ActivityRecord {
  id: string;
  tarih: Date;
  tur: string;
  saat: number;
  aciklama: string;
  durum: string;
  kanitUrl: string | null;
  ogrenciId: string;
  olusturulmaTarihi: Date;
}

interface BadgeRecord {
  id: string;
  tur: string;
  kazanmaTarihi: Date;
  ogrenciId: string;
}

interface ActivityWithStudent extends ActivityRecord {
  ogrenci: {
    id: string;
    adSoyad: string;
    okul: string;
    sinif: string;
  };
}

interface StudentWithActivities {
  adSoyad: string;
  okul: string;
  faaliyetler: { saat: number }[];
}

interface StudentWithSchoolActivities {
  id: string;
  okul: string;
  faaliyetler: { saat: number }[];
}

interface StudentTopItem {
  rank: number;
  name: string;
  school: string;
  hours: number;
  initials: string;
}

// ──────────────────────────────────────────────
// 1) Yeni Faaliyet Ekleme (Öğrenci)
//    Frontend "seminer", "sosyal-medya" gibi değerler gönderir,
//    biz bunları "SEMINER", "SOSYAL_MEDYA"'ya çeviririz.
// ──────────────────────────────────────────────

export async function createActivity(
  formData: FormData
): Promise<ActionResult> {
  try {
    const frontendTur = formData.get("tur") as string;
    // Frontend value → Backend value dönüştürme
    const backendTur = FAALIYET_TURU_MAP[frontendTur] || frontendTur?.toUpperCase();

    const raw = {
      ogrenciId: formData.get("ogrenciId") as string,
      tarih: formData.get("tarih") as string,
      tur: backendTur,
      saat: Number(formData.get("saat")),
      aciklama: formData.get("aciklama") as string,
      kanitUrl: (formData.get("kanitUrl") as string) || undefined,
    };

    // Zod ile doğrulama
    const parsed = createActivitySchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Doğrulama hatası";
      return { success: false, message: firstError };
    }

    const { ogrenciId, tarih, tur, saat, aciklama, kanitUrl } = parsed.data;

    // Öğrenci var mı kontrolü
    const ogrenci = await prisma.user.findUnique({
      where: { id: ogrenciId },
    });

    if (!ogrenci) {
      return { success: false, message: "Öğrenci bulunamadı." };
    }

    if (ogrenci.rol !== "STUDENT") {
      return {
        success: false,
        message: "Faaliyet yalnızca öğrenci rolündeki kullanıcılar için eklenebilir.",
      };
    }

    // Faaliyet oluştur (varsayılan durum: PENDING)
    await prisma.activity.create({
      data: {
        ogrenciId,
        tarih: new Date(tarih),
        tur,
        saat,
        aciklama,
        kanitUrl: kanitUrl || null,
      },
    });

    revalidatePath("/");
    return { success: true, message: "Faaliyet başarıyla kaydedildi. Onay süreci başlatıldı." };
  } catch (error) {
    console.error("createActivity hatası:", error);
    return {
      success: false,
      message: "Faaliyet eklenirken bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}

// ──────────────────────────────────────────────
// 2) Faaliyet Onaylama (Öğretmen)
// ──────────────────────────────────────────────

export async function approveActivity(
  activityId: string
): Promise<ActionResult> {
  try {
    if (!activityId) {
      return { success: false, message: "Faaliyet ID gerekli." };
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return { success: false, message: "Faaliyet bulunamadı." };
    }

    if (activity.durum === "APPROVED") {
      return { success: false, message: "Bu faaliyet zaten onaylanmış." };
    }

    if (activity.durum === "REJECTED") {
      return {
        success: false,
        message: "Reddedilmiş bir faaliyet onaylanamaz.",
      };
    }

    // Durumu APPROVED yap
    await prisma.activity.update({
      where: { id: activityId },
      data: { durum: "APPROVED" },
    });

    // Onaylama sonrası rozet kontrolü yap
    const stats = await getStudentStats(activity.ogrenciId);
    if (stats.success && stats.data !== undefined) {
      await checkAndAwardBadge(activity.ogrenciId, stats.data);
    }

    revalidatePath("/");
    return { success: true, message: "Faaliyet başarıyla onaylandı." };
  } catch (error) {
    console.error("approveActivity hatası:", error);
    return {
      success: false,
      message: "Faaliyet onaylanırken bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}

// ──────────────────────────────────────────────
// 3) Faaliyet Reddetme (Öğretmen)
// ──────────────────────────────────────────────

export async function rejectActivity(
  activityId: string
): Promise<ActionResult> {
  try {
    if (!activityId) {
      return { success: false, message: "Faaliyet ID gerekli." };
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return { success: false, message: "Faaliyet bulunamadı." };
    }

    if (activity.durum !== "PENDING") {
      return {
        success: false,
        message: "Yalnızca bekleyen faaliyetler reddedilebilir.",
      };
    }

    await prisma.activity.update({
      where: { id: activityId },
      data: { durum: "REJECTED" },
    });

    revalidatePath("/");
    return { success: true, message: "Faaliyet reddedildi." };
  } catch (error) {
    console.error("rejectActivity hatası:", error);
    return {
      success: false,
      message: "Faaliyet reddedilirken bir hata oluştu.",
    };
  }
}

// ──────────────────────────────────────────────
// 4) Öğrenci İstatistikleri (Onaylı toplam saat)
// ──────────────────────────────────────────────

export async function getStudentStats(
  studentId: string
): Promise<ActionResult<number>> {
  try {
    if (!studentId) {
      return { success: false, message: "Öğrenci ID gerekli." };
    }

    const result = await prisma.activity.aggregate({
      where: {
        ogrenciId: studentId,
        durum: "APPROVED",
      },
      _sum: {
        saat: true,
      },
    });

    const toplamSaat = result._sum.saat ?? 0;

    return {
      success: true,
      message: `Toplam onaylı saat: ${toplamSaat}`,
      data: toplamSaat,
    };
  } catch (error) {
    console.error("getStudentStats hatası:", error);
    return {
      success: false,
      message: "İstatistikler alınırken bir hata oluştu.",
    };
  }
}

// ──────────────────────────────────────────────
// 5) Rozet Kontrolü ve Ödüllendirme
// ──────────────────────────────────────────────

export async function checkAndAwardBadge(
  studentId: string,
  totalHours: number
): Promise<ActionResult> {
  try {
    if (!studentId) {
      return { success: false, message: "Öğrenci ID gerekli." };
    }

    const mevcutRozetler = await prisma.badge.findMany({
      where: { ogrenciId: studentId },
      select: { tur: true },
    });

    const mevcutRozetTurleri = new Set(mevcutRozetler.map((r: { tur: string }) => r.tur));

    const yeniRozetler = ROZET_BARAJLARI.filter(
      (baraj) => totalHours >= baraj.saat && !mevcutRozetTurleri.has(baraj.tur)
    );

    if (yeniRozetler.length === 0) {
      return { success: true, message: "Yeni rozet hak edilmedi." };
    }

    await prisma.badge.createMany({
      data: yeniRozetler.map((rozet) => ({
        ogrenciId: studentId,
        tur: rozet.tur,
      })),
    });

    const rozetIsimleri = yeniRozetler.map((r) => r.tur).join(", ");

    revalidatePath("/");
    return {
      success: true,
      message: `Tebrikler! Yeni rozet(ler) kazanıldı: ${rozetIsimleri}`,
    };
  } catch (error) {
    console.error("checkAndAwardBadge hatası:", error);
    return {
      success: false,
      message: "Rozet kontrolü sırasında bir hata oluştu.",
    };
  }
}

// ──────────────────────────────────────────────
// 6) Öğrencinin Faaliyetlerini Listeleme
//    Frontend formatı: { date, type, hours, status }
// ──────────────────────────────────────────────

export async function getStudentActivities(studentId: string) {
  try {
    if (!studentId) {
      return { success: false, message: "Öğrenci ID gerekli.", data: [] };
    }

    const activities: ActivityRecord[] = await prisma.activity.findMany({
      where: { ogrenciId: studentId },
      orderBy: { tarih: "desc" },
    });

    const formatted = activities.map((a: ActivityRecord) => ({
      id: a.id,
      date: a.tarih.toISOString().split("T")[0],
      type: FAALIYET_TURU_LABEL[a.tur] || a.tur,
      hours: a.saat,
      status: durumToStatus(a.durum),
      aciklama: a.aciklama,
      kanitUrl: a.kanitUrl,
    }));

    return {
      success: true,
      message: "Faaliyetler başarıyla getirildi.",
      data: formatted,
    };
  } catch (error) {
    console.error("getStudentActivities hatası:", error);
    return {
      success: false,
      message: "Faaliyetler alınırken bir hata oluştu.",
      data: [],
    };
  }
}

// ──────────────────────────────────────────────
// 7) Öğrenci Dashboard İstatistikleri
//    StatCards, GoalProgress, BadgesPage için
// ──────────────────────────────────────────────

export async function getStudentDashboardStats(studentId: string) {
  try {
    if (!studentId) {
      return { success: false, message: "Öğrenci ID gerekli.", data: null };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const yearStart = new Date(currentYear, 0, 1);
    const monthStart = new Date(currentYear, currentMonth, 1);
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Toplam onaylı saat
    const totalResult = await prisma.activity.aggregate({
      where: { ogrenciId: studentId, durum: "APPROVED" },
      _sum: { saat: true },
    });
    const toplamSaat = totalResult._sum.saat ?? 0;

    // Bu ayki saat
    const monthResult = await prisma.activity.aggregate({
      where: {
        ogrenciId: studentId,
        durum: "APPROVED",
        tarih: { gte: monthStart },
      },
      _sum: { saat: true },
    });
    const buAySaat = monthResult._sum.saat ?? 0;

    // Geçen ayki saat
    const lastMonthResult = await prisma.activity.aggregate({
      where: {
        ogrenciId: studentId,
        durum: "APPROVED",
        tarih: { gte: lastMonthStart, lt: monthStart },
      },
      _sum: { saat: true },
    });
    const gecenAySaat = lastMonthResult._sum.saat ?? 0;

    // Son hafta saat
    const lastWeekResult = await prisma.activity.aggregate({
      where: {
        ogrenciId: studentId,
        durum: "APPROVED",
        tarih: { gte: lastWeekStart },
      },
      _sum: { saat: true },
    });
    const sonHaftaSaat = lastWeekResult._sum.saat ?? 0;

    // Yıllık saat
    const yearResult = await prisma.activity.aggregate({
      where: {
        ogrenciId: studentId,
        durum: "APPROVED",
        tarih: { gte: yearStart },
      },
      _sum: { saat: true },
    });
    const yillikSaat = yearResult._sum.saat ?? 0;

    // Rozetler
    const rozetler: BadgeRecord[] = await prisma.badge.findMany({
      where: { ogrenciId: studentId },
      orderBy: { kazanmaTarihi: "desc" },
    });

    // Hedef: 40 saat
    const hedefSaat = 40;
    const hedefYuzde = Math.min(Math.round((toplamSaat / hedefSaat) * 100), 100);
    const kalanSaat = Math.max(hedefSaat - toplamSaat, 0);

    return {
      success: true,
      message: "İstatistikler getirildi.",
      data: {
        toplamSaat,
        buAySaat,
        gecenAySaat,
        sonHaftaSaat,
        yillikSaat,
        hedefSaat,
        hedefYuzde,
        kalanSaat,
        rozetler: rozetler.map((r: BadgeRecord) => ({ tur: r.tur, kazanmaTarihi: r.kazanmaTarihi })),
      },
    };
  } catch (error) {
    console.error("getStudentDashboardStats hatası:", error);
    return {
      success: false,
      message: "İstatistikler alınırken bir hata oluştu.",
      data: null,
    };
  }
}

// ──────────────────────────────────────────────
// 8) Öğretmen Dashboard - Tüm faaliyetler
// ──────────────────────────────────────────────

export async function getTeacherActivities(schoolName?: string) {
  try {
    const whereClause: Record<string, unknown> = {};
    if (schoolName) {
      whereClause.ogrenci = { okul: schoolName };
    }

    const activities: ActivityWithStudent[] = await prisma.activity.findMany({
      where: whereClause,
      include: {
        ogrenci: {
          select: {
            id: true,
            adSoyad: true,
            okul: true,
            sinif: true,
          },
        },
      },
      orderBy: { tarih: "desc" },
    });

    const formatted = activities.map((a: ActivityWithStudent) => ({
      id: a.id,
      studentName: a.ogrenci.adSoyad,
      studentInitials: getInitials(a.ogrenci.adSoyad),
      className: a.ogrenci.sinif,
      activityType: FAALIYET_TURU_LABEL[a.tur] || a.tur,
      date: a.tarih.toISOString().split("T")[0],
      hours: a.saat,
      proofLink: a.kanitUrl || "#",
      status: durumToStatus(a.durum) as "Pending" | "Approved" | "Rejected",
    }));

    return {
      success: true,
      message: "Faaliyetler getirildi.",
      data: formatted,
    };
  } catch (error) {
    console.error("getTeacherActivities hatası:", error);
    return {
      success: false,
      message: "Faaliyetler alınırken bir hata oluştu.",
      data: [],
    };
  }
}

// ──────────────────────────────────────────────
// 9) Öğretmen Okul İstatistikleri
// ──────────────────────────────────────────────

export async function getSchoolStats(schoolName?: string) {
  try {
    const okulFilter = schoolName ? { okul: schoolName } : {};

    const totalResult = await prisma.activity.aggregate({
      where: { ogrenci: okulFilter },
      _sum: { saat: true },
    });

    const approvedResult = await prisma.activity.aggregate({
      where: { ogrenci: okulFilter, durum: "APPROVED" },
      _sum: { saat: true },
    });

    const pendingCount = await prisma.activity.count({
      where: { ogrenci: okulFilter, durum: "PENDING" },
    });

    const activeStudents = await prisma.user.count({
      where: {
        ...okulFilter,
        rol: "STUDENT",
        faaliyetler: { some: {} },
      },
    });

    return {
      success: true,
      message: "Okul istatistikleri getirildi.",
      data: {
        toplamSaat: totalResult._sum.saat ?? 0,
        onaylananSaat: approvedResult._sum.saat ?? 0,
        bekleyenSayi: pendingCount,
        aktifOgrenci: activeStudents,
      },
    };
  } catch (error) {
    console.error("getSchoolStats hatası:", error);
    return {
      success: false,
      message: "Okul istatistikleri alınırken bir hata oluştu.",
      data: null,
    };
  }
}

// ──────────────────────────────────────────────
// 10) Genel Merkez (HQ) Dashboard İstatistikleri
// ──────────────────────────────────────────────

export async function getHQStats() {
  try {
    // Toplam onaylı saat
    const totalResult = await prisma.activity.aggregate({
      where: { durum: "APPROVED" },
      _sum: { saat: true },
    });

    // Aktif okul sayısı
    const schools = await prisma.user.findMany({
      where: { rol: "STUDENT", faaliyetler: { some: { durum: "APPROVED" } } },
      select: { okul: true },
      distinct: ["okul"],
    });

    // Aktif öğrenci sayısı
    const activeStudents = await prisma.user.count({
      where: {
        rol: "STUDENT",
        faaliyetler: { some: { durum: "APPROVED" } },
      },
    });

    // Faaliyet türüne göre dağılım
    const turler = ["SEMINER", "STANT", "BAGIS", "KERMES", "SOSYAL_MEDYA", "FARKINDALIK"];
    const turRenkleri: Record<string, string> = {
      SEMINER: "#e87722",
      STANT: "#f59e0b",
      BAGIS: "#0ea5e9",
      KERMES: "#8b5cf6",
      SOSYAL_MEDYA: "#10b981",
      FARKINDALIK: "#ec4899",
    };

    const turDagilimi = await Promise.all(
      turler.map(async (tur) => {
        const result = await prisma.activity.aggregate({
          where: { tur, durum: "APPROVED" },
          _sum: { saat: true },
        });
        return {
          name: FAALIYET_TURU_LABEL[tur] || tur,
          value: result._sum.saat ?? 0,
          fill: turRenkleri[tur] || "#6b7280",
        };
      })
    );

    // Okul bazında gruplama → Top 10 okul
    const okulOgrencileri: StudentWithSchoolActivities[] = await prisma.user.findMany({
      where: { rol: "STUDENT" },
      select: {
        id: true,
        okul: true,
        faaliyetler: { where: { durum: "APPROVED" }, select: { saat: true } },
      },
    });

    const okulMap = new Map<string, { saat: number; ogrenciIds: Set<string> }>();
    for (const ogrenci of okulOgrencileri) {
      if (!okulMap.has(ogrenci.okul)) {
        okulMap.set(ogrenci.okul, { saat: 0, ogrenciIds: new Set() });
      }
      const entry = okulMap.get(ogrenci.okul)!;
      const topSaat = ogrenci.faaliyetler.reduce((s: number, f: { saat: number }) => s + f.saat, 0);
      if (topSaat > 0) {
        entry.saat += topSaat;
        entry.ogrenciIds.add(ogrenci.id);
      }
    }

    const topSchools = Array.from(okulMap.entries())
      .map(([name, data]) => ({
        rank: 0,
        name,
        city: "",
        hours: Math.round(data.saat * 10) / 10,
        initials: getInitials(name),
        students: data.ogrenciIds.size,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    // En aktif öğrenciler → Top 10
    const ogrenciler: StudentWithActivities[] = await prisma.user.findMany({
      where: { rol: "STUDENT" },
      select: {
        adSoyad: true,
        okul: true,
        faaliyetler: {
          where: { durum: "APPROVED" },
          select: { saat: true },
        },
      },
    });

    const topStudents: StudentTopItem[] = ogrenciler
      .map((o: StudentWithActivities) => ({
        rank: 0,
        name: o.adSoyad,
        school: o.okul,
        hours: o.faaliyetler.reduce((s: number, f: { saat: number }) => s + f.saat, 0),
        initials: getInitials(o.adSoyad),
      }))
      .filter((o: StudentTopItem) => o.hours > 0)
      .sort((a: StudentTopItem, b: StudentTopItem) => b.hours - a.hours)
      .slice(0, 10)
      .map((s: StudentTopItem, i: number) => ({ ...s, rank: i + 1 }));

    return {
      success: true,
      message: "Genel merkez istatistikleri getirildi.",
      data: {
        toplamSaat: totalResult._sum.saat ?? 0,
        aktifOkulSayisi: schools.length,
        aktifOgrenciSayisi: activeStudents,
        turDagilimi: turDagilimi.filter((t) => t.value > 0),
        topSchools,
        topStudents,
      },
    };
  } catch (error) {
    console.error("getHQStats hatası:", error);
    return {
      success: false,
      message: "Genel merkez istatistikleri alınırken bir hata oluştu.",
      data: null,
    };
  }
}

// ──────────────────────────────────────────────
// Yardımcı Fonksiyonlar
// ──────────────────────────────────────────────

function durumToStatus(durum: string): "Approved" | "Pending" | "Rejected" {
  switch (durum) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
