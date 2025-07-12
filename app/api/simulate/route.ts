import { type NextRequest, NextResponse } from "next/server"
import type { Task, SimulationResult, ProjectConstraints, LaborPool, CustomScenario } from "@/types/task"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

function constructGeminiPrompt(
  tasks: Task[],
  scenario: string,
  delayDuration: number,
  affectedTaskIds: string[],
  projectConstraints: ProjectConstraints,
  laborPool: LaborPool[],
  customScenario?: CustomScenario,
): string {
  const affectedTasks = tasks.filter((task) => affectedTaskIds.includes(task.id))

  return `You are a cognitive AI construction project planner with expertise in construction scheduling, resource optimization, and risk management.

PROJECT CONTEXT:
- Total Budget: $${projectConstraints.projectBudget.toLocaleString()}
- Absolute Deadline: ${projectConstraints.absoluteDeadline}
- Available Crews: ${projectConstraints.availableCrews}
- Heavy Equipment: ${projectConstraints.heavyEquipmentCount} units
- Working Hours/Day: ${projectConstraints.workingHoursPerDay}

CURRENT TASK LIST:
${tasks
  .map(
    (task) => `
Task: ${task.taskName}
- ID: ${task.id}
- Duration: ${task.duration} days
- Start: ${task.startDate}
- Cost: $${task.costEstimate}
- Category: ${task.taskCategory}
- Priority: ${task.priorityLevel}
- Risk: ${task.riskLevel}
- Weather Sensitive: ${task.weatherSensitive}
- Dependencies: ${task.dependency || "None"}
- Resources: ${task.resourceRequired}
- Equipment: ${task.equipmentNeeded}
- Materials: ${task.materialDependencies}
- Assigned Team: ${task.assignedTeam}
- Location: ${task.location}
- Progress: ${task.progressPercent}%
`,
  )
  .join("\n")}

LABOR POOL:
${laborPool
  .map(
    (crew) => `
Crew: ${crew.name} (${crew.role})
- Daily Availability: ${crew.dailyAvailability} hours
- Shifts: ${crew.shiftsPerDay} x ${crew.hoursPerShift}h
- Assigned Tasks: ${crew.assignedTasks.join(", ") || "None"}
`,
  )
  .join("\n")}

DISRUPTION EVENT:
${
  customScenario
    ? `
Custom Scenario: ${customScenario.name}
Type: ${customScenario.type}
Description: ${customScenario.description}
Affected Tasks: ${affectedTasks.map((t) => t.taskName).join(", ")}
Delay Duration: ${delayDuration} days
Cascading Effect: ${customScenario.cascadingEffect ? "Yes" : "No"}
${customScenario.cascadingEffect ? `Cascading Tasks: ${customScenario.cascadingTasks}` : ""}
Partial Availability: ${customScenario.partialAvailability}%
`
    : `
Scenario: ${scenario}
Affected Tasks: ${affectedTasks.map((t) => t.taskName).join(", ")}
Delay Duration: ${delayDuration} days
`
}

REQUIREMENTS:
1. Analyze the disruption impact on the construction schedule
2. Consider task dependencies, resource constraints, and critical path
3. Optimize the schedule to minimize project delay and cost overrun
4. Ensure safety and quality standards are maintained
5. Factor in weather sensitivity and resource availability
6. Provide 2-3 alternative optimization strategies

Please provide your response in the following JSON format:
{
  "reorderedTasks": [array of tasks with updated startDate, duration, and other modified fields],
  "reasoning": "Detailed explanation of your optimization decisions",
  "impactAnalysis": "Analysis of the disruption's effects on timeline, cost, and resources",
  "criticalPath": [array of task IDs that form the new critical path],
  "costImpact": number (positive for increase, negative for savings),
  "timeImpact": number (days added or saved),
  "riskMitigation": [array of risk mitigation strategies],
  "alternativePlans": [
    {
      "id": "plan1",
      "name": "Cost-Optimized Plan",
      "description": "Minimize cost impact",
      "tasks": [reordered task array],
      "tradeoffs": {"cost": number, "time": number, "risk": "Low/Medium/High"},
      "reasoning": "explanation"
    },
    {
      "id": "plan2", 
      "name": "Time-Optimized Plan",
      "description": "Minimize schedule delay",
      "tasks": [reordered task array],
      "tradeoffs": {"cost": number, "time": number, "risk": "Low/Medium/High"},
      "reasoning": "explanation"
    }
  ],
  "resourceBottlenecks": [
    {
      "resource": "resource name",
      "conflictDates": ["date1", "date2"],
      "affectedTasks": ["taskId1", "taskId2"],
      "suggestion": "resolution suggestion"
    }
  ],
  "businessMetrics": {
    "totalCost": number,
    "totalDuration": number,
    "criticalPathCount": number,
    "highRiskTasksPercent": number,
    "weatherBlockedTasksPercent": number,
    "resourceUtilization": number
  }
}

Focus on practical construction industry solutions and provide clear business reasoning for all decisions.`
}

// ─── Gemini helper ────────────────────────────────────────────────────────────
function cleanGeminiJson(raw: string) {
  // Remove triple-back-tick fences  \`\`\`json … \`\`\` or \`\`\` … \`\`\`
  raw = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "")
  // Remove JS-style // comments
  raw = raw.replace(/^([\t ]*\/\/.*$)/gim, "")
  // Remove C-style /* … */ block comments
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, "")
  return raw.trim()
}

async function callGeminiAPI(prompt: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Prefer fenced block → { json }
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const jsonCandidate = cleanGeminiJson(fenceMatch ? fenceMatch[1] : text)

    return JSON.parse(jsonCandidate)
  } catch (err) {
    console.error("Gemini API parse error:", err)
    throw err
  }
}

function fallbackSimulation(
  tasks: Task[],
  scenario: string,
  delayDuration: number,
  affectedTaskIds: string[],
  projectConstraints: ProjectConstraints,
): SimulationResult {
  // Enhanced fallback logic
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
    weatherBlockedTasksPercent: (reorderedTasks.filter((t) => t.weatherSensitive).length / reorderedTasks.length) * 100,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tasks, scenario, delayDuration, affectedTaskIds, projectConstraints, laborPool, customScenario } = body

    // Validate input
    if (!tasks || !scenario || !delayDuration || !affectedTaskIds) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    let result: SimulationResult

    // Try Gemini API first
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = constructGeminiPrompt(
          tasks,
          scenario,
          delayDuration,
          affectedTaskIds,
          projectConstraints,
          laborPool || [],
          customScenario,
        )

        const geminiResponse = await callGeminiAPI(prompt)

        // Validate Gemini response
        if (geminiResponse && geminiResponse.reorderedTasks && geminiResponse.reasoning) {
          result = geminiResponse
        } else {
          throw new Error("Invalid Gemini response format")
        }
      } catch (geminiError) {
        console.error("Gemini API failed, using fallback:", geminiError)
        result = fallbackSimulation(tasks, scenario, delayDuration, affectedTaskIds, projectConstraints)
      }
    } else {
      // Use fallback if no API key
      result = fallbackSimulation(tasks, scenario, delayDuration, affectedTaskIds, projectConstraints)
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Simulation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
