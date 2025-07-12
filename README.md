# Actor

ACTOR simulates and optimizes construction site task planning using AI reasoning and dynamic scenario simulations.
 Core Features
🚧 1. Task Management UI
Implement a Gantt-style construction task planner with the ability to:
Create/edit/delete tasks via a form with the following fields:


Task Name (text)


Duration (days)


Dependency (dropdown of tasks)


Cost Estimate (number)


Resource Required (text)


Weather Sensitive (checkbox)


Start Date / Deadline (date pickers)


Task Category (Structural, Electrical, Finishing, Inspection)


Location/Zone (text input)


Priority Level (High, Medium, Low)


Risk Level (Low, Medium, High)


Status (Not Started, In Progress, Blocked, Completed)


Assigned Team/Subcontractor (text)


Progress % Complete (slider)


Slack/Float Time (days)


Replan Allowed (checkbox)


Equipment Needed / Material Dependencies (text)


Cost Type (Fixed, Variable, Labor, Material)


Contingency Buffer (%) (number)


Cognitive Tags (multi-select: safety-critical, deadline-driven, weather-blocked)


Explainability Note (textarea)


Render Gantt Timeline and Editable Table using Plotly.
🌀 2. Scenario Simulation Panel
Allow users to simulate disruptions via:
Predefined scenarios: Weather Delay, Crew Unavailable, Material Delay, Equipment Breakdown


Select affected task(s)


Input delay duration


Click “Simulate Impact & Replan”


🧠 3. AI Reasoning Panel ("Gemini AI Reasoning")
Show AI-generated explanation of new plan


Toggle between pre/post-replan views


Display adjusted Gantt or reordered task list


Add “Why this order?” button on each task to send micro-prompt to Gemini explaining its scheduling logic


📊 4. Visualizations
Use Plotly or Chart.js to show:


Original vs. Replanned Gantt


Critical path highlights


Delayed, high-risk, and weather-blocked tasks in different colors


Progress % overlays


Business Metrics before/after (see below)


📦 5. Sample Dataset + Import/Export
“Generate Sample Plan” button loads 10–20 realistic tasks:


Foundation Pour, Rebar Setup, Framing, Electrical Rough-in, Final Inspection, etc.


Add support for CSV/JSON import/export


🔁 6. Backend API (FastAPI)
Create a POST /api/simulate route that:
Accepts: Task list, scenario, affected task(s), delay days, and simulation constraints


Dynamically constructs prompt in this format:



You are a cognitive AI project planner.

Here is the list of tasks, each with attributes like duration, cost, dependencies, weather sensitivity, resource needs, priority level, risk level, and location zone.

A new event has occurred: {scenario} affecting task(s) {task_name}. The delay is {X} days.

Please:
1. Propose a new optimized task plan.
2. Explain the reasoning behind task reordering or delays.
3. Highlight tasks impacted, new critical path, and mitigation strategies.

Output:
- Updated task sequence
- Reasoning (in business terms)
- Risk implications or cost impacts

Calls Gemini API via @google/generative-ai or REST


Handles errors, vague output, or empty responses with fallback logic


Returns: new task list, explanation string, updated dates/costs/risks


Logs each prompt + response for review (local storage/temp file)


🛠️ 7. Global Simulation Constraints Panel
Allow user to configure global limits:
Project Budget (number)


Absolute Deadline (date)


Available Crews (number)


Cranes/Heavy Equipment Count (optional)


Include in prompt to Gemini for realistic planning


👷 8. Labor & Resource Pool Module
Define:


Crew Names & Roles


Daily Shift Availability


Assigned subcontractors per task


Visualize labor/equipment allocation heatmap across time


Let Gemini detect and resolve bottlenecks


🧩 9. AI Plan Options + Cognitive Enhancements
Let Gemini return 2–3 plan variations optimizing for different tradeoffs (e.g., cost vs. risk)


Show diff view between baseline vs. AI options


Let user apply preferred sequence


Enable per-task “Explain Scheduling” button for micro-reasoning


📈 10. Business Impact Metrics
Show pre/post simulation:
Total Cost


Total Project Duration


% High-Risk Tasks


% Weather-Blocked Tasks


Critical Path Tasks


Visual change overlays


🌩️ 11. Advanced Scenario Builder
Replace dropdown with full custom scenario builder:


Delay type


Affected task(s)


Delay duration


Cascading effect toggle


Partial resource availability (%)


Send enriched params to Gemini


Visualize cascading effects on Gantt


🧱 Tech
Frontend: React + TypeScript + Tailwind CSS


Use modular component structure, hooks, local state/localStorage


Responsive UI, clean + minimal design with cards, soft shadows, and gradients


Backend: FastAPI (Python)


Use Gemini for AI logic


Visualization: Plotly.js


For Gantt charts, progress overlays, heatmaps, and diff comparisons


Storage: Local state or localStorage only


App is single-user, in-browser
