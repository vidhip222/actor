"use client"

import { useState } from "react"
import type { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskForm } from "./task-form"
import { TaskTable } from "./task-table"
import { Plus } from "lucide-react"

interface TaskManagerProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  onTasksChange: (tasks: Task[]) => void
  onTaskReasoning: (taskId: string) => void // Added for "Why this order?"
}

export function TaskManager({ tasks, setTasks, onTasksChange, onTaskReasoning }: TaskManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleAddTask = (task: Task) => {
    const newTasks = [...tasks, task]
    setTasks(newTasks)
    onTasksChange(newTasks)
    setShowForm(false)
  }

  const handleEditTask = (task: Task) => {
    const newTasks = tasks.map((t) => (t.id === task.id ? task : t))
    setTasks(newTasks)
    onTasksChange(newTasks)
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    const newTasks = tasks.filter((t) => t.id !== taskId)
    setTasks(newTasks)
    onTasksChange(newTasks)
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-white to-blue-50/50 backdrop-blur-sm border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800">🏗️ Task Management</CardTitle>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6">
              <TaskForm onSubmit={handleAddTask} onCancel={() => setShowForm(false)} existingTasks={tasks} />
            </div>
          )}

          {editingTask && (
            <div className="mb-6">
              <TaskForm
                task={editingTask}
                onSubmit={handleEditTask}
                onCancel={() => setEditingTask(null)}
                existingTasks={tasks}
                isEditing
              />
            </div>
          )}

          <TaskTable
            tasks={tasks}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onTaskReasoning={onTaskReasoning}
          />
        </CardContent>
      </Card>
    </div>
  )
}
