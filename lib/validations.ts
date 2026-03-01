import { z } from "zod";

// ──────────────────────────────────────────────
// Enum Sabitleri
// ──────────────────────────────────────────────

export const Rol = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  ADMIN: "ADMIN",
} as const;

export const FaaliyetTuru = {
  SEMINER: "SEMINER",
  STANT: "STANT",
  BAGIS: "BAGIS",
  KERMES: "KERMES",
  SOSYAL_MEDYA: "SOSYAL_MEDYA",
  FARKINDALIK: "FARKINDALIK",
} as const;

// Frontend value → Backend value eşleştirmesi
export const FAALIYET_TURU_MAP: Record<string, string> = {
  seminer: "SEMINER",
  stant: "STANT",
  bagis: "BAGIS",
  kermes: "KERMES",
  "sosyal-medya": "SOSYAL_MEDYA",
  farkindalik: "FARKINDALIK",
} as const;

// Backend value → Frontend label eşleştirmesi
export const FAALIYET_TURU_LABEL: Record<string, string> = {
  SEMINER: "Seminer",
  STANT: "Stant",
  BAGIS: "Bağış",
  KERMES: "Kermes",
  SOSYAL_MEDYA: "Sosyal Medya",
  FARKINDALIK: "Farkındalık",
} as const;

export const FaaliyetDurumu = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const RozetTuru = {
  BRONZ: "BRONZ",
  GUMUS: "GUMUS",
  ALTIN: "ALTIN",
  PLATIN: "PLATIN",
} as const;

// ──────────────────────────────────────────────
// Rozet Barajları (saat cinsinden)
// ──────────────────────────────────────────────

export const ROZET_BARAJLARI: { tur: string; saat: number }[] = [
  { tur: RozetTuru.BRONZ, saat: 25 },
  { tur: RozetTuru.GUMUS, saat: 50 },
  { tur: RozetTuru.ALTIN, saat: 100 },
  { tur: RozetTuru.PLATIN, saat: 200 },
];

// ──────────────────────────────────────────────
// Zod Doğrulama Şemaları
// ──────────────────────────────────────────────

export const createActivitySchema = z.object({
  ogrenciId: z.string().min(1, "Öğrenci ID gerekli"),
  tarih: z.string().min(1, "Tarih gerekli"),
  tur: z.enum(["SEMINER", "STANT", "BAGIS", "KERMES", "SOSYAL_MEDYA", "FARKINDALIK"], {
    errorMap: () => ({ message: "Geçersiz faaliyet türü" }),
  }),
  saat: z
    .number({ invalid_type_error: "Saat sayısal olmalı" })
    .min(0.5, "En az 0.5 saat girilmeli")
    .max(24, "Maksimum 24 saat girilebilir"),
  aciklama: z.string().min(3, "Açıklama en az 3 karakter olmalı").max(500, "Açıklama en fazla 500 karakter olabilir"),
  kanitUrl: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
});

export const createUserSchema = z.object({
  adSoyad: z.string().min(2, "Ad Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  okul: z.string().min(2, "Okul adı gerekli"),
  sinif: z.string().min(1, "Sınıf bilgisi gerekli"),
  rol: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
  tcKimlik: z
    .string()
    .length(11, "TC Kimlik 11 haneli olmalı")
    .regex(/^\d+$/, "TC Kimlik sadece rakamlardan oluşmalı")
    .optional()
    .or(z.literal("")),
});

// ──────────────────────────────────────────────
// Tip Tanımları
// ──────────────────────────────────────────────

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

export type ActionResult<T = null> = {
  success: boolean;
  message: string;
  data?: T;
};
