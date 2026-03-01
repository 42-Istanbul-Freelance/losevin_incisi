"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PlusCircle,
  Award,
  Settings,
  Heart,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Globe,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

export type PageId = "dashboard" | "faaliyet-ekle" | "rozetlerim" | "ayarlar" | "ogretmen" | "genel-merkez"

const navItems: { icon: typeof LayoutDashboard; label: string; id: PageId; section: string }[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", section: "ogrenci" },
  { icon: PlusCircle, label: "Faaliyet Ekle", id: "faaliyet-ekle", section: "ogrenci" },
  { icon: Award, label: "Rozetlerim", id: "rozetlerim", section: "ogrenci" },
  { icon: Settings, label: "Ayarlar", id: "ayarlar", section: "ogrenci" },
  { icon: GraduationCap, label: "Ogretmen Paneli", id: "ogretmen", section: "ogretmen" },
  { icon: Globe, label: "Genel Merkez", id: "genel-merkez", section: "merkez" },
]

// Rol → görünecek section eşleştirmesi
const rolSections: Record<string, string[]> = {
  STUDENT: ["ogrenci"],
  TEACHER: ["ogretmen"],
  ADMIN: ["merkez"],
}

// Section başlıkları
const sectionLabels: Record<string, string> = {
  ogrenci: "Öğrenci",
  ogretmen: "Öğretmen",
  merkez: "Genel Merkez",
}

function SidebarContent({
  activePage,
  onNavigate,
  user,
  onLogout,
}: {
  activePage: PageId
  onNavigate: (page: PageId) => void
  user: { adSoyad: string; rol: string } | null
  onLogout?: () => void
}) {
  const userName = user?.adSoyad ?? "Kullanıcı"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const rolLabel =
    user?.rol === "TEACHER"
      ? "Öğretmen"
      : user?.rol === "ADMIN"
        ? "Yönetici"
        : "Öğrenci"
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
          <Heart className="size-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
            {"LOSEV"}
          </span>
          <span className="text-xs text-sidebar-foreground/60">
            {"Inci Gonulluluk"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
        {(rolSections[user?.rol ?? "STUDENT"] ?? ["ogrenci"]).map((section, idx) => {
          const items = navItems.filter((item) => item.section === section)
          if (items.length === 0) return null
          return (
            <div key={section}>
              {idx > 0 && <div className="my-2 h-px bg-sidebar-border" />}
              <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {sectionLabels[section] ?? section}
              </span>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    activePage === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="size-[18px]" />
                  {item.label}
                </button>
              ))}
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              {userName}
            </span>
            <span className="text-xs text-sidebar-foreground/50">
              {rolLabel}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="rounded-md p-1.5 text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            title="Çıkış Yap"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({
  activePage,
  onNavigate,
  user,
  onLogout,
}: {
  activePage: PageId
  onNavigate: (page: PageId) => void
  user: { adSoyad: string; rol: string } | null
  onLogout?: () => void
}) {
  const [open, setOpen] = useState(false)

  const handleNavigate = (page: PageId) => {
    onNavigate(page)
    setOpen(false)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <div className="flex h-full flex-col bg-sidebar">
          <SidebarContent activePage={activePage} onNavigate={handleNavigate} user={user} onLogout={onLogout} />
        </div>
      </aside>

      {/* Mobile header bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent activePage={activePage} onNavigate={handleNavigate} user={user} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Heart className="size-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">
            {"LOSEV"}
          </span>
        </div>
      </header>
    </>
  )
}
