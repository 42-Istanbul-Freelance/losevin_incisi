"use client"

import { useState, useRef, useCallback } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon, Upload, X, FileText, ImageIcon, Check, Clock, Tag, AlignLeft, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { createActivity } from "@/actions/activity"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const activityTypes = [
  { value: "seminer", label: "Seminer", icon: "📢" },
  { value: "stant", label: "Stant", icon: "🏪" },
  { value: "bagis", label: "Bagis", icon: "🎁" },
  { value: "kermes", label: "Kermes", icon: "🎪" },
  { value: "sosyal-medya", label: "Sosyal Medya", icon: "📱" },
  { value: "farkindalik", label: "Farkindalik", icon: "💡" },
]

interface UploadedFile {
  name: string
  size: number
  type: string
}

interface ActivityFormProps {
  studentId: string
  onSuccess?: () => void
}

export function ActivityForm({ studentId, onSuccess }: ActivityFormProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activityType, setActivityType] = useState<string>("")
  const [hours, setHours] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isFormValid = date && activityType && hours && parseFloat(hours) > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || submitting) return

    setSubmitting(true)
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.set("ogrenciId", studentId)
      formData.set("tarih", date!.toISOString())
      formData.set("tur", activityType)
      formData.set("saat", hours)
      formData.set("aciklama", description || "Faaliyet açıklaması")

      const result = await createActivity(formData)

      if (result.success) {
        setSubmitted(true)
        // Formu temizle
        setDate(undefined)
        setActivityType("")
        setHours("")
        setDescription("")
        setFiles([])
        setTimeout(() => setSubmitted(false), 3000)
        onSuccess?.()
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedType = activityTypes.find((t) => t.value === activityType)

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl text-balance">
          Faaliyet Ekle
        </h1>
        <p className="text-sm text-muted-foreground">
          Yeni bir gonulluluk faaliyeti ekleyin ve saatlerinizi kaydedin.
        </p>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success">
            <Check className="size-4 text-success-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              Faaliyet basariyla kaydedildi!
            </span>
            <span className="text-xs text-muted-foreground">
              Onay sureci baslatildi. Durumu takip edebilirsiniz.
            </span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-destructive">
              {errorMessage}
            </span>
          </div>
        </div>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Save className="size-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-base">Faaliyet Bilgileri</CardTitle>
              <CardDescription>
                Lutfen tum gerekli alanlari doldurunuz.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Date and Activity Type - side by side on larger screens */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Date Picker */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="size-3.5 text-primary" />
                  Etkinlik Tarihi
                  <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-border">
                    Zorunlu
                  </Badge>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "h-10 w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {date ? (
                        format(date, "d MMMM yyyy", { locale: tr })
                      ) : (
                        <span>Tarih secin...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Activity Type */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Tag className="size-3.5 text-primary" />
                  Etkinlik Turu
                  <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-border">
                    Zorunlu
                  </Badge>
                </Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger id="type" className="h-10 w-full">
                    <SelectValue placeholder="Tur secin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <p className="text-xs text-muted-foreground">
                    Secilen: {selectedType.label}
                  </p>
                )}
              </div>
            </div>

            {/* Hours */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="hours" className="flex items-center gap-2">
                <Clock className="size-3.5 text-primary" />
                Harcanan Saat
                <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-border">
                  Zorunlu
                </Badge>
              </Label>
              <div className="relative">
                <Input
                  id="hours"
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  placeholder="Ornegin: 3"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="h-10 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  saat
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 0.5, maksimum 24 saat girebilirsiniz.
              </p>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <AlignLeft className="size-3.5 text-primary" />
                Kisa Aciklama
              </Label>
              <Textarea
                id="description"
                placeholder="Faaliyetiniz hakkinda kisa bir aciklama yazin..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Yaptiginiz faaliyeti kisaca ozetleyin.
                </p>
                <span className="text-xs text-muted-foreground">
                  {description.length}/500
                </span>
              </div>
            </div>

            {/* File Upload */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <Upload className="size-3.5 text-primary" />
                Fotograf/Belge Yukle
              </Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full transition-colors",
                    isDragging
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Upload className="size-5" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {isDragging
                      ? "Dosyayi birakin..."
                      : "Dosya yuklemek icin tiklayin veya surukleyin"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, PDF - Maksimum 10MB
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files)
                  }}
                  className="hidden"
                  aria-label="Dosya yukle"
                />
              </div>

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="size-4 text-primary" />
                        ) : (
                          <FileText className="size-4 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                        <span className="truncate text-sm font-medium text-foreground">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`${file.name} dosyasini kaldir`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Submit */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Kaydedilen faaliyetler onay sureci sonrasi hesabiniza eklenir.
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || submitting}
                className="w-full gap-2 sm:w-auto"
              >
                <Save className="size-4" />
                {submitting ? "Kaydediliyor..." : "Faaliyeti Kaydet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
