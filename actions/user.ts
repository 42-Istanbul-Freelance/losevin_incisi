"use server";

import { prisma } from "@/lib/prisma";
import { createUserSchema, type ActionResult } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getSession } from "@/actions/auth";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  const salt = "losev-gonulluluk-2026";
  return createHash("sha256").update(password + salt).digest("hex");
}

// ──────────────────────────────────────────────
// 1) Yeni Kullanıcı Oluşturma
// ──────────────────────────────────────────────

export async function createUser(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const raw = {
      adSoyad: formData.get("adSoyad") as string,
      email: formData.get("email") as string,
      okul: formData.get("okul") as string,
      sinif: formData.get("sinif") as string,
      rol: (formData.get("rol") as string) || "STUDENT",
      tcKimlik: (formData.get("tcKimlik") as string) || undefined,
    };

    const parsed = createUserSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Doğrulama hatası";
      return { success: false, message: firstError };
    }

    const { adSoyad, email, okul, sinif, rol, tcKimlik } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı.",
      };
    }

    const user = await prisma.user.create({
      data: {
        adSoyad,
        email,
        sifre: hashPassword("123456"), // Varsayılan şifre
        okul,
        sinif,
        rol,
        tcKimlik: tcKimlik || null,
      },
    });

    revalidatePath("/");
    return {
      success: true,
      message: "Kullanıcı başarıyla oluşturuldu.",
      data: { id: user.id },
    };
  } catch (error) {
    console.error("createUser hatası:", error);
    return {
      success: false,
      message: "Kullanıcı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}

// ──────────────────────────────────────────────
// 2) Kullanıcı Bilgilerini Getirme
// ──────────────────────────────────────────────

export async function getUser(userId: string) {
  try {
    if (!userId) {
      return { success: false, message: "Kullanıcı ID gerekli.", data: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        faaliyetler: {
          orderBy: { tarih: "desc" },
        },
        rozetler: {
          orderBy: { kazanmaTarihi: "desc" },
        },
      },
    });

    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı.", data: null };
    }

    return {
      success: true,
      message: "Kullanıcı bilgileri getirildi.",
      data: user,
    };
  } catch (error) {
    console.error("getUser hatası:", error);
    return {
      success: false,
      message: "Kullanıcı bilgileri alınırken bir hata oluştu.",
      data: null,
    };
  }
}

// ──────────────────────────────────────────────
// 3) Mevcut Kullanıcıyı Getir (Geçici - auth yok)
//    İlk öğrenci kullanıcısını döner.
//    Gerçek auth eklendiğinde bu fonksiyon güncellenecek.
// ──────────────────────────────────────────────

export async function getCurrentUser() {
  try {
    const userId = await getSession();
    if (!userId) {
      return { success: false, message: "Oturum bulunamadı.", data: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        adSoyad: true,
        email: true,
        okul: true,
        sinif: true,
        rol: true,
      },
    });

    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı.", data: null };
    }

    return {
      success: true,
      message: "Kullanıcı getirildi.",
      data: user,
    };
  } catch (error) {
    console.error("getCurrentUser hatası:", error);
    return {
      success: false,
      message: "Kullanıcı alınırken bir hata oluştu.",
      data: null,
    };
  }
}

// ──────────────────────────────────────────────
// 4) Öğretmen Bilgisini Getir (Geçici - auth yok)
// ──────────────────────────────────────────────

export async function getCurrentTeacher() {
  try {
    const userId = await getSession();
    if (!userId) {
      return { success: false, message: "Oturum bulunamadı.", data: null };
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        adSoyad: true,
        email: true,
        okul: true,
        sinif: true,
        rol: true,
      },
    });

    if (!teacher || teacher.rol !== "TEACHER") {
      return { success: false, message: "Öğretmen bulunamadı.", data: null };
    }

    return {
      success: true,
      message: "Öğretmen getirildi.",
      data: teacher,
    };
  } catch (error) {
    console.error("getCurrentTeacher hatası:", error);
    return {
      success: false,
      message: "Öğretmen alınırken bir hata oluştu.",
      data: null,
    };
  }
}

// ──────────────────────────────────────────────
// 5) Tüm Öğrencileri Listeleme
// ──────────────────────────────────────────────

export async function getStudents() {
  try {
    const students = await prisma.user.findMany({
      where: { rol: "STUDENT" },
      include: {
        faaliyetler: {
          where: { durum: "APPROVED" },
          select: { saat: true },
        },
        rozetler: true,
      },
      orderBy: { adSoyad: "asc" },
    });

    const studentsWithStats = students.map((student: { faaliyetler: { saat: number }[]; [key: string]: unknown }) => {
      const toplamSaat = student.faaliyetler.reduce(
        (acc: number, f: { saat: number }) => acc + f.saat,
        0
      );
      return {
        ...student,
        toplamSaat,
      };
    });

    return {
      success: true,
      message: "Öğrenciler başarıyla getirildi.",
      data: studentsWithStats,
    };
  } catch (error) {
    console.error("getStudents hatası:", error);
    return {
      success: false,
      message: "Öğrenciler alınırken bir hata oluştu.",
      data: [],
    };
  }
}

// ──────────────────────────────────────────────
// 6) Kullanıcı Güncelleme
// ──────────────────────────────────────────────

export async function updateUser(
  userId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    if (!userId) {
      return { success: false, message: "Kullanıcı ID gerekli." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return { success: false, message: "Kullanıcı bulunamadı." };
    }

    const adSoyad = formData.get("adSoyad") as string;
    const okul = formData.get("okul") as string;
    const sinif = formData.get("sinif") as string;
    const tcKimlik = formData.get("tcKimlik") as string;

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(adSoyad && { adSoyad }),
        ...(okul && { okul }),
        ...(sinif && { sinif }),
        ...(tcKimlik ? { tcKimlik } : {}),
      },
    });

    revalidatePath("/");
    return { success: true, message: "Kullanıcı bilgileri güncellendi." };
  } catch (error) {
    console.error("updateUser hatası:", error);
    return {
      success: false,
      message: "Kullanıcı güncellenirken bir hata oluştu.",
    };
  }
}

// ──────────────────────────────────────────────
// 7) Kullanıcı Silme
// ──────────────────────────────────────────────

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    if (!userId) {
      return { success: false, message: "Kullanıcı ID gerekli." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return { success: false, message: "Kullanıcı bulunamadı." };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/");
    return { success: true, message: "Kullanıcı başarıyla silindi." };
  } catch (error) {
    console.error("deleteUser hatası:", error);
    return {
      success: false,
      message: "Kullanıcı silinirken bir hata oluştu.",
    };
  }
}

// ──────────────────────────────────────────────
// 8) Sınıf Listesini Getir (Öğretmen filtresi için)
// ──────────────────────────────────────────────

export async function getClassList(schoolName?: string) {
  try {
    const filter = schoolName ? { okul: schoolName } : {};

    const users = await prisma.user.findMany({
      where: { ...filter, rol: "STUDENT" },
      select: { sinif: true },
      distinct: ["sinif"],
      orderBy: { sinif: "asc" },
    });

    const classes = users.map((u: { sinif: string }) => u.sinif);

    return {
      success: true,
      message: "Sınıf listesi getirildi.",
      data: classes,
    };
  } catch (error) {
    console.error("getClassList hatası:", error);
    return {
      success: false,
      message: "Sınıf listesi alınırken bir hata oluştu.",
      data: [],
    };
  }
}
