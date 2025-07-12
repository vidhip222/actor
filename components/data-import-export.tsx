"use client"

import type React from "react"

import { useState } from "react"
import type { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Upload, FileText, Database } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DataImportExportProps {
  tasks: Task[]
  onTasksImport: (tasks: Task[]) => void
}

export function DataImportExport({ tasks, onTasksImport }: DataImportExportProps) {
  const [isOpen, setIsOpen] = useState(false)

  const exportToJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `construction-plan-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Export Successful",
      description: "Tasks exported to JSON file",
    })
  }

  const exportToCSV = () => {
    if (tasks.length === 0) {
      toast({
        title: "No Data",
        description: "No tasks to export",
        variant: "destructive",
      })
      return
    }

    const headers = [
      "ID",
      "Task Name",
      "Duration",
      "Dependency",
      "Cost Estimate",
      "Resource Required",
      "Weather Sensitive",
      "Start Date",
      "Deadline",
      "Task Category",
      "Location",
      "Priority Level",
      "Risk Level",
      "Status",
      "Assigned Team",
      "Progress Percent",
      "Slack Time",
      "Replan Allowed",
      "Equipment Needed",
      "Material Dependencies",
      "Cost Type",
      "Contingency Buffer",
      "Cognitive Tags",
      "Explainability Note",
      "Material Batch",
      "Crew Role",
      "Shift Requirement",
      "Subcontractor",
    ]

    const csvContent = [
      headers.join(","),
      ...tasks.map((task) =>
        [
          task.id,
          `"${task.taskName}"`,
          task.duration,
          task.dependency || "",
          task.costEstimate,
          `"${task.resourceRequired}"`,
          task.weatherSensitive,
          task.startDate,
          task.deadline,
          task.taskCategory,
          `"${task.location}"`,
          task.priorityLevel,
          task.riskLevel,
          task.status,
          `"${task.assignedTeam}"`,
          task.progressPercent,
          task.slackTime,
          task.replanAllowed,
          `"${task.equipmentNeeded}"`,
          `"${task.materialDependencies}"`,
          task.costType,
          task.contingencyBuffer,
          `"${task.cognitiveTags.join(";")}"`,
          `"${task.explainabilityNote}"`,
          `"${task.materialBatch || ""}"`,
          `"${task.crewRole || ""}"`,
          task.shiftRequirement || 1,
          `"${task.subcontractor || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const dataBlob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `construction-plan-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Export Successful",
      description: "Tasks exported to CSV file",
    })
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let importedTasks: Task[] = []

        if (file.name.endsWith(".json")) {
          importedTasks = JSON.parse(content)
        } else if (file.name.endsWith(".csv")) {
          importedTasks = parseCSV(content)
        }

        // Validate imported tasks
        if (Array.isArray(importedTasks) && importedTasks.length > 0) {
          // Ensure all required fields are present
          const validatedTasks = importedTasks.map((task, index) => ({
            id: task.id || `imported-${index}`,
            taskName: task.taskName || `Imported Task ${index + 1}`,
            duration: Number(task.duration) || 1,
            dependency: task.dependency || null,
            costEstimate: Number(task.costEstimate) || 0,
            resourceRequired: task.resourceRequired || "",
            weatherSensitive: Boolean(task.weatherSensitive),
            startDate: task.startDate || new Date().toISOString().split("T")[0],
            deadline: task.deadline || new Date().toISOString().split("T")[0],
            taskCategory: task.taskCategory || "Structural",
            location: task.location || "",
            priorityLevel: task.priorityLevel || "Medium",
            riskLevel: task.riskLevel || "Low",
            status: task.status || "Not Started",
            assignedTeam: task.assignedTeam || "",
            progressPercent: Number(task.progressPercent) || 0,
            slackTime: Number(task.slackTime) || 0,
            replanAllowed: Boolean(task.replanAllowed !== false),
            equipmentNeeded: task.equipmentNeeded || "",
            materialDependencies: task.materialDependencies || "",
            costType: task.costType || "Fixed",
            contingencyBuffer: Number(task.contingencyBuffer) || 0,
            cognitiveTags: Array.isArray(task.cognitiveTags) ? task.cognitiveTags : [],
            explainabilityNote: task.explainabilityNote || "",
            materialBatch: task.materialBatch || "",
            crewRole: task.crewRole || "",
            shiftRequirement: Number(task.shiftRequirement) || 1,
            subcontractor: task.subcontractor || "",
          }))

          onTasksImport(validatedTasks)
          setIsOpen(false)
          toast({
            title: "Import Successful",
            description: `Imported ${validatedTasks.length} tasks`,
          })
        } else {
          throw new Error("Invalid file format")
        }
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import Failed",
          description: "Please check your file format and try again",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const parseCSV = (content: string): Task[] => {
    const lines = content.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())
    const tasks: Task[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = parseCSVLine(line)
      const task: any = {}

      headers.forEach((header, index) => {
        const value = values[index]?.replace(/^"|"$/g, "") // Remove quotes

        switch (header.toLowerCase()) {
          case "id":
            task.id = value
            break
          case "task name":
            task.taskName = value
            break
          case "duration":
            task.duration = Number(value) || 1
            break
          case "dependency":
            task.dependency = value || null
            break
          case "cost estimate":
            task.costEstimate = Number(value) || 0
            break
          case "weather sensitive":
            task.weatherSensitive = value.toLowerCase() === "true"
            break
          case "progress percent":
            task.progressPercent = Number(value) || 0
            break
          case "slack time":
            task.slackTime = Number(value) || 0
            break
          case "replan allowed":
            task.replanAllowed = value.toLowerCase() !== "false"
            break
          case "contingency buffer":
            task.contingencyBuffer = Number(value) || 0
            break
          case "cognitive tags":
            task.cognitiveTags = value ? value.split(";") : []
            break
          case "shift requirement":
            task.shiftRequirement = Number(value) || 1
            break
          default:
            // Map other fields directly
            const fieldName = header.toLowerCase().replace(/\s+/g, "")
            if (fieldName === "resourcerequired") task.resourceRequired = value
            else if (fieldName === "startdate") task.startDate = value
            else if (fieldName === "taskcategory") task.taskCategory = value
            else if (fieldName === "prioritylevel") task.priorityLevel = value
            else if (fieldName === "risklevel") task.riskLevel = value
            else if (fieldName === "assignedteam") task.assignedTeam = value
            else if (fieldName === "equipmentneeded") task.equipmentNeeded = value
            else if (fieldName === "materialdependencies") task.materialDependencies = value
            else if (fieldName === "costtype") task.costType = value
            else if (fieldName === "explainabilitynote") task.explainabilityNote = value
            else if (fieldName === "materialbatch") task.materialBatch = value
            else if (fieldName === "crewrole") task.crewRole = value
            else if (fieldName === "subcontractor") task.subcontractor = value
            else task[fieldName] = value
        }
      })

      tasks.push(task as Task)
    }

    return tasks
  }

  const parseCSVLine = (line: string): string[] => {
    const result = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl bg-transparent">
          <Database className="w-4 h-4 mr-2" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import/Export Tasks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Export Section */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={exportToJSON} className="w-full rounded-xl bg-transparent" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
              <Button onClick={exportToCSV} className="w-full rounded-xl bg-transparent" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <p className="text-sm text-gray-600">Current tasks: {tasks.length}</p>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input type="file" accept=".json,.csv" onChange={handleFileImport} className="rounded-xl" />
              <p className="text-sm text-gray-600">
                Supports JSON and CSV formats. Imported tasks will replace current tasks.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
