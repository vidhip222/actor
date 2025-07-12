"use client"

import { useState, useEffect } from "react"
import type { Task, CustomScenario, ScenarioType } from "@/types/task"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, RotateCcw, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ScenarioBuilderProps {
  tasks: Task[]
  onSimulate: (
    scenarioId: string, // This will be the ID of the selected scenario (predefined or 'custom')
    delayDuration: number,
    affectedTaskIds: string[],
    customScenarioData: CustomScenario, // Always pass the full custom scenario object
  ) => void
  isSimulating: boolean
  onReset: () => void
  hasSimulation: boolean
}

const predefinedScenarios: ScenarioType[] = [
  { id: "weather_delay", name: "Weather Delay", description: "Heavy rain or extreme weather conditions" },
  { id: "crew_unavailable", name: "Crew Unavailable", description: "Key personnel or subcontractors unavailable" },
  { id: "material_delay", name: "Material Delay", description: "Critical materials delayed in delivery" },
  { id: "equipment_breakdown", name: "Equipment Breakdown", description: "Essential equipment fails" },
  { id: "custom", name: "Custom Scenario", description: "Define your own unique disruption" },
]

export function ScenarioBuilder({ tasks, onSimulate, isSimulating, onReset, hasSimulation }: ScenarioBuilderProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("custom") // Default to custom
  const [delayDuration, setDelayDuration] = useState<number>(3)
  const [affectedTaskIds, setAffectedTaskIds] = useState<string[]>([])
  const [cascadingEffect, setCascadingEffect] = useState<boolean>(false)
  const [cascadingTasksCount, setCascadingTasksCount] = useState<number>(3)
  const [partialAvailability, setPartialAvailability] = useState<number>(100) // For crew/equipment issues
  const [customScenarioName, setCustomScenarioName] = useState<string>("")
  const [customScenarioDescription, setCustomScenarioDescription] = useState<string>("")
  const [customScenarioType, setCustomScenarioType] = useState<CustomScenario["type"]>("delay")

  // Effect to update fields when a predefined scenario is selected
  useEffect(() => {
    const scenario = predefinedScenarios.find((s) => s.id === selectedScenarioId)
    if (scenario && scenario.id !== "custom") {
      setCustomScenarioName(scenario.name)
      setCustomScenarioDescription(scenario.description)
      // Reset other custom fields or set defaults for predefined scenarios
      setDelayDuration(3) // Default delay for predefined
      setAffectedTaskIds([]) // User will select affected tasks
      setCascadingEffect(false)
      setCascadingTasksCount(3)
      setPartialAvailability(100)
      // Infer type from ID
      if (scenario.id.includes("delay")) setCustomScenarioType("delay")
      else if (scenario.id.includes("crew")) setCustomScenarioType("crew_issue")
      else if (scenario.id.includes("material")) setCustomScenarioType("delivery_issue")
      else if (scenario.id.includes("equipment")) setCustomScenarioType("equipment_failure")
    } else if (scenario && scenario.id === "custom") {
      // Clear custom fields when "Custom" is selected
      setCustomScenarioName("")
      setCustomScenarioDescription("")
      setDelayDuration(3)
      setAffectedTaskIds([])
      setCascadingEffect(false)
      setCascadingTasksCount(3)
      setPartialAvailability(100)
      setCustomScenarioType("delay") // Default custom type
    }
  }, [selectedScenarioId])

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      setAffectedTaskIds([...affectedTaskIds, taskId])
    } else {
      setAffectedTaskIds(affectedTaskIds.filter((id) => id !== taskId))
    }
  }

  const handleSimulate = () => {
    if (!selectedScenarioId || affectedTaskIds.length === 0) return

    const customScenario: CustomScenario = {
      id: selectedScenarioId === "custom" ? Date.now().toString() : selectedScenarioId,
      name:
        customScenarioName || predefinedScenarios.find((s) => s.id === selectedScenarioId)?.name || "Custom Scenario",
      type: customScenarioType,
      description:
        customScenarioDescription ||
        predefinedScenarios.find((s) => s.id === selectedScenarioId)?.description ||
        "User-defined disruption event",
      affectedTaskIds: affectedTaskIds,
      delayDuration: delayDuration,
      cascadingEffect: cascadingEffect,
      cascadingTasks: cascadingEffect ? cascadingTasksCount : 0,
      partialAvailability: partialAvailability,
      customParameters: {}, // Can be extended later
    }

    onSimulate(selectedScenarioId, delayDuration, affectedTaskIds, customScenario)
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
      case "custom":
        return "✨"
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
            🌀 Scenario Builder
          </CardTitle>
          <p className="text-gray-600">Define and simulate disruptions to optimize your construction timeline</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Choose Scenario Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predefinedScenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={`cursor-pointer transition-all rounded-xl border-2 ${
                    selectedScenarioId === scenario.id
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-25"
                  }`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getScenarioIcon(scenario.id)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                      </div>
                      {selectedScenarioId === scenario.id && <div className="text-orange-500">✓</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Scenario Details (only if "Custom" is selected) */}
          {selectedScenarioId === "custom" && (
            <div className="space-y-4 border-t pt-4 mt-4 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Custom Scenario Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customName">Scenario Name</Label>
                  <Input
                    id="customName"
                    value={customScenarioName}
                    onChange={(e) => setCustomScenarioName(e.target.value)}
                    placeholder="e.g., Unexpected Strike"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customType">Scenario Type</Label>
                  <Select
                    value={customScenarioType}
                    onValueChange={(value) => setCustomScenarioType(value as CustomScenario["type"])}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delay">Delay</SelectItem>
                      <SelectItem value="crew_issue">Crew Issue</SelectItem>
                      <SelectItem value="delivery_issue">Material Delivery Issue</SelectItem>
                      <SelectItem value="equipment_failure">Equipment Failure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDescription">Description</Label>
                <Textarea
                  id="customDescription"
                  value={customScenarioDescription}
                  onChange={(e) => setCustomScenarioDescription(e.target.value)}
                  placeholder="Describe the custom scenario"
                  rows={2}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Delay Duration */}
          <div className="space-y-2 max-w-xs">
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
              className="rounded-xl"
            />
          </div>

          {/* Cascading Effect */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cascadingEffect"
              checked={cascadingEffect}
              onCheckedChange={(checked) => setCascadingEffect(checked as boolean)}
            />
            <Label htmlFor="cascadingEffect">Add cascading effect (delay causes ripple to next N tasks)</Label>
          </div>
          {cascadingEffect && (
            <div className="space-y-2 max-w-xs ml-6">
              <Label htmlFor="cascadingTasksCount">Number of cascading tasks</Label>
              <Input
                id="cascadingTasksCount"
                type="number"
                min="1"
                value={cascadingTasksCount}
                onChange={(e) => setCascadingTasksCount(Number.parseInt(e.target.value) || 1)}
                className="rounded-xl"
              />
            </div>
          )}

          {/* Partial Availability (for crew/equipment issues) */}
          {(customScenarioType === "crew_issue" || customScenarioType === "equipment_failure") && (
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="partialAvailability">Partial Availability (%)</Label>
              <Input
                id="partialAvailability"
                type="number"
                min="0"
                max="100"
                value={partialAvailability}
                onChange={(e) => setPartialAvailability(Number.parseInt(e.target.value) || 0)}
                className="rounded-xl"
              />
            </div>
          )}

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
                          {task.duration} days • ${(Number(task.costEstimate) || 0).toLocaleString()}
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
              disabled={!selectedScenarioId || affectedTaskIds.length === 0 || isSimulating}
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

          {/* Simulation Status / Preview */}
          {selectedScenarioId && affectedTaskIds.length > 0 && (
            <Card className="rounded-xl bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Simulation Preview</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>
                        {customScenarioName || predefinedScenarios.find((s) => s.id === selectedScenarioId)?.name}
                      </strong>{" "}
                      affecting <strong>{affectedTaskIds.length}</strong> task(s) with a{" "}
                      <strong>{delayDuration} day</strong> delay.
                      {cascadingEffect && ` Cascading to ${cascadingTasksCount} tasks.`}
                      {(customScenarioType === "crew_issue" || customScenarioType === "equipment_failure") &&
                        ` Partial availability: ${partialAvailability}%.`}
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
