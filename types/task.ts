export interface Task {
  id: string
  taskName: string
  duration: number
  dependency: string | null
  costEstimate: number
  resourceRequired: string
  weatherSensitive: boolean
  startDate: string
  deadline: string
  taskCategory: "Structural" | "Electrical" | "Finishing" | "Inspection"
  location: string
  priorityLevel: "High" | "Medium" | "Low"
  riskLevel: "Low" | "Medium" | "High"
  status: "Not Started" | "In Progress" | "Blocked" | "Completed"
  assignedTeam: string
  progressPercent: number
  slackTime: number
  replanAllowed: boolean
  equipmentNeeded: string
  materialDependencies: string
  costType: "Fixed" | "Variable" | "Labor" | "Material"
  contingencyBuffer: number
  cognitiveTags: string[]
  explainabilityNote: string
  // New fields for enhanced simulation
  materialBatch?: string
  crewRole?: string
  shiftRequirement?: number
  subcontractor?: string
}

export interface SimulationResult {
  reorderedTasks: Task[]
  reasoning: string
  impactAnalysis: string
  criticalPath: string[]
  costImpact: number
  timeImpact: number
  riskMitigation: string[]
  // New fields for enhanced results
  alternativePlans?: AlternativePlan[]
  resourceBottlenecks?: ResourceBottleneck[]
  businessMetrics: BusinessMetrics
}

export interface AlternativePlan {
  id: string
  name: string
  description: string
  tasks: Task[]
  tradeoffs: {
    cost: number
    time: number
    risk: string
  }
  reasoning: string
}

export interface ResourceBottleneck {
  resource: string
  conflictDates: string[]
  affectedTasks: string[]
  suggestion: string
}

export interface BusinessMetrics {
  totalCost: number
  totalDuration: number
  criticalPathCount: number
  highRiskTasksPercent: number
  weatherBlockedTasksPercent: number
  resourceUtilization: number
}

export interface ProjectConstraints {
  projectBudget: number
  absoluteDeadline: string
  availableCrews: number
  heavyEquipmentCount: number
  workingHoursPerDay: number
}

export interface LaborPool {
  id: string
  name: string
  role: string
  dailyAvailability: number
  shiftsPerDay: number
  hoursPerShift: number
  assignedTasks: string[]
}

export interface CustomScenario {
  type: "delay" | "crew_issue" | "delivery_issue" | "equipment_failure"
  name: string
  description: string
  affectedTaskIds: string[]
  delayDuration: number
  cascadingEffect: boolean
  cascadingTasks: number
  partialAvailability: number
  customParameters: Record<string, any>
}

export interface ScenarioType {
  id: string
  name: string
  description: string
}
