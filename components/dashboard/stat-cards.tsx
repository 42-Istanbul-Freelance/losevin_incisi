import { Card, CardContent } from "@/components/ui/card"
import { Clock, CalendarDays, TrendingUp, Target } from "lucide-react"

interface StatCardsProps {
  stats: {
    toplamSaat: number
    buAySaat: number
    gecenAySaat: number
    sonHaftaSaat: number
    yillikSaat: number
    hedefSaat: number
    hedefYuzde: number
    kalanSaat: number
  } | null
}

export function StatCards({ stats }: StatCardsProps) {
  const toplamSaat = stats?.toplamSaat ?? 0
  const buAySaat = stats?.buAySaat ?? 0
  const sonHaftaSaat = stats?.sonHaftaSaat ?? 0
  const yillikSaat = stats?.yillikSaat ?? 0
  const gecenAySaat = stats?.gecenAySaat ?? 0
  const hedefSaat = stats?.hedefSaat ?? 40
  const hedefYuzde = stats?.hedefYuzde ?? 0
  const kalanSaat = stats?.kalanSaat ?? 40

  const statItems = [
    {
      title: "Toplam Gonulluluk Saati",
      value: toplamSaat.toFixed(1),
      unit: "saat",
      icon: Clock,
      change: `+${(toplamSaat - gecenAySaat).toFixed(1)} gecen aydan`,
      accentClass: "bg-primary/10 text-primary",
    },
    {
      title: "Bu Ayki Saat",
      value: buAySaat.toFixed(1),
      unit: "saat",
      icon: CalendarDays,
      change: `+${sonHaftaSaat.toFixed(1)} gecen haftadan`,
      accentClass: "bg-chart-2/10 text-chart-2",
    },
    {
      title: "Yillik Saat",
      value: yillikSaat.toFixed(1),
      unit: "saat",
      icon: TrendingUp,
      change: `${new Date().getFullYear()} yili toplami`,
      accentClass: "bg-success/10 text-success",
    },
    {
      title: `Hedef (${hedefSaat} Saat)`,
      value: `${hedefYuzde}%`,
      unit: "",
      icon: Target,
      change: `${kalanSaat.toFixed(1)} saat kaldi`,
      accentClass: "bg-warning/10 text-warning",
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((stat) => (
        <Card
          key={stat.title}
          className="gap-0 border-none py-0 shadow-sm transition-shadow hover:shadow-md"
        >
          <CardContent className="flex items-start gap-4 py-5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.accentClass}`}
            >
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-card-foreground">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-sm text-muted-foreground">
                    {stat.unit}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground/70">
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
