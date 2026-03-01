"use client"

import { useState, useEffect } from "react"
import { AppSidebar, type PageId } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { GoalProgress } from "@/components/dashboard/goal-progress"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { ActivityForm } from "@/components/dashboard/activity-form"
import { BadgesPage } from "@/components/dashboard/badges-page"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { HQDashboard } from "@/components/dashboard/hq-dashboard"
import { getCurrentUser } from "@/actions/user"
import { logoutUser } from "@/actions/auth"
import { getStudentDashboardStats, getStudentActivities, getTeacherActivities, getSchoolStats, getHQStats } from "@/actions/activity"

interface UserData {
  id: string
  adSoyad: string
  email: string
  okul: string
  sinif: string
  rol: string
}

interface DashboardStats {
  toplamSaat: number
  buAySaat: number
  gecenAySaat: number
  sonHaftaSaat: number
  yillikSaat: number
  hedefSaat: number
  hedefYuzde: number
  kalanSaat: number
  rozetler: { tur: string; kazanmaTarihi: Date }[]
}

interface ActivityData {
  id: string
  date: string
  type: string
  hours: number
  status: "Approved" | "Pending" | "Rejected"
  aciklama: string
  kanitUrl: string | null
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<PageId>("dashboard")
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [teacherActivities, setTeacherActivities] = useState<Array<{
    id: string; studentName: string; studentInitials: string; className: string;
    activityType: string; date: string; hours: number; proofLink: string;
    status: "Pending" | "Approved" | "Rejected"
  }>>([])
  const [schoolStats, setSchoolStats] = useState<{
    toplamSaat: number; onaylananSaat: number; bekleyenSayi: number; aktifOgrenci: number
  } | null>(null)
  const [hqData, setHqData] = useState<{
    toplamSaat: number; aktifOkulSayisi: number; aktifOgrenciSayisi: number;
    turDagilimi: { name: string; value: number; fill: string }[];
    topSchools: { rank: number; name: string; city: string; hours: number; initials: string; students: number }[];
    topStudents: { rank: number; name: string; school: string; hours: number; initials: string }[];
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // Kullanıcı ve role göre veri yükle
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const userResult = await getCurrentUser()

        if (!userResult.success || !userResult.data) {
          return
        }

        const userData = userResult.data
        setUser(userData)

        // Role göre varsayılan sayfa ve veri yükleme
        if (userData.rol === "STUDENT") {
          setActivePage("dashboard")
          const [statsResult, activitiesResult] = await Promise.all([
            getStudentDashboardStats(userData.id),
            getStudentActivities(userData.id),
          ])
          if (statsResult.success && statsResult.data) setStats(statsResult.data)
          if (activitiesResult.success && activitiesResult.data) setActivities(activitiesResult.data)
        } else if (userData.rol === "TEACHER") {
          setActivePage("ogretmen")
          const [taResult, ssResult] = await Promise.all([
            getTeacherActivities(userData.okul),
            getSchoolStats(userData.okul),
          ])
          if (taResult.success) setTeacherActivities(taResult.data)
          if (ssResult.success && ssResult.data) setSchoolStats(ssResult.data)
        } else if (userData.rol === "ADMIN") {
          setActivePage("genel-merkez")
          const hqResult = await getHQStats()
          if (hqResult.success && hqResult.data) setHqData(hqResult.data)
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Veri yenileme fonksiyonu (form gönderimi sonrası)
  const refreshData = async () => {
    if (!user) return
    const [statsResult, activitiesResult] = await Promise.all([
      getStudentDashboardStats(user.id),
      getStudentActivities(user.id),
    ])
    if (statsResult.success && statsResult.data) setStats(statsResult.data)
    if (activitiesResult.success && activitiesResult.data) setActivities(activitiesResult.data)
  }

  // Öğretmen verilerini yenile
  const refreshTeacherData = async () => {
    if (!user || user.rol !== "TEACHER") return
    const [taResult, ssResult] = await Promise.all([
      getTeacherActivities(user.okul),
      getSchoolStats(user.okul),
    ])
    if (taResult.success) setTeacherActivities(taResult.data)
    if (ssResult.success && ssResult.data) setSchoolStats(ssResult.data)
  }

  // Çıkış yapma
  const handleLogout = async () => {
    await logoutUser()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col lg:pl-64">
        {/* Spacer for mobile header */}
        <div className="h-14 lg:hidden" />

        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Veriler yükleniyor...</span>
              </div>
            </div>
          ) : (
            <>
              {activePage === "dashboard" && (
                <>
                  <DashboardHeader user={user} />
                  <StatCards stats={stats} />
                  <GoalProgress stats={stats} />
                  <RecentActivities activities={activities} />
                </>
              )}

              {activePage === "faaliyet-ekle" && (
                <ActivityForm
                  studentId={user?.id || ""}
                  onSuccess={refreshData}
                />
              )}

              {activePage === "rozetlerim" && (
                <BadgesPage currentHours={stats?.toplamSaat ?? 0} />
              )}

              {activePage === "ogretmen" && (
                <TeacherDashboard
                  teacher={user}
                  activities={teacherActivities}
                  schoolStats={schoolStats}
                  onRefresh={refreshTeacherData}
                />
              )}

              {activePage === "genel-merkez" && (
                <HQDashboard data={hqData} />
              )}

              {activePage === "ayarlar" && (
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Ayarlar
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Bu sayfa yakin zamanda aktif olacaktir.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
