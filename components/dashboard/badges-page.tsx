"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  CheckCircle2,
  Lock,
  Download,
  FileText,
  Sparkles,
  Trophy,
} from "lucide-react"

const BADGE_HOURS_DEFAULT = 0

interface BadgeTier {
  id: string
  name: string
  requiredHours: number
  description: string
  colors: {
    gradient: string
    glow: string
    iconBg: string
    text: string
    border: string
    badge: string
    progressBar: string
  }
}

const tiers: BadgeTier[] = [
  {
    id: "bronze",
    name: "Bronz Inci",
    requiredHours: 25,
    description: "Gonulluluk yolculugunun baslangici",
    colors: {
      gradient: "from-amber-700 via-amber-600 to-yellow-500",
      glow: "shadow-amber-400/40",
      iconBg: "bg-amber-100 text-amber-700",
      text: "text-amber-700",
      border: "border-amber-300",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      progressBar: "[&_[data-slot=progress-indicator]]:bg-amber-600",
    },
  },
  {
    id: "silver",
    name: "Gumus Inci",
    requiredHours: 50,
    description: "Deneyimli bir gonullu",
    colors: {
      gradient: "from-slate-500 via-slate-400 to-gray-300",
      glow: "shadow-slate-300/50",
      iconBg: "bg-slate-100 text-slate-600",
      text: "text-slate-600",
      border: "border-slate-300",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      progressBar: "[&_[data-slot=progress-indicator]]:bg-slate-500",
    },
  },
  {
    id: "gold",
    name: "Altin Inci",
    requiredHours: 100,
    description: "Ustun basarili gonullu",
    colors: {
      gradient: "from-yellow-600 via-yellow-400 to-amber-300",
      glow: "shadow-yellow-400/50",
      iconBg: "bg-yellow-100 text-yellow-700",
      text: "text-yellow-700",
      border: "border-yellow-300",
      badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
      progressBar: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
    },
  },
  {
    id: "platinum",
    name: "Platin Inci Lideri",
    requiredHours: 200,
    description: "Efsanevi gonulluluk lideri",
    colors: {
      gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
      glow: "shadow-purple-400/50",
      iconBg: "bg-purple-100 text-purple-700",
      text: "text-purple-700",
      border: "border-purple-300",
      badge: "bg-purple-100 text-purple-800 border-purple-200",
      progressBar: "[&_[data-slot=progress-indicator]]:bg-purple-500",
    },
  },
]

function BadgeIcon({ tier, achieved }: { tier: BadgeTier; achieved: boolean }) {
  return (
    <div className="relative">
      {/* Glow ring behind the icon for achieved badges */}
      {achieved && (
        <div
          className={cn(
            "absolute -inset-2 rounded-full opacity-60 blur-md",
            `bg-gradient-to-br ${tier.colors.gradient}`
          )}
        />
      )}
      <div
        className={cn(
          "relative flex size-20 items-center justify-center rounded-full border-2 sm:size-24",
          achieved
            ? `bg-gradient-to-br ${tier.colors.gradient} ${tier.colors.border} shadow-lg ${tier.colors.glow}`
            : "border-border bg-muted"
        )}
      >
        {achieved ? (
          <Award className="size-9 text-white drop-shadow-md sm:size-11" />
        ) : (
          <Lock className="size-7 text-muted-foreground/50 sm:size-8" />
        )}
      </div>
      {/* Achieved check */}
      {achieved && (
        <div className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-emerald-500 shadow-sm sm:size-8">
          <CheckCircle2 className="size-4 text-white sm:size-5" />
        </div>
      )}
    </div>
  )
}

