"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/actions/auth"
import { GraduationCap, BookOpen, Shield, Loader2, Eye, EyeOff } from "lucide-react"

const roles = [
  {
    value: "STUDENT",
    label: "Öğrenci",
    icon: GraduationCap,
    color: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20",
    activeColor: "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25",
  },
  {
    value: "TEACHER",
    label: "Öğretmen",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20",
    activeColor: "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25",
  },
  {
    value: "ADMIN",
    label: "Admin",
    icon: Shield,
    color: "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20",
    activeColor: "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/25",
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState("STUDENT")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    adSoyad: "",
    email: "",
    sifre: "",
    sifreTekrar: "",
    okul: "",
    sinif: "",
    tcKimlik: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formData = new FormData()
      formData.set("adSoyad", form.adSoyad)
      formData.set("email", form.email)
      formData.set("sifre", form.sifre)
      formData.set("sifreTekrar", form.sifreTekrar)
      formData.set("okul", form.okul)
      formData.set("sinif", form.sinif)
      formData.set("rol", selectedRole)
      if (form.tcKimlik) formData.set("tcKimlik", form.tcKimlik)

      const result = await registerUser(formData)

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Logo / Başlık */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <span className="text-2xl font-bold">L</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Yeni Hesap Oluştur
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          LÖSEV İnci Gönüllülük Sistemine kayıt olun
        </p>
      </div>

      {/* Rol Seçimi */}
      <div className="grid grid-cols-3 gap-2">
        {roles.map((role) => {
          const Icon = role.icon
          const isActive = selectedRole === role.value
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200 ${
                isActive ? role.activeColor : role.color
              }`}
            >
              <Icon className="size-5" />
              <span className="text-xs font-semibold">{role.label}</span>
            </button>
          )
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-3.5">
            {/* Ad Soyad */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="adSoyad" className="text-sm font-medium text-foreground">
                Ad Soyad <span className="text-destructive">*</span>
              </label>
              <input
                id="adSoyad"
                type="text"
                value={form.adSoyad}
                onChange={(e) => updateField("adSoyad", e.target.value)}
                placeholder="Ahmet Yılmaz"
                required
                minLength={2}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-ring transition-shadow focus:ring-2"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                E-posta <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="ornek@okul.edu.tr"
                required
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-ring transition-shadow focus:ring-2"
              />
            </div>

            {/* Şifre & Tekrar - yan yana */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sifre" className="text-sm font-medium text-foreground">
                  Şifre <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="sifre"
                    type={showPassword ? "text" : "password"}
                    value={form.sifre}
                    onChange={(e) => updateField("sifre", e.target.value)}
                    placeholder="••••••"
                    required
                    minLength={6}
                    className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none ring-ring transition-shadow focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sifreTekrar" className="text-sm font-medium text-foreground">
                  Şifre Tekrar <span className="text-destructive">*</span>
                </label>
                <input
                  id="sifreTekrar"
                  type={showPassword ? "text" : "password"}
                  value={form.sifreTekrar}
                  onChange={(e) => updateField("sifreTekrar", e.target.value)}
                  placeholder="••••••"
                  required
                  minLength={6}
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-ring transition-shadow focus:ring-2"
                />
              </div>
            </div>

            {/* Okul & Sınıf - yan yana */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="okul" className="text-sm font-medium text-foreground">
                  Okul <span className="text-destructive">*</span>
                </label>
                <input
                  id="okul"
                  type="text"
                  value={form.okul}
                  onChange={(e) => updateField("okul", e.target.value)}
                  placeholder="Ankara Fen Lisesi"
                  required
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-ring transition-shadow focus:ring-2"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sinif" className="text-sm font-medium text-foreground">
                  Sınıf <span className="text-destructive">*</span>
                </label>
                <input
                  id="sinif"
                  type="text"
                  value={form.sinif}
                  onChange={(e) => updateField("sinif", e.target.value)}
                  placeholder="11-A"
                  required
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-ring transition-shadow focus:ring-2"
                />
              </div>
            </div>

            {/* TC Kimlik (Opsiyonel) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tcKimlik" className="text-sm font-medium text-foreground">
                TC Kimlik No <span className="text-xs text-muted-foreground">(opsiyonel)</span>
              </label>
              <input
                id="tcKimlik"
                type="text"
                value={form.tcKimlik}
                onChange={(e) => updateField("tcKimlik", e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="12345678901"
                maxLength={11}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-ring transition-shadow focus:ring-2"
              />
            </div>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Kayıt butonu */}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Kayıt yapılıyor...
              </>
            ) : (
              "Kayıt Ol"
            )}
          </button>
        </div>
      </form>

      {/* Giriş linki */}
      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  )
}
