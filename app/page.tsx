"use client"

import { useState, useEffect } from "react"
import { TaskManager } from "@/components/task-manager"
import { GanttChart } from "@/components/gantt-chart"
import { AIReasoningPanel } from "@/components/ai-reasoning-panel"
import { ProjectConstraints } from "@/components/project-constraints"
import { LaborPoolManager } from "@/components/labor-pool-manager"
import { BusinessMetrics } from "@/components/business-metrics"
import { ScenarioBuilder } from "@/components/scenario-builder" // Updated import
import { DataImportExport } from "@/components/data-import-export"
import type {
  Task,
  SimulationResult,
  ProjectConstraints as ProjectConstraintsType,
  LaborPool,
  CustomScenario,
} from "@/types/task"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateSampleConstructionPlan } from "@/utils/sample-data"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function CognitiveConstructionTwin() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [originalTasks, setOriginalTasks] = useState<Task[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [projectConstraints, setProjectConstraints] = useState<ProjectConstraintsType>({
    projectBudget: 1000000,
    absoluteDeadline: "2024-12-31",
    availableCrews: 5,
    heavyEquipmentCount: 2,
    workingHoursPerDay: 8,
  })
  const [laborPool, setLaborPool] = useState<LaborPool[]>([])
  // Removed customScenario state as it's now managed internally by ScenarioBuilder
  // const [customScenario, setCustomScenario] = useState<CustomScenario | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("construction-tasks")
    const savedConstraints = localStorage.getItem("project-constraints")
    const savedLaborPool = localStorage.getItem("labor-pool")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      setTasks(parsedTasks)
      setOriginalTasks(parsedTasks)
    }

    if (savedConstraints) {
      setProjectConstraints(JSON.parse(savedConstraints))
    }

    if (savedLaborPool) {
      setLaborPool(JSON.parse(savedLaborPool))
    }
  }, [])

  // Save data to localStorage when changed
  useEffect(() => {
    localStorage.setItem("construction-tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("project-constraints", JSON.stringify(projectConstraints))
  }, [projectConstraints])

  useEffect(() => {
    localStorage.setItem("labor-pool", JSON.stringify(laborPool))
  }, [laborPool])

  const handleSimulation = async (
    scenarioId: string, // This is the ID of the selected scenario (predefined or 'custom')
    delayDuration: number,
    affectedTaskIds: string[],
    customScenarioData: CustomScenario, // The full custom scenario object is now passed
  ) => {
    setIsSimulating(true)
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks,
          scenario: scenarioId, // Pass the scenario ID
          delayDuration,
          affectedTaskIds,
          projectConstraints,
          laborPool,
          customScenario: customScenarioData, // Pass the full custom scenario object
        }),
      })

      if (!response.ok) {
        throw new Error("Simulation failed")
      }

      const result: SimulationResult = await response.json()
      setSimulationResult(result)
      setTasks(result.reorderedTasks)
    } catch (error) {
      console.error("Simulation error:", error)
      // Fallback to dummy simulation if Gemini fails
      const fallbackResult = await simulateWithFallback(scenarioId, delayDuration, affectedTaskIds, projectConstraints) // Pass projectConstraints
      setSimulationResult(fallbackResult)
      setTasks(fallbackResult.reorderedTasks)
    } finally {
      setIsSimulating(false)
    }
  }

  const simulateWithFallback = async (
    scenario: string,
    delayDuration: number,
    affectedTaskIds: string[],
    projectConstraints: ProjectConstraintsType, // Added projectConstraints
  ): Promise<SimulationResult> => {
    // Fallback simulation logic
    const reorderedTasks = [...tasks]
    let totalCostImpact = 0

    // Apply delays to affected tasks
    affectedTaskIds.forEach((taskId) => {
      const taskIndex = reorderedTasks.findIndex((t) => t.id === taskId)
      if (taskIndex !== -1) {
        const task = reorderedTasks[taskIndex]
        const startDate = new Date(task.startDate)
        startDate.setDate(startDate.getDate() + delayDuration)

        // Update deadline accordingly
        const deadline = new Date(task.deadline)
        deadline.setDate(deadline.getDate() + delayDuration)

        reorderedTasks[taskIndex] = {
          ...task,
          startDate: startDate.toISOString().split("T")[0],
          deadline: deadline.toISOString().split("T")[0],
        }

        // Add delay costs
        totalCostImpact += task.costEstimate * 0.1 * delayDuration
      }
    })

    // Update dependent tasks
    reorderedTasks.forEach((task, index) => {
      if (task.dependency && affectedTaskIds.includes(task.dependency)) {
        const dependentTask = reorderedTasks.find((t) => t.id === task.dependency)
        if (dependentTask) {
          const dependentEndDate = new Date(dependentTask.startDate)
          dependentEndDate.setDate(dependentEndDate.getDate() + dependentTask.duration)

          const newStartDate = new Date(dependentEndDate)
          newStartDate.setDate(newStartDate.getDate() + 1)

          const newDeadline = new Date(newStartDate)
          newDeadline.setDate(newDeadline.getDate() + task.duration)

          reorderedTasks[index] = {
            ...task,
            startDate: newStartDate.toISOString().split("T")[0],
            deadline: newDeadline.toISOString().split("T")[0],
          }
        }
      }
    })

    const businessMetrics = {
      totalCost: reorderedTasks.reduce((sum, task) => sum + task.costEstimate, 0) + totalCostImpact,
      totalDuration: delayDuration,
      criticalPathCount: reorderedTasks.filter((t) => t.priorityLevel === "High").length,
      highRiskTasksPercent: (reorderedTasks.filter((t) => t.riskLevel === "High").length / reorderedTasks.length) * 100,
      weatherBlockedTasksPercent:
        (reorderedTasks.filter((t) => t.weatherSensitive).length / reorderedTasks.length) * 100,
      resourceUtilization: 75,
    }

    return {
      reorderedTasks,
      reasoning: `Fallback simulation applied: ${scenario} scenario with ${delayDuration} day delay affecting ${affectedTaskIds.length} tasks. Applied standard delay propagation and cost impact calculations.`,
      impactAnalysis: `The ${scenario} has created a ${delayDuration}-day disruption. Estimated cost impact: $${totalCostImpact.toLocaleString()}. ${reorderedTasks.filter((t) => affectedTaskIds.includes(t.id) || (t.dependency && affectedTaskIds.includes(t.dependency))).length} tasks affected directly or through dependencies.`,
      criticalPath: reorderedTasks.filter((t) => t.priorityLevel === "High").map((t) => t.id),
      costImpact: totalCostImpact,
      timeImpact: delayDuration,
      riskMitigation: [
        "Implement daily progress monitoring",
        "Establish contingency resource pools",
        "Create alternative supplier networks",
        "Develop weather-resistant work procedures",
      ],
      businessMetrics,
    }
  }

  const handleTaskReasoning = async (taskId: string) => {
    try {
      const response = await fetch("/api/task-reasoning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          tasks,
          projectConstraints,
        }),
      })

      if (response.ok) {
        const reasoning = await response.json()
        // Show reasoning in a modal or panel
        console.log("Task reasoning:", reasoning)
      }
    } catch (error) {
      console.error("Task reasoning error:", error)
    }
  }

  const resetToOriginal = () => {
    setTasks(originalTasks)
    setSimulationResult(null)
  }

  const loadSamplePlan = () => {
    const sampleTasks = generateSampleConstructionPlan()
    setTasks(sampleTasks)
    setOriginalTasks(sampleTasks)
  }

  const handleTasksChange = (newTasks: Task[]) => {
    setTasks(newTasks)
    if (simulationResult === null) {
      setOriginalTasks(newTasks)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🚧 ACTOR
          </h1>
          <p className="text-gray-600 text-lg">Autonomous Construction Task Optimization & Reasoning</p>

          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={loadSamplePlan}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Sample Plan
            </Button>
            <DataImportExport tasks={tasks} onTasksImport={handleTasksChange} />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="planning">Task Planning</TabsTrigger>
            <TabsTrigger value="constraints">Project Setup</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Timeline</TabsTrigger>
            <TabsTrigger value="simulation">Scenarios</TabsTrigger>
            <TabsTrigger value="reasoning">AI Reasoning</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <TaskManager
              tasks={tasks}
              setTasks={setTasks}
              onTasksChange={handleTasksChange}
              onTaskReasoning={handleTaskReasoning}
            />
          </TabsContent>

          <TabsContent value="constraints" className="space-y-6">
            <ProjectConstraints constraints={projectConstraints} onConstraintsChange={setProjectConstraints} />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <LaborPoolManager laborPool={laborPool} onLaborPoolChange={setLaborPool} tasks={tasks} />
          </TabsContent>

          <TabsContent value="gantt" className="space-y-6">
            <Card className="p-6 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm">
              <GanttChart
                tasks={tasks}
                originalTasks={originalTasks}
                showComparison={simulationResult !== null}
                laborPool={laborPool}
              />
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <ScenarioBuilder // Changed from AdvancedScenarioBuilder
              tasks={tasks}
              onSimulate={handleSimulation}
              isSimulating={isSimulating}
              onReset={resetToOriginal}
              hasSimulation={simulationResult !== null}
              // Removed onCustomScenario as it's now handled internally
            />
          </TabsContent>

          <TabsContent value="reasoning" className="space-y-6">
            <AIReasoningPanel
              simulationResult={simulationResult}
              originalTasks={originalTasks}
              reorderedTasks={tasks}
              onApplyAlternativePlan={(plan) => {
                setTasks(plan.tasks)
                setSimulationResult({
                  ...simulationResult!,
                  reorderedTasks: plan.tasks,
                  reasoning: plan.reasoning,
                })
              }}
            />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <BusinessMetrics
              originalTasks={originalTasks}
              currentTasks={tasks}
              simulationResult={simulationResult}
              projectConstraints={projectConstraints}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