function TierCard({ tier, currentHours }: { tier: BadgeTier; currentHours: number }) {
  const achieved = currentHours >= tier.requiredHours
  const progressToward = Math.min(
    Math.round((currentHours / tier.requiredHours) * 100),
    100
  )
  const hoursRemaining = Math.max(tier.requiredHours - currentHours, 0)

  return (
    <Card
      className={cn(
        "relative gap-0 overflow-hidden py-0 transition-all duration-300",
        achieved
          ? `border-2 ${tier.colors.border} shadow-md hover:shadow-lg`
          : "border border-border opacity-60 grayscale hover:opacity-80 hover:grayscale-[50%]"
      )}
    >
      {/* Top gradient accent */}
      <div
        className={cn(
          "h-1.5 w-full",
          achieved
            ? `bg-gradient-to-r ${tier.colors.gradient}`
            : "bg-muted-foreground/20"
        )}
      />

      <CardContent className="flex flex-col items-center gap-4 px-5 pt-7 pb-6">
        <BadgeIcon tier={tier} achieved={achieved} />

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h3
            className={cn(
              "text-base font-bold tracking-tight sm:text-lg",
              achieved ? tier.colors.text : "text-muted-foreground"
            )}
          >
            {tier.name}
          </h3>
          <p className="text-xs text-muted-foreground">{tier.description}</p>
        </div>

        {/* Hours requirement badge */}
        <Badge
          variant="outline"
          className={cn(
            "px-3 py-1 text-xs font-semibold",
            achieved ? tier.colors.badge : "border-border text-muted-foreground"
          )}
        >
          {tier.requiredHours}
          {tier.id === "platinum" ? "+" : ""} Saat
        </Badge>

        {/* Progress toward this tier */}
        <div className="flex w-full flex-col gap-1.5">
          <Progress
            value={progressToward}
            className={cn(
              "h-2 bg-muted",
              achieved ? tier.colors.progressBar : ""
            )}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {achieved ? "Tamamlandi" : `${currentHours} / ${tier.requiredHours} saat`}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                achieved ? tier.colors.text : "text-muted-foreground"
              )}
            >
              {achieved ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3" />
                  Kazanildi
                </span>
              ) : (
                `${hoursRemaining} saat kaldi`
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CertificateSection({ currentHours }: { currentHours: number }) {
  const hasBronze = currentHours >= 25
  const highestTier = tiers
    .slice()
    .reverse()
    .find((t) => currentHours >= t.requiredHours)

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <CardTitle className="text-base">Sertifikami Indir</CardTitle>
        </div>
        <CardDescription>
          {hasBronze
            ? `Tebrikler! ${highestTier?.name} seviyesinde sertifikanizi indirebilirsiniz.`
            : "Sertifika indirebilmek icin en az Bronz Inci seviyesine (25 saat) ulasmaniz gerekmektedir."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex flex-col gap-5 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between",
            hasBronze
              ? "border-primary/20 bg-primary/5"
              : "border-border bg-muted/50"
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-xl",
                hasBronze
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Trophy className="size-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm font-semibold",
                  hasBronze ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {hasBronze
                  ? `LOSEV ${highestTier?.name} Gonulluluk Sertifikasi`
                  : "LOSEV Gonulluluk Sertifikasi"}
              </span>
              <span className="text-xs text-muted-foreground">
                {hasBronze
                  ? "PDF formatinda indirilebilir"
                  : `Bronz Inci icin ${25 - currentHours} saat daha gerekli`}
              </span>
            </div>
          </div>

          <Button
            disabled={!hasBronze}
            className={cn(
              "gap-2 sm:w-auto",
              hasBronze
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            )}
          >
            <Download className="size-4" />
            Sertifikayi Indir
          </Button>
        </div>

        {/* Tier breakdown as a mini-legend */}
        {!hasBronze && (
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Sertifika Seviyeleri
            </span>
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1"
                >
                  <div
                    className={cn(
                      "size-2.5 rounded-full",
                      currentHours >= tier.requiredHours
                        ? `bg-gradient-to-r ${tier.colors.gradient}`
                        : "bg-muted-foreground/30"
                    )}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {tier.name} ({tier.requiredHours}
                    {tier.id === "platinum" ? "+" : ""}h)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function BadgesPage({ currentHours = 0 }: { currentHours?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Award className="size-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl text-balance">
            Rozetlerim ve Sertifikalarim
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gonulluluk saatlerinize gore kazandiginiz rozetler ve sertifikalar
        </p>
      </div>

      {/* Current progress summary */}
      <Card className="border-none bg-gradient-to-r from-primary/5 via-card to-primary/5 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Toplam Gonulluluk Saatiniz
              </span>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {currentHours}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  saat
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 sm:items-end">
            <span className="text-xs text-muted-foreground">
              Sonraki rozet:
            </span>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
            >
              Bronz Inci - {Math.max(25 - currentHours, 0)} saat kaldi
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Badge grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} currentHours={currentHours} />
        ))}
      </div>

      {/* Certificate download section */}
      <CertificateSection currentHours={currentHours} />
    </div>
  )
}
