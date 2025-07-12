"use client"

import { useState } from "react"
import type { Task, CustomScenario } from "@/types/task"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, RotateCcw } from "lucide-react"

interface AdvancedScenarioBuilderProps {
  tasks: Task[]
  onSimulate: (
    scenario: string,
    delayDuration: number,
    affectedTaskIds: string[],
    customScenario?: CustomScenario,
  ) => void
  isSimulating: boolean
  onReset: () => void
  hasSimulation: boolean
  onCustomScenario: (s: CustomScenario) => void
}

export function AdvancedScenarioBuilder({
  tasks,
  onSimulate,
  isSimulating,
  onReset,
  hasSimulation,
  onCustomScenario,
}: AdvancedScenarioBuilderProps) {
  const [delay, setDelay] = useState(3)
  const [affected, setAffected] = useState<string[]>([])
  const [cascading, setCascading] = useState(false)

  const runSimulation = () => {
    const scenarioId = "advanced_custom"
    const customScenario: CustomScenario = {
      id: scenarioId,
      name: "Custom Advanced Scenario",
      type: "delay",
      description: "User-defined disruption event",
      affectedTaskIds: affected,
      delayDuration: delay,
      cascadingEffect: cascading,
      cascadingTasks: 3,
      partialAvailability: 100,
      customParameters: {},
    }
    onCustomScenario(customScenario)
    onSimulate(scenarioId, delay, affected, customScenario)
  }

  return (
    <Card className="rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">🌩️ Advanced Scenario Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delay */}
        <div className="space-y-2 max-w-xs">
          <Label>Delay Duration (days)</Label>
          <Input type="number" min={1} value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
        </div>

        {/* Cascading */}
        <div className="flex items-center gap-2">
          <Checkbox id="cascading" checked={cascading} onCheckedChange={(c) => setCascading(c as boolean)} />
          <Label htmlFor="cascading">Cascading effect to next tasks</Label>
        </div>

        {/* Affected tasks */}
        <div className="space-y-2">
          <Label>Affected Tasks</Label>
          <div className="flex flex-wrap gap-2">
            {tasks.map((t) => (
              <Badge
                key={t.id}
                variant={affected.includes(t.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setAffected((prev) => (prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id]))
                }
              >
                {t.taskName}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <Button onClick={runSimulation} disabled={affected.length === 0 || isSimulating} className="rounded-xl">
            {isSimulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Simulate & Replan
          </Button>
          {hasSimulation && (
            <Button onClick={onReset} variant="outline" className="rounded-xl bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
