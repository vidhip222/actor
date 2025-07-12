"use client"

import { Checkbox } from "@/components/ui/checkbox"

import type { SimulationResult, Task, AlternativePlan } from "@/types/task" // Added AlternativePlan
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button" // Added Button
import { useState } from "react" // Added useState

interface AIReasoningPanelProps {
  simulationResult: SimulationResult | null
  originalTasks: Task[]
  reorderedTasks: Task[]
  onApplyAlternativePlan: (plan: AlternativePlan) => void // New prop
}

export function AIReasoningPanel({
  simulationResult,
  originalTasks,
  reorderedTasks,
  onApplyAlternativePlan,
}: AIReasoningPanelProps) {
  const [showAlternativePlans, setShowAlternativePlans] = useState(false) // New state for toggle

  if (!simulationResult) {
    return (
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-white to-purple-50/50 backdrop-blur-sm border-0">
        <CardContent className="p-12 text-center text-gray-500">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-xl font-semibold mb-2">AI Reasoning Panel</h3>
          <p className="text-lg">Run a scenario simulation to see AI-powered insights</p>
          <p className="text-sm mt-2">
            The AI will analyze task dependencies, risks, and constraints to optimize your construction timeline
          </p>
        </CardContent>
      </Card>
    )
  }

  const getImpactColor = (impact: number) => {
    if (impact > 0) return "text-red-600"
    if (impact < 0) return "text-green-600"
    return "text-gray-600"
  }

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return "📈"
    if (impact < 0) return "📉"
    return "➡️"
  }

  const changedTasks = reorderedTasks.filter((task) => {
    const original = originalTasks.find((t) => t.id === task.id)
    return original && (original.startDate !== task.startDate || original.duration !== task.duration)
  })

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-white to-purple-50/50 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Gemini AI Reasoning
          </CardTitle>
          <p className="text-gray-600">AI-powered analysis and optimization recommendations</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reasoning" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reasoning">AI Reasoning</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
              <TabsTrigger value="changes">Task Changes</TabsTrigger>
              <TabsTrigger value="mitigation">Risk Mitigation</TabsTrigger>
            </TabsList>

            <TabsContent value="reasoning" className="space-y-4">
              <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Decision Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{simulationResult.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Plan Options Toggle */}
              {simulationResult.alternativePlans && simulationResult.alternativePlans.length > 0 && (
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="showAlternativePlans"
                    checked={showAlternativePlans}
                    onCheckedChange={(checked) => setShowAlternativePlans(checked as boolean)}
                  />
                  <label
                    htmlFor="showAlternativePlans"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show AI Plan Options
                  </label>
                </div>
              )}

              {/* Alternative Plans */}
              {showAlternativePlans &&
                simulationResult.alternativePlans &&
                simulationResult.alternativePlans.length > 0 && (
                  <div className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800">Alternative Plans</h3>
                    {simulationResult.alternativePlans.map((plan) => (
                      <Card key={plan.id} className="rounded-xl bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg text-purple-800">{plan.name}</h4>
                            <Button
                              size="sm"
                              onClick={() => onApplyAlternativePlan(plan)}
                              className="bg-purple-600 hover:bg-purple-700 rounded-xl"
                            >
                              Apply Plan
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700">{plan.description}</p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-500">Cost Tradeoff:</span>
                              <span className={`font-medium ${getImpactColor(plan.tradeoffs.cost)}`}>
                                {getImpactIcon(plan.tradeoffs.cost)} ${Math.abs(plan.tradeoffs.cost).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">Time Tradeoff:</span>
                              <span className={`font-medium ${getImpactColor(plan.tradeoffs.time)}`}>
                                {getImpactIcon(plan.tradeoffs.time)} {Math.abs(plan.tradeoffs.time)} days
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">Risk Tradeoff:</span>
                              <span className="font-medium">{plan.tradeoffs.risk}</span>
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg text-sm text-gray-800">
                            <p className="font-medium mb-1">Reasoning:</p>
                            <p className="whitespace-pre-line">{plan.reasoning}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Time Impact */}
                <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Time Impact</p>
                        <p className={`text-xl font-bold ${getImpactColor(simulationResult.timeImpact)}`}>
                          {getImpactIcon(simulationResult.timeImpact)} {Math.abs(simulationResult.timeImpact)} days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Impact */}
                <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Cost Impact</p>
                        <p className={`text-xl font-bold ${getImpactColor(simulationResult.costImpact)}`}>
                          {getImpactIcon(simulationResult.costImpact)} $
                          {Math.abs(simulationResult.costImpact).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Critical Path */}
                <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Critical Path Tasks</p>
                        <p className="text-xl font-bold text-orange-600">
                          {simulationResult.criticalPath.length} tasks
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Analysis Details */}
              <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Detailed Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {simulationResult.impactAnalysis}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="changes" className="space-y-4">
              {changedTasks.length === 0 ? (
                <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2">No Task Changes Required</h3>
                    <p>
                      The AI determined that the current schedule can accommodate the disruption without major changes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Tasks Modified by AI ({changedTasks.length})</h3>
                  {changedTasks.map((task) => {
                    const original = originalTasks.find((t) => t.id === task.id)
                    if (!original) return null

                    return (
                      <Card key={task.id} className="rounded-xl bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{task.taskName}</h4>
                              <div className="mt-2 space-y-2">
                                {original.startDate !== task.startDate && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Start Date:</span>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 rounded-full">
                                      {original.startDate}
                                    </Badge>
                                    <span>→</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 rounded-full">
                                      {task.startDate}
                                    </Badge>
                                  </div>
                                )}
                                {original.duration !== task.duration && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Duration:</span>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 rounded-full">
                                      {original.duration} days
                                    </Badge>
                                    <span>→</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 rounded-full">
                                      {task.duration} days
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`rounded-full ${
                                  task.priorityLevel === "High"
                                    ? "bg-red-100 text-red-800"
                                    : task.priorityLevel === "Medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {task.priorityLevel}
                              </Badge>
                              {task.weatherSensitive && <span className="text-orange-600">🌦️</span>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mitigation" className="space-y-4">
              <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Risk Mitigation Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {simulationResult.riskMitigation.map((strategy, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500"
                      >
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 leading-relaxed">{strategy}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Critical Path Visualization */}
              {simulationResult.criticalPath.length > 0 && (
                <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      Critical Path Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {simulationResult.criticalPath.map((taskId, index) => {
                        const task = reorderedTasks.find((t) => t.id === taskId)
                        if (!task) return null

                        return (
                          <div key={taskId} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{task.taskName}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>📅 {task.startDate}</span>
                                <span>⏱️ {task.duration} days</span>
                                <span>💰 ${task.costEstimate.toLocaleString()}</span>
                              </div>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800 rounded-full">Critical</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resource Bottlenecks */}
              {simulationResult.resourceBottlenecks && simulationResult.resourceBottlenecks.length > 0 && (
                <Card className="rounded-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Resource Bottlenecks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {simulationResult.resourceBottlenecks.map((bottleneck, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                          <h4 className="font-semibold text-red-800">{bottleneck.resource} Conflict</h4>
                          <p className="text-sm text-gray-800 mt-1">Dates: {bottleneck.conflictDates.join(", ")}</p>
                          <p className="text-sm text-gray-800">
                            Affected Tasks:{" "}
                            {bottleneck.affectedTasks
                              .map((id) => originalTasks.find((t) => t.id === id)?.taskName || id)
                              .join(", ")}
                          </p>
                          <p className="text-sm text-gray-800 mt-2">Suggestion: {bottleneck.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
