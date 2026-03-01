"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import {
  Globe,
  School,
  Users,
  Trophy,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Types ---

interface HQDashboardData {
  toplamSaat: number
  aktifOkulSayisi: number
  aktifOgrenciSayisi: number
  turDagilimi: { name: string; value: number; fill: string }[]
  topSchools: {
    rank: number
    name: string
    city: string
    hours: number
    initials: string
    students: number
  }[]
  topStudents: {
    rank: number
    name: string
    school: string
    hours: number
    initials: string
  }[]
}

interface HQDashboardProps {
  data: HQDashboardData | null
}

// --- Computed colors for Recharts (no CSS variables!) ---

const barChartColors = {
  seminer: "#e87722",
  stant: "#f59e0b",
  bagis: "#0ea5e9",
  kermes: "#8b5cf6",
  sosyal: "#10b981",
  farkindalik: "#ec4899",
}

const barChartConfig = {
  seminer: { label: "Seminer", color: barChartColors.seminer },
  stant: { label: "Stant", color: barChartColors.stant },
  bagis: { label: "Bagis", color: barChartColors.bagis },
  kermes: { label: "Kermes", color: barChartColors.kermes },
  sosyal: { label: "Sosyal Medya", color: barChartColors.sosyal },
  farkindalik: { label: "Farkindalik", color: barChartColors.farkindalik },
}

const pieChartConfig = {
  Seminer: { label: "Seminer", color: "#e87722" },
  Stant: { label: "Stant", color: "#f59e0b" },
  Bagis: { label: "Bagis", color: "#0ea5e9" },
  Kermes: { label: "Kermes", color: "#8b5cf6" },
  "Sosyal Medya": { label: "Sosyal Medya", color: "#10b981" },
  Farkindalik: { label: "Farkindalik", color: "#ec4899" },
}

// --- Summary Section ---

