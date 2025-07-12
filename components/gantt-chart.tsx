"use client"

import type { Task } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertTriangle } from "lucide-react"

interface GanttChartProps {
  tasks: Task[]
  originalTasks: Task[]
  showComparison: boolean
}

export function GanttChart({ tasks, originalTasks, showComparison }: GanttChartProps) {
  // Calculate date range
  const allDates = tasks.flatMap((task) => [task.startDate, task.deadline]).filter(Boolean)
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map((d) => new Date(d).getTime()))) : new Date()
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map((d) => new Date(d).getTime()))) : new Date()

  // Generate date range for timeline
  const dateRange = []
  const current = new Date(minDate)
  while (current <= maxDate) {
    dateRange.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  const getTaskColor = (task: Task) => {
    if (task.status === "Completed") return "bg-green-500"
    if (task.status === "In Progress") return "bg-blue-500"
    if (task.status === "Blocked") return "bg-red-500"
    if (task.riskLevel === "High") return "bg-orange-500"
    if (task.priorityLevel === "High") return "bg-purple-500"
    return "bg-gray-400"
  }

  const getTaskPosition = (startDate: string, duration: number) => {
    const start = new Date(startDate)
    const daysDiff = Math.floor((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    const startPercent = (daysDiff / dateRange.length) * 100
    const widthPercent = (duration / dateRange.length) * 100
    return { left: `${startPercent}%`, width: `${widthPercent}%` }
  }

  if (tasks.length === 0) {
    return (
      <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">No tasks to display</p>
          <p className="text-sm">Add some tasks to see the Gantt timeline</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">📊 Gantt Timeline</h2>
        {showComparison && (
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full">
            🔄 Replanned View
          </Badge>
        )}
      </div>

      {/* Timeline Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">
            Timeline: {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
          </span>
          <Clock className="w-5 h-5 text-gray-600 ml-4" />
          <span className="font-medium text-gray-700">Total Duration: {dateRange.length} days</span>
        </div>

        {/* Date Headers */}
        <div className="relative mb-4">
          <div className="flex text-xs text-gray-500 border-b border-gray-200 pb-2">
            {dateRange.map((date, index) => (
              <div key={index} className="flex-1 text-center min-w-0" style={{ minWidth: "30px" }}>
                {index % 7 === 0 ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {tasks.map((task) => {
            const position = getTaskPosition(task.startDate, task.duration)
            const originalTask = originalTasks.find((t) => t.id === task.id)
            const hasChanged =
              showComparison &&
              originalTask &&
              (originalTask.startDate !== task.startDate || originalTask.duration !== task.duration)

            return (
              <div key={task.id} className="relative">
                {/* Task Row */}
                <div className="flex items-center gap-4 py-2">
                  {/* Task Info */}
                  <div className="w-64 flex-shrink-0">
                    <div className="font-medium text-sm text-gray-900">{task.taskName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs rounded-full ${
                          task.priorityLevel === "High"
                            ? "border-red-300 text-red-700"
                            : task.priorityLevel === "Medium"
                              ? "border-yellow-300 text-yellow-700"
                              : "border-green-300 text-green-700"
                        }`}
                      >
                        {task.priorityLevel}
                      </Badge>
                      {task.riskLevel === "High" && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                      {task.weatherSensitive && <span className="text-orange-600">🌦️</span>}
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-8 bg-gray-100 rounded-lg">
                    {/* Original position (if changed) */}
                    {hasChanged && originalTask && (
                      <div
                        className="absolute top-0 h-full bg-gray-300 rounded-lg opacity-50 border-2 border-dashed border-gray-400"
                        style={getTaskPosition(originalTask.startDate, originalTask.duration)}
                        title={`Original: ${originalTask.startDate} (${originalTask.duration} days)`}
                      />
                    )}

                    {/* Current position */}
                    <div
                      className={`absolute top-0 h-full rounded-lg ${getTaskColor(task)} ${
                        hasChanged ? "border-2 border-white shadow-lg" : ""
                      }`}
                      style={position}
                      title={`${task.taskName}: ${task.startDate} (${task.duration} days)`}
                    >
                      {/* Progress overlay */}
                      <div
                        className="h-full bg-white/30 rounded-lg"
                        style={{ width: `${100 - task.progressPercent}%`, marginLeft: `${task.progressPercent}%` }}
                      />

                      {/* Task label */}
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium px-2">
                        <span className="truncate">
                          {task.duration}d {task.progressPercent > 0 && `(${task.progressPercent}%)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="w-32 flex-shrink-0 text-xs text-gray-600">
                    <div>${task.costEstimate.toLocaleString()}</div>
                    <div className="text-gray-500">{task.assignedTeam}</div>
                  </div>
                </div>

                {/* Dependencies */}
                {task.dependency && (
                  <div className="ml-64 text-xs text-gray-400 mb-1">
                    ↳ Depends on: {tasks.find((t) => t.id === task.dependency)?.taskName || "Unknown"}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>High Priority</span>
            </div>
            {showComparison && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 border-2 border-dashed border-gray-400 rounded"></div>
                <span>Original Plan</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
