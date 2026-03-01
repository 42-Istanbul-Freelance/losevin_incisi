"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

// ──────────────────────────────────────────────
// Şifre Hashleme (SHA-256 + salt)
// ──────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = "losev-gonulluluk-2026";
  return createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// ──────────────────────────────────────────────
// Cookie-tabanlı Oturum Yönetimi
// ──────────────────────────────────────────────

const SESSION_COOKIE = "losev_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value ?? null;
}

export async function getSessionUser() {
  const userId = await getSession();
  if (!userId) return null;

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

  return user;
}

// ──────────────────────────────────────────────
// Giriş Yapma
// ──────────────────────────────────────────────

export async function loginUser(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const sifre = formData.get("sifre") as string;
  const rol = formData.get("rol") as string;

  if (!email || !sifre || !rol) {
    return { success: false, message: "Tüm alanlar zorunludur." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("[loginUser] email:", email, "rol:", rol, "user found:", !!user);

    if (!user) {
      return { success: false, message: "Bu e-posta adresi kayıtlı değil." };
    }

    if (user.rol !== rol) {
      const rolLabel: Record<string, string> = {
        STUDENT: "Öğrenci",
        TEACHER: "Öğretmen",
        ADMIN: "Admin",
      };
      return {
        success: false,
        message: `Bu hesap ${rolLabel[user.rol] || user.rol} rolüne ait. Lütfen doğru rolü seçin.`,
      };
    }

    if (!verifyPassword(sifre, user.sifre)) {
      return { success: false, message: "Şifre hatalı." };
    }

    await setSession(user.id);
    console.log("[loginUser] Session set for user:", user.id);

    return {
      success: true,
      message: "Giriş başarılı!",
      data: { id: user.id, rol: user.rol },
    };
  } catch (error) {
    console.error("loginUser hatası:", error);
    return {
      success: false,
      message: "Giriş yapılırken bir hata oluştu: " + (error instanceof Error ? error.message : String(error)),
    };
  }
}

// ──────────────────────────────────────────────
// Kayıt Olma
// ──────────────────────────────────────────────

export async function registerUser(formData: FormData) {
  const adSoyad = (formData.get("adSoyad") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const sifre = formData.get("sifre") as string;
  const sifreTekrar = formData.get("sifreTekrar") as string;
  const okul = (formData.get("okul") as string)?.trim();
  const sinif = (formData.get("sinif") as string)?.trim();
  const rol = (formData.get("rol") as string) || "STUDENT";
  const tcKimlik = (formData.get("tcKimlik") as string)?.trim() || null;

  // Validasyon
  if (!adSoyad || !email || !sifre || !okul || !sinif) {
    return { success: false, message: "Tüm zorunlu alanları doldurunuz." };
  }

  if (adSoyad.length < 2) {
    return { success: false, message: "Ad Soyad en az 2 karakter olmalı." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Geçerli bir e-posta adresi giriniz." };
  }

  if (sifre.length < 6) {
    return { success: false, message: "Şifre en az 6 karakter olmalı." };
  }

  if (sifre !== sifreTekrar) {
    return { success: false, message: "Şifreler eşleşmiyor." };
  }

  if (tcKimlik && (tcKimlik.length !== 11 || !/^\d+$/.test(tcKimlik))) {
    return { success: false, message: "TC Kimlik 11 haneli rakamlardan oluşmalı." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "Bu e-posta adresi zaten kayıtlı." };
    }

    const user = await prisma.user.create({
      data: {
        adSoyad,
        email,
        sifre: hashPassword(sifre),
        okul,
        sinif,
        rol,
        tcKimlik,
      },
    });

    await setSession(user.id);

    return {
      success: true,
      message: "Kayıt başarılı!",
      data: { id: user.id, rol: user.rol },
    };
  } catch (error) {
    console.error("registerUser hatası:", error);
    return {
      success: false,
      message: "Kayıt olurken bir hata oluştu.",
    };
  }
}

// ──────────────────────────────────────────────
// Çıkış Yapma
// ──────────────────────────────────────────────

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
