"use client"

import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  ExternalLink,
  TrendingUp,
  GraduationCap,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react"
import { approveActivity, rejectActivity } from "@/actions/activity"

// --- Types ---

type ReviewStatus = "Pending" | "Approved" | "Rejected"

interface StudentActivity {
  id: string
  studentName: string
  studentInitials: string
  className: string
  activityType: string
  date: string
  hours: number
  proofLink: string
  status: ReviewStatus
}

interface TeacherDashboardProps {
  teacher: {
    id: string
    adSoyad: string
    okul: string
  } | null
  activities: StudentActivity[]
  schoolStats: {
    toplamSaat: number
    onaylananSaat: number
    bekleyenSayi: number
    aktifOgrenci: number
  } | null
  onRefresh: () => void
}

const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "Tumu" },
  { value: "Pending", label: "Beklemede" },
  { value: "Approved", label: "Onaylandi" },
  { value: "Rejected", label: "Reddedildi" },
]

const activityTypeMap: Record<string, string> = {
  Seminer: "Seminer",
  Stant: "Stant",
  Bagis: "Bagis",
  Kermes: "Kermes",
  "Sosyal Medya": "Sosyal Medya",
  Farkindalik: "Farkindalik",
}

const statusConfig: Record<ReviewStatus, { label: string; className: string }> = {
  Pending: {
    label: "Beklemede",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
  },
  Approved: {
    label: "Onaylandi",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/10",
  },
  Rejected: {
    label: "Reddedildi",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
  },
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// --- Sub-components ---

function SchoolSummaryCard({ stats }: { stats: { toplamSaat: number; onaylananSaat: number; bekleyenSayi: number; aktifOgrenci: number } | null }) {
  const totalHours = stats?.toplamSaat ?? 0
  const approvedHours = stats?.onaylananSaat ?? 0
  const pendingCount = stats?.bekleyenSayi ?? 0
  const uniqueStudents = stats?.aktifOgrenci ?? 0

  const statItems = [
    {
      title: "Okulun Toplam Gonulluluk Saati",
      value: totalHours.toFixed(1),
      unit: "saat",
      icon: Clock,
      accent: "bg-primary/10 text-primary",
      description: "Tum ogrencilerin toplam saati",
    },
    {
      title: "Onaylanan Saat",
      value: approvedHours.toFixed(1),
      unit: "saat",
      icon: CheckCircle2,
      accent: "bg-success/10 text-success",
      description: "Onaylanan faaliyetler",
    },
    {
      title: "Bekleyen Islem",
      value: pendingCount.toString(),
      unit: "faaliyet",
      icon: AlertCircle,
      accent: "bg-warning/10 text-warning",
      description: "Onay bekleyen faaliyetler",
    },
    {
      title: "Aktif Ogrenci",
      value: uniqueStudents.toString(),
      unit: "ogrenci",
      icon: Users,
      accent: "bg-chart-2/10 text-chart-2",
      description: "Faaliyet giren ogrenciler",
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
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                stat.accent
              )}
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
                <span className="text-sm text-muted-foreground">
                  {stat.unit}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/70">
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FilterBar({
  selectedClass,
  onClassChange,
  selectedStatus,
  onStatusChange,
  classOptions,
}: {
  selectedClass: string
  onClassChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  classOptions: string[]
}) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="size-4 text-primary" />
          Filtrele
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Sinif:
            </span>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="h-9 w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Durum:
            </span>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityRow({
  activity,
  onApprove,
  onReject,
}: {
  activity: StudentActivity
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const config = statusConfig[activity.status]
  const isPending = activity.status === "Pending"

  return (
    <TableRow>
      {/* Student Name + Avatar */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {activity.studentInitials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-card-foreground">
            {activity.studentName}
          </span>
        </div>
      </TableCell>

      {/* Class */}
      <TableCell>
        <Badge variant="outline" className="border-border text-muted-foreground font-normal">
          {activity.className}
        </Badge>
      </TableCell>

      {/* Activity Type */}
      <TableCell className="text-card-foreground">
        {activityTypeMap[activity.activityType] || activity.activityType}
      </TableCell>

      {/* Date */}
      <TableCell className="text-muted-foreground">
        {formatDate(activity.date)}
      </TableCell>

      {/* Hours */}
      <TableCell className="font-mono font-medium text-card-foreground">
        {activity.hours}
      </TableCell>

      {/* Proof */}
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
          asChild
        >
          <a href={activity.proofLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Goruntule</span>
          </a>
        </Button>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={!isPending}
            onClick={() => onApprove(activity.id)}
            className={cn(
              "h-8 gap-1.5 text-xs",
              isPending
                ? "border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                : "opacity-40"
            )}
          >
            <CheckCircle2 className="size-3.5" />
            <span className="hidden lg:inline">Onayla</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isPending}
            onClick={() => onReject(activity.id)}
            className={cn(
              "h-8 gap-1.5 text-xs",
              isPending
                ? "border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                : "opacity-40"
            )}
          >
            <XCircle className="size-3.5" />
            <span className="hidden lg:inline">Reddet</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <ClipboardCheck className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium text-foreground">
          Faaliyet bulunamadi
        </span>
        <span className="text-xs text-muted-foreground">
          Secilen filtrelere uygun faaliyet bulunmuyor.
        </span>
      </div>
    </div>
  )
}

// --- Main Component ---

export function TeacherDashboard({ teacher, activities: initialActivities, schoolStats, onRefresh }: TeacherDashboardProps) {
  const [activities, setActivities] = useState<StudentActivity[]>(initialActivities)
  const [selectedClass, setSelectedClass] = useState("Tumu")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Üst bileşenden gelen yeni verilerle senkronize et
  useEffect(() => {
    setActivities(initialActivities)
  }, [initialActivities])

  // Sınıf listesini aktivitelerden çıkar
  const classOptions = useMemo(() => {
    const classes = new Set(activities.map((a) => a.className))
    return ["Tumu", ...Array.from(classes).sort()]
  }, [activities])

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchClass = selectedClass === "Tumu" || a.className === selectedClass
      const matchStatus = selectedStatus === "all" || a.status === selectedStatus
      return matchClass && matchStatus
    })
  }, [activities, selectedClass, selectedStatus])

  const handleApprove = async (id: string) => {
    const result = await approveActivity(id)
    if (result.success) {
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Approved" as ReviewStatus } : a))
      )
      onRefresh()
    }
  }

  const handleReject = async (id: string) => {
    const result = await rejectActivity(id)
    if (result.success) {
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Rejected" as ReviewStatus } : a))
      )
      onRefresh()
    }
  }

  const pendingCount = activities.filter((a) => a.status === "Pending").length

  const teacherName = teacher?.adSoyad ?? "Öğretmen"
  const teacherInitials = teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const now = new Date()
  const monthName = now.toLocaleDateString("tr-TR", { month: "long" })
  const year = now.getFullYear()

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
              {teacherInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl text-balance">
              Ogretmen Paneli
            </h1>
            <p className="text-sm text-muted-foreground">
              Hos geldiniz, {teacherName}
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5">
            <AlertCircle className="size-4 text-warning" />
            <span className="text-sm font-medium text-foreground">
              {pendingCount} faaliyet onay bekliyor
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <SchoolSummaryCard stats={schoolStats} />

      {/* Filter Bar */}
      <FilterBar
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        classOptions={classOptions}
      />

      {/* Activities Table */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-base">Ogrenci Faaliyetleri</CardTitle>
              <CardDescription>
                {filteredActivities.length} faaliyet listeleniyor
                {selectedClass !== "Tumu" && ` - ${selectedClass}`}
                {selectedStatus !== "all" &&
                  ` - ${statusOptions.find((o) => o.value === selectedStatus)?.label}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ogrenci Adi</TableHead>
                  <TableHead>Sinif</TableHead>
                  <TableHead>Etkinlik Turu</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                  <TableHead>Kanit</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Aksiyonlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick stats footer */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="size-5 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              Bu Ayin Ozeti
            </span>
            <span className="text-xs text-muted-foreground">
              {monthName} {year} icin okul geneli gonulluluk istatistikleri
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/50 px-4 py-2">
            <span className="text-lg font-bold text-foreground">
              {activities.filter((a) => a.status === "Approved").length}
            </span>
            <span className="text-[11px] text-muted-foreground">Onaylandi</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/50 px-4 py-2">
            <span className="text-lg font-bold text-foreground">
              {activities.filter((a) => a.status === "Pending").length}
            </span>
            <span className="text-[11px] text-muted-foreground">Beklemede</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/50 px-4 py-2">
            <span className="text-lg font-bold text-foreground">
              {activities.filter((a) => a.status === "Rejected").length}
            </span>
            <span className="text-[11px] text-muted-foreground">Reddedildi</span>
          </div>
        </div>
      </div>
    </div>
  )
}
