"use client"

import type { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar, DollarSign, Users, AlertTriangle, Brain } from "lucide-react" // Added Brain icon
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TaskTableProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onTaskReasoning: (taskId: string) => void // Added for "Why this order?"
}

export function TaskTable({ tasks, onEdit, onDelete, onTaskReasoning }: TaskTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-orange-100 text-orange-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Blocked":
        return "bg-red-100 text-red-800"
      case "Not Started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-lg">No tasks added yet</p>
        <p className="text-sm">Click "Add Task" to get started</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
            <TableHead className="font-semibold">Task</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Duration</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Risk</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Progress</TableHead>
            <TableHead className="font-semibold">Cost</TableHead>
            <TableHead className="font-semibold">Team</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-blue-50/50 transition-colors">
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">{task.taskName}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {task.startDate} → {task.deadline}
                  </div>
                  {task.location && <div className="text-xs text-gray-400">📍 {task.location}</div>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded-full">
                  {task.taskCategory}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{task.duration}</span>
                  <span className="text-sm text-gray-500">days</span>
                </div>
                {task.slackTime > 0 && <div className="text-xs text-green-600">+{task.slackTime} slack</div>}
              </TableCell>
              <TableCell>
                <Badge className={`rounded-full ${getPriorityColor(task.priorityLevel)}`}>{task.priorityLevel}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={`rounded-full ${getRiskColor(task.riskLevel)}`}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {task.riskLevel}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`rounded-full ${getStatusColor(task.status)}`}>{task.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{task.progressPercent}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${task.progressPercent}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-medium">{Number(task.costEstimate ?? 0).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">{task.costType}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Users className="w-3 h-3" />
                  <span>{task.assignedTeam}</span>
                </div>
                {task.weatherSensitive && <div className="text-xs text-orange-600">🌦️ Weather sensitive</div>}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(task)} className="rounded-lg">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTaskReasoning(task.id)}
                    className="rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    title="Why this order?"
                  >
                    <Brain className="w-3 h-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
