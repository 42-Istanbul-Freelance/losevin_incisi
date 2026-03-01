import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays } from "lucide-react"

interface DashboardHeaderProps {
  user: {
    adSoyad: string
    sinif: string
  } | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const adSoyad = user?.adSoyad ?? "Kullanıcı"
  const initials = adSoyad
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="size-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
          <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {`Merhaba, ${adSoyad}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {"Gonulluluk yolculugunuzda harika ilerliyorsunuz!"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-sm">
        <CalendarDays className="size-4 text-primary" />
        <span className="text-sm text-muted-foreground">{today}</span>
      </div>
    </div>
  )
}
