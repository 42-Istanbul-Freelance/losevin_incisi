import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target } from "lucide-react"

interface GoalProgressProps {
  stats: {
    toplamSaat: number
    hedefSaat: number
    hedefYuzde: number
    kalanSaat: number
  } | null
}

export function GoalProgress({ stats }: GoalProgressProps) {
  const currentHours = stats?.toplamSaat ?? 0
  const goalHours = stats?.hedefSaat ?? 40
  const percentage = stats?.hedefYuzde ?? 0
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <CardTitle className="text-base">Hedef Ilerleme Durumu</CardTitle>
          </div>
          <span className="text-sm font-semibold text-primary">
            {currentHours} / {goalHours} saat
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={percentage} className="h-3 bg-muted" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {percentage}% tamamlandi
          </span>
          <span className="text-xs text-muted-foreground">
            {goalHours - currentHours} saat kaldi
          </span>
        </div>

        {/* Milestones */}
        <div className="mt-1 flex gap-2">
          {[10, 20, 30, 40].map((milestone) => (
            <div
              key={milestone}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-center ${
                currentHours >= milestone
                  ? "bg-primary/10"
                  : "bg-muted"
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  currentHours >= milestone
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {milestone}h
              </span>
              <div
                className={`size-2 rounded-full ${
                  currentHours >= milestone
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
