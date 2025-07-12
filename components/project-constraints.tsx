"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { ProjectConstraints as ProjectConstraintsType } from "@/types/task"

interface ProjectConstraintsProps {
  constraints: ProjectConstraintsType
  onConstraintsChange: (c: ProjectConstraintsType) => void
}

export function ProjectConstraints({ constraints, onConstraintsChange }: ProjectConstraintsProps) {
  const updateField = (field: keyof ProjectConstraintsType, value: string | number) =>
    onConstraintsChange({ ...constraints, [field]: value })

  return (
    <Card className="rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">🔧 Project-wide Constraints</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Project Budget ($)</Label>
          <Input
            type="number"
            value={constraints.projectBudget}
            onChange={(e) => updateField("projectBudget", Number(e.target.value))}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Absolute Deadline</Label>
          <Input
            type="date"
            value={constraints.absoluteDeadline}
            onChange={(e) => updateField("absoluteDeadline", e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Available Crews</Label>
          <Input
            type="number"
            min={1}
            value={constraints.availableCrews}
            onChange={(e) => updateField("availableCrews", Number(e.target.value))}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Heavy Equipment Units</Label>
          <Input
            type="number"
            min={0}
            value={constraints.heavyEquipmentCount}
            onChange={(e) => updateField("heavyEquipmentCount", Number(e.target.value))}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Working Hours / Day</Label>
          <Input
            type="number"
            min={1}
            max={24}
            value={constraints.workingHoursPerDay}
            onChange={(e) => updateField("workingHoursPerDay", Number(e.target.value))}
            className="rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  )
}
