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
import { Badge } from "@/components/ui/badge"
import { ClipboardList } from "lucide-react"

type Status = "Approved" | "Pending" | "Rejected"

interface Activity {
  id: string
  date: string
  type: string
  hours: number
  status: Status
}

interface RecentActivitiesProps {
  activities: Activity[]
}

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  Approved: {
    label: "Onaylandi",
    className:
      "bg-success/10 text-success border-success/20 hover:bg-success/10",
  },
  Pending: {
    label: "Beklemede",
    className:
      "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
  },
  Rejected: {
    label: "Reddedildi",
    className:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
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

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-base">Son Faaliyetler</CardTitle>
            <CardDescription>
              Son gonulluluk faaliyetleriniz
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Tarih</TableHead>
              <TableHead>Faaliyet Turu</TableHead>
              <TableHead className="text-right">Saat</TableHead>
              <TableHead className="text-right">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => {
              const config = statusConfig[activity.status]
              return (
                <TableRow key={index}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(activity.date)}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground">
                    {activity.type}
                  </TableCell>
                  <TableCell className="text-right font-mono text-card-foreground">
                    {activity.hours}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={config.className}
                    >
                      {config.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
