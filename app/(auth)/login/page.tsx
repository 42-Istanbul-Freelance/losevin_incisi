"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginUser } from "@/actions/auth"
import { GraduationCap, BookOpen, Shield, Loader2, Eye, EyeOff } from "lucide-react"

const roles = [
  {
    value: "STUDENT",
    label: "Öğrenci",
    icon: GraduationCap,
    description: "Gönüllülük faaliyetlerini takip et",
    color: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20",
    activeColor: "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25",
  },
  {
    value: "TEACHER",
    label: "Öğretmen",
    icon: BookOpen,
    description: "Öğrencilerinizin faaliyetlerini yönetin",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20",
    activeColor: "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25",
  },
  {
    value: "ADMIN",
    label: "Admin",
    icon: Shield,
    description: "Tüm sistemi yönetin",
    color: "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20",
    activeColor: "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/25",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState("STUDENT")
  const [email, setEmail] = useState("")
  const [sifre, setSifre] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formData = new FormData()
      formData.set("email", email)
      formData.set("sifre", sifre)
      formData.set("rol", selectedRole)

      const result = await loginUser(formData)

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Login client error:", err)
      setError(err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar deneyin.")
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
          LÖSEV İnci Gönüllülük
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hesabınıza giriş yapın
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
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@okul.edu.tr"
                required
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-ring transition-shadow focus:ring-2"
              />
            </div>

            {/* Şifre */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sifre" className="text-sm font-medium text-foreground">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="sifre"
                  type={showPassword ? "text" : "password"}
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none ring-ring transition-shadow focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Giriş butonu */}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </div>
      </form>

      {/* Kayıt linki */}
      <p className="text-center text-sm text-muted-foreground">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </div>
  )
}
