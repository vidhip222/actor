import { type NextRequest, NextResponse } from "next/server"
import type { Task } from "@/types/task"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, tasks, projectConstraints } = body

    const task = tasks.find((t: Task) => t.id === taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const dependencies = tasks.filter((t: Task) => t.dependency === taskId)
    const dependsOn = tasks.find((t: Task) => t.id === task.dependency)

    const prompt = `You are a construction project planning expert. Explain why this specific task is scheduled in its current position.

TASK DETAILS:
- Name: ${task.taskName}
- Start Date: ${task.startDate}
- Duration: ${task.duration} days
- Priority: ${task.priorityLevel}
- Risk Level: ${task.riskLevel}
- Category: ${task.taskCategory}
- Cost: $${task.costEstimate}
- Resources: ${task.resourceRequired}
- Weather Sensitive: ${task.weatherSensitive}
- Location: ${task.location}

${dependsOn ? `DEPENDS ON: ${dependsOn.taskName} (must complete first)` : "NO DEPENDENCIES"}

${dependencies.length > 0 ? `BLOCKS THESE TASKS: ${dependencies.map((d) => d.taskName).join(", ")}` : "NO DEPENDENT TASKS"}

PROJECT CONSTRAINTS:
- Budget: $${projectConstraints.projectBudget.toLocaleString()}
- Deadline: ${projectConstraints.absoluteDeadline}
- Available Crews: ${projectConstraints.availableCrews}

Provide a clear, business-focused explanation of:
1. Why this task is scheduled at this time
2. What factors influenced its position in the timeline
3. What risks or opportunities this timing creates
4. How it fits into the overall project flow

Keep the response concise and practical for construction managers.`

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await model.generateContent(prompt)
        const response = await result.response
        const reasoning = response.text()

        return NextResponse.json({ reasoning })
      } catch (error) {
        console.error("Gemini API error:", error)
      }
    }

    // Fallback reasoning
    const fallbackReasoning = `Task "${task.taskName}" is scheduled for ${task.startDate} based on:

• ${task.dependency ? `Dependency: Must wait for ${dependsOn?.taskName} to complete` : "No blocking dependencies - can start as scheduled"}
• Priority Level: ${task.priorityLevel} priority affects scheduling order
• Resource Requirements: ${task.resourceRequired} must be available
• ${task.weatherSensitive ? "Weather Sensitivity: Scheduled considering weather conditions" : "Not weather dependent"}
• Cost Impact: $${task.costEstimate.toLocaleString()} fits within project budget
${dependencies.length > 0 ? `• Blocks ${dependencies.length} downstream task(s): ${dependencies.map((d) => d.taskName).join(", ")}` : ""}

This timing optimizes resource utilization while maintaining the critical path and project constraints.`

    return NextResponse.json({ reasoning: fallbackReasoning })
  } catch (error) {
    console.error("Task reasoning error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