function HQSummaryCards({
  toplamSaat,
  aktifOkulSayisi,
  aktifOgrenciSayisi,
}: {
  toplamSaat: number
  aktifOkulSayisi: number
  aktifOgrenciSayisi: number
}) {
  const metrics = [
    {
      title: "Turkiye Geneli Toplam Saat",
      value: toplamSaat.toLocaleString("tr-TR"),
      unit: "saat",
      icon: Globe,
      accent: "bg-primary/10 text-primary",
      description: "Tum Turkiye genelinde toplam gonulluluk saati",
    },
    {
      title: "Aktif Okul Sayisi",
      value: aktifOkulSayisi.toLocaleString("tr-TR"),
      unit: "okul",
      icon: School,
      accent: "bg-[#0ea5e9]/10 text-[#0ea5e9]",
      description: "Bu donem faaliyet gosteren okullar",
    },
    {
      title: "Aktif Ogrenci Sayisi",
      value: aktifOgrenciSayisi.toLocaleString("tr-TR"),
      unit: "ogrenci",
      icon: Users,
      accent: "bg-[#10b981]/10 text-[#10b981]",
      description: "En az bir faaliyet giren ogrenciler",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((m) => (
        <Card
          key={m.title}
          className="gap-0 border-none py-0 shadow-sm transition-shadow hover:shadow-md"
        >
          <CardContent className="flex items-start gap-4 py-5 px-5">
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl",
                m.accent
              )}
            >
              <m.icon className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                {m.title}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-card-foreground">
                  {m.value}
                </span>
                <span className="text-sm text-muted-foreground">{m.unit}</span>
              </div>
              <span className="text-[11px] text-muted-foreground/70">
                {m.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Monthly Bar Chart ---

// Aylık veri henüz backend'den gelmiyor - ileride eklenecek
const defaultMonthlyData = [
  { month: "Oca", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Sub", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Mar", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Nis", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "May", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Haz", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Tem", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Agu", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Eyl", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Eki", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Kas", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
  { month: "Ara", seminer: 0, stant: 0, bagis: 0, kermes: 0, sosyal: 0, farkindalik: 0 },
]

function MonthlyBarChart() {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <div>
            <CardTitle className="text-base">Aylik Faaliyet Dagilimi</CardTitle>
            <CardDescription>
              2025 yili etkinlik turlerine gore aylik saat dagilimi
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barChartConfig} className="h-[340px] w-full">
          <BarChart
            data={defaultMonthlyData}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              fontSize={12}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="seminer"
              stackId="a"
              fill={barChartColors.seminer}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="stant"
              stackId="a"
              fill={barChartColors.stant}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="bagis"
              stackId="a"
              fill={barChartColors.bagis}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="kermes"
              stackId="a"
              fill={barChartColors.kermes}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="sosyal"
              stackId="a"
              fill={barChartColors.sosyal}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="farkindalik"
              stackId="a"
              fill={barChartColors.farkindalik}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// --- Activity Type Pie Chart ---

type PieDataItem = { name: string; value: number; fill: string }

function ActivityPieChart({ data }: { data: PieDataItem[] }) {
  const total = data.reduce((s: number, d: PieDataItem) => s + d.value, 0)

  if (total === 0) return null

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="size-5 text-primary" />
          <div>
            <CardTitle className="text-base">
              Etkinlik Turune Gore Istatistik
            </CardTitle>
            <CardDescription>
              Toplam {total.toLocaleString()} saat faaliyet dagilimi
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <ChartContainer config={pieChartConfig} className="h-[260px] w-full max-w-[320px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              strokeWidth={2}
              stroke="hsl(0 0% 100%)"
            >
              {data.map((entry: PieDataItem, i: number) => (
                <Cell key={`cell-${i}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          {data.map((item: PieDataItem) => {
            const pct = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.value.toLocaleString()} saat ({pct}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Leaderboard List ---

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-[#fbbf24]/20">
        <Crown className="size-3.5 text-[#d97706]" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-[#94a3b8]/15">
        <span className="text-xs font-bold text-[#64748b]">{rank}</span>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-[#d97706]/10">
        <span className="text-xs font-bold text-[#b45309]">{rank}</span>
      </div>
    )
  }
  return (
    <div className="flex size-7 items-center justify-center rounded-full bg-muted">
      <span className="text-xs font-medium text-muted-foreground">{rank}</span>
    </div>
  )
}

type SchoolItem = {
  rank: number
  name: string
  city: string
  hours: number
  initials: string
  students: number
}

function SchoolLeaderboard({ schools }: { schools: SchoolItem[] }) {
  if (schools.length === 0) return null

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          <div>
            <CardTitle className="text-base">En Aktif 10 Okul</CardTitle>
            <CardDescription>
              Turkiye genelinde en yuksek gonulluluk saatine sahip okullar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {schools.map((school: SchoolItem) => (
          <div
            key={school.rank}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              school.rank <= 3
                ? "bg-primary/[0.03]"
                : "hover:bg-muted/50"
            )}
          >
            <RankBadge rank={school.rank} />
            <Avatar className="size-9">
              <AvatarFallback
                className={cn(
                  "text-[11px] font-semibold",
                  school.rank === 1
                    ? "bg-[#fbbf24]/20 text-[#d97706]"
                    : "bg-primary/10 text-primary"
                )}
              >
                {school.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {school.name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {school.city} &middot; {school.students} ogrenci
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="text-sm font-bold font-mono text-foreground">
                {school.hours}
              </span>
              <span className="text-[10px] text-muted-foreground">saat</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

type StudentItem = {
  rank: number
  name: string
  school: string
  hours: number
  initials: string
}

function StudentLeaderboard({ students }: { students: StudentItem[] }) {
  if (students.length === 0) return null

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          <div>
            <CardTitle className="text-base">En Aktif 10 Ogrenci</CardTitle>
            <CardDescription>
              Turkiye genelinde en yuksek gonulluluk saatine sahip ogrenciler
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {students.map((student: StudentItem) => (
          <div
            key={student.rank}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              student.rank <= 3
                ? "bg-primary/[0.03]"
                : "hover:bg-muted/50"
            )}
          >
            <RankBadge rank={student.rank} />
            <Avatar className="size-9">
              <AvatarFallback
                className={cn(
                  "text-[11px] font-semibold",
                  student.rank === 1
                    ? "bg-[#fbbf24]/20 text-[#d97706]"
                    : "bg-primary/10 text-primary"
                )}
              >
                {student.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {student.name}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {student.school}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="text-sm font-bold font-mono text-foreground">
                {student.hours}
              </span>
              <span className="text-[10px] text-muted-foreground">saat</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// --- Main HQ Dashboard ---

export function HQDashboard({ data }: HQDashboardProps) {
  const toplamSaat = data?.toplamSaat ?? 0
  const aktifOkulSayisi = data?.aktifOkulSayisi ?? 0
  const aktifOgrenciSayisi = data?.aktifOgrenciSayisi ?? 0
  const turDagilimi = data?.turDagilimi ?? []
  const schools = data?.topSchools ?? []
  const students = data?.topStudents ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl text-balance">
              Genel Merkez Analitik Paneli
            </h1>
            <p className="text-sm text-muted-foreground">
              Turkiye geneli gonulluluk verileri ve istatistikler
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <HQSummaryCards
        toplamSaat={toplamSaat}
        aktifOkulSayisi={aktifOkulSayisi}
        aktifOgrenciSayisi={aktifOgrenciSayisi}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <MonthlyBarChart />
        </div>
        <div className="xl:col-span-2">
          <ActivityPieChart data={turDagilimi} />
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SchoolLeaderboard schools={schools} />
        <StudentLeaderboard students={students} />
      </div>
    </div>
  )
}
