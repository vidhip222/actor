"use client"

import { useState } from "react"
import type { Task, ScenarioType } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, RotateCcw, AlertTriangle } from "lucide-react"

interface ScenarioSimulationProps {
  tasks: Task[]
  onSimulate: (scenario: string, delayDuration: number, affectedTaskIds: string[]) => void
  isSimulating: boolean
  onReset: () => void
  hasSimulation: boolean
}

const scenarios: ScenarioType[] = [
  {
    id: "weather_delay",
    name: "Weather Delay",
    description: "Heavy rain or extreme weather conditions preventing outdoor work",
  },
  {
    id: "crew_unavailable",
    name: "Crew Unavailable",
    description: "Key personnel or subcontractors become unavailable",
  },
  {
    id: "material_delay",
    name: "Material Delay",
    description: "Critical materials or supplies are delayed in delivery",
  },
  {
    id: "equipment_breakdown",
    name: "Equipment Breakdown",
    description: "Essential equipment fails and requires repair or replacement",
  },
]

export function ScenarioSimulation({
  tasks,
  onSimulate,
  isSimulating,
  onReset,
  hasSimulation,
}: ScenarioSimulationProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [delayDuration, setDelayDuration] = useState<number>(3)
  const [affectedTaskIds, setAffectedTaskIds] = useState<string[]>([])

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      setAffectedTaskIds([...affectedTaskIds, taskId])
    } else {
      setAffectedTaskIds(affectedTaskIds.filter((id) => id !== taskId))
    }
  }

  const handleSimulate = () => {
    if (selectedScenario && affectedTaskIds.length > 0) {
      onSimulate(selectedScenario, delayDuration, affectedTaskIds)
    }
  }

  const getScenarioIcon = (scenarioId: string) => {
    switch (scenarioId) {
      case "weather_delay":
        return "🌧️"
      case "crew_unavailable":
        return "👷"
      case "material_delay":
        return "📦"
      case "equipment_breakdown":
        return "🔧"
      default:
        return "⚠️"
    }
  }

  const getTaskRiskIndicator = (task: Task) => {
    const indicators = []
    if (task.weatherSensitive) indicators.push("🌦️")
    if (task.riskLevel === "High") indicators.push("⚠️")
    if (task.priorityLevel === "High") indicators.push("🔥")
    return indicators.join(" ")
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-white to-orange-50/50 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🌀 Scenario Simulation
          </CardTitle>
          <p className="text-gray-600">Simulate disruptions and see how AI optimizes your construction timeline</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Choose Disruption Scenario</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={`cursor-pointer transition-all rounded-xl border-2 ${
                    selectedScenario === scenario.id
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-25"
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getScenarioIcon(scenario.id)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                      </div>
                      {selectedScenario === scenario.id && <div className="text-orange-500">✓</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Delay Duration */}
          <div className="space-y-2">
            <Label htmlFor="delayDuration" className="text-base font-semibold">
              Delay Duration (days)
            </Label>
            <Input
              id="delayDuration"
              type="number"
              min="1"
              max="30"
              value={delayDuration}
              onChange={(e) => setDelayDuration(Number.parseInt(e.target.value) || 1)}
              className="rounded-xl max-w-xs"
            />
          </div>

          {/* Affected Tasks Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Affected Tasks</Label>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No tasks available for simulation</p>
                <p className="text-sm">Add some tasks first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={affectedTaskIds.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`task-${task.id}`} className="font-medium text-sm cursor-pointer truncate">
                          {task.taskName}
                        </Label>
                        <span className="text-xs">{getTaskRiskIndicator(task)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs rounded-full">
                          {task.taskCategory}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {task.duration} days • ${task.costEstimate.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSimulate}
              disabled={!selectedScenario || affectedTaskIds.length === 0 || isSimulating}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Simulate Impact & Replan
                </>
              )}
            </Button>

            {hasSimulation && (
              <Button onClick={onReset} variant="outline" className="rounded-xl bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Original
              </Button>
            )}
          </div>

          {/* Simulation Status */}
          {selectedScenario && affectedTaskIds.length > 0 && (
            <Card className="rounded-xl bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Simulation Preview</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>{scenarios.find((s) => s.id === selectedScenario)?.name}</strong> affecting{" "}
                      <strong>{affectedTaskIds.length}</strong> task(s) with a <strong>{delayDuration} day</strong>{" "}
                      delay
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {affectedTaskIds.map((taskId) => {
                        const task = tasks.find((t) => t.id === taskId)
                        return task ? (
                          <Badge key={taskId} variant="secondary" className="text-xs rounded-full">
                            {task.taskName}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
