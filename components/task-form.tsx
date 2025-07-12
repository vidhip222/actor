"use client"

import type React from "react"

import { useState } from "react"
import type { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TaskFormProps {
  task?: Task
  onSubmit: (task: Task) => void
  onCancel: () => void
  existingTasks: Task[]
  isEditing?: boolean
}

export function TaskForm({ task, onSubmit, onCancel, existingTasks, isEditing = false }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      taskName: "",
      duration: 1,
      dependency: null,
      costEstimate: 0,
      resourceRequired: "",
      weatherSensitive: false,
      startDate: "",
      deadline: "",
      taskCategory: "Structural",
      location: "",
      priorityLevel: "Medium",
      riskLevel: "Low",
      status: "Not Started",
      assignedTeam: "",
      progressPercent: 0,
      slackTime: 0,
      replanAllowed: true,
      equipmentNeeded: "",
      materialDependencies: "",
      costType: "Fixed",
      contingencyBuffer: 0,
      cognitiveTags: [],
      explainabilityNote: "",
    },
  )

  const [newTag, setNewTag] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const taskData: Task = {
      ...formData,
      id: task?.id || Date.now().toString(),
    } as Task
    onSubmit(taskData)
  }

  const addTag = () => {
    if (newTag && !formData.cognitiveTags?.includes(newTag)) {
      setFormData({
        ...formData,
        cognitiveTags: [...(formData.cognitiveTags || []), newTag],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      cognitiveTags: formData.cognitiveTags?.filter((tag) => tag !== tagToRemove) || [],
    })
  }

  return (
    <Card className="rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          {isEditing ? "✏️ Edit Task" : "➕ Add New Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                value={formData.taskName || ""}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration || 1}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dependency">Dependency</Label>
              <Select
                value={formData.dependency || "None"}
                onValueChange={(value) => setFormData({ ...formData, dependency: value || null })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select dependency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">No dependency</SelectItem>
                  {existingTasks
                    .filter((t) => t.id !== task?.id)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.taskName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Financial */}
            <div className="space-y-2">
              <Label htmlFor="costEstimate">Cost Estimate ($)</Label>
              <Input
                id="costEstimate"
                type="number"
                min="0"
                value={formData.costEstimate || 0}
                onChange={(e) => setFormData({ ...formData, costEstimate: Number.parseFloat(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costType">Cost Type</Label>
              <Select
                value={formData.costType || "Fixed"}
                onValueChange={(value) => setFormData({ ...formData, costType: value as Task["costType"] })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Variable">Variable</SelectItem>
                  <SelectItem value="Labor">Labor</SelectItem>
                  <SelectItem value="Material">Material</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contingencyBuffer">Contingency Buffer (%)</Label>
              <Input
                id="contingencyBuffer"
                type="number"
                min="0"
                max="100"
                value={formData.contingencyBuffer || 0}
                onChange={(e) => setFormData({ ...formData, contingencyBuffer: Number.parseFloat(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline || ""}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slackTime">Slack/Float Time (days)</Label>
              <Input
                id="slackTime"
                type="number"
                min="0"
                value={formData.slackTime || 0}
                onChange={(e) => setFormData({ ...formData, slackTime: Number.parseInt(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            {/* Categories and Classifications */}
            <div className="space-y-2">
              <Label htmlFor="taskCategory">Task Category</Label>
              <Select
                value={formData.taskCategory || "Structural"}
                onValueChange={(value) => setFormData({ ...formData, taskCategory: value as Task["taskCategory"] })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Structural">Structural</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Finishing">Finishing</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorityLevel">Priority Level</Label>
              <Select
                value={formData.priorityLevel || "Medium"}
                onValueChange={(value) => setFormData({ ...formData, priorityLevel: value as Task["priorityLevel"] })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select
                value={formData.riskLevel || "Low"}
                onValueChange={(value) => setFormData({ ...formData, riskLevel: value as Task["riskLevel"] })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "Not Started"}
                onValueChange={(value) => setFormData({ ...formData, status: value as Task["status"] })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location and Resources */}
            <div className="space-y-2">
              <Label htmlFor="location">Location/Zone</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTeam">Assigned Team/Subcontractor</Label>
              <Input
                id="assignedTeam"
                value={formData.assignedTeam || ""}
                onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceRequired">Resource Required</Label>
              <Input
                id="resourceRequired"
                value={formData.resourceRequired || ""}
                onChange={(e) => setFormData({ ...formData, resourceRequired: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentNeeded">Equipment Needed</Label>
              <Input
                id="equipmentNeeded"
                value={formData.equipmentNeeded || ""}
                onChange={(e) => setFormData({ ...formData, equipmentNeeded: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialDependencies">Material Dependencies</Label>
              <Input
                id="materialDependencies"
                value={formData.materialDependencies || ""}
                onChange={(e) => setFormData({ ...formData, materialDependencies: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <Label>Progress % Complete: {formData.progressPercent || 0}%</Label>
            <Slider
              value={[formData.progressPercent || 0]}
              onValueChange={(value) => setFormData({ ...formData, progressPercent: value[0] })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weatherSensitive"
                checked={formData.weatherSensitive || false}
                onCheckedChange={(checked) => setFormData({ ...formData, weatherSensitive: checked as boolean })}
              />
              <Label htmlFor="weatherSensitive">Weather Sensitive</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="replanAllowed"
                checked={formData.replanAllowed !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, replanAllowed: checked as boolean })}
              />
              <Label htmlFor="replanAllowed">Replan Allowed</Label>
            </div>
          </div>

          {/* Cognitive Tags */}
          <div className="space-y-2">
            <Label>Cognitive Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.cognitiveTags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="rounded-full">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add cognitive tag"
                className="rounded-xl"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" className="rounded-xl bg-transparent">
                Add
              </Button>
            </div>
          </div>

          {/* Explainability Note */}
          <div className="space-y-2">
            <Label htmlFor="explainabilityNote">Explainability Note</Label>
            <Textarea
              id="explainabilityNote"
              value={formData.explainabilityNote || ""}
              onChange={(e) => setFormData({ ...formData, explainabilityNote: e.target.value })}
              rows={3}
              className="rounded-xl"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl"
            >
              {isEditing ? "Update Task" : "Add Task"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
