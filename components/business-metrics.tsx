"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Clock } from "lucide-react"
import type { Task, SimulationResult, ProjectConstraints } from "@/types/task"

interface BusinessMetricsProps {
  originalTasks: Task[]
  currentTasks: Task[]
  simulationResult: SimulationResult | null
  projectConstraints: ProjectConstraints
}

export function BusinessMetrics({ currentTasks, simulationResult }: BusinessMetricsProps) {
  const totalCost = currentTasks.reduce((sum, t) => sum + t.costEstimate, 0)
  const totalDuration =
    (Math.max(...currentTasks.map((t) => new Date(t.deadline).getTime())) -
      Math.min(...currentTasks.map((t) => new Date(t.startDate).getTime()))) /
    (1000 * 60 * 60 * 24)

  return (
    <Card className="rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">📈 Business Impact Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricBox
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          label="Total Cost"
          value={`$${totalCost.toLocaleString()}`}
        />
        <MetricBox
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          label="Total Duration"
          value={`${Math.ceil(totalDuration)} days`}
        />
        <MetricBox
          icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
          label="Critical Path Tasks"
          value={simulationResult?.criticalPath.length ?? 0}
        />
      </CardContent>
    </Card>
  )
}

function MetricBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
