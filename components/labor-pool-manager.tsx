"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import type { LaborPool, Task } from "@/types/task"
import { useState } from "react"

interface LaborPoolManagerProps {
  laborPool: LaborPool[]
  onLaborPoolChange: (lp: LaborPool[]) => void
  tasks: Task[]
}

export function LaborPoolManager({ laborPool, onLaborPoolChange }: LaborPoolManagerProps) {
  const [newCrew, setNewCrew] = useState<LaborPool>({
    id: "",
    name: "",
    role: "",
    dailyAvailability: 8,
    shiftsPerDay: 1,
    hoursPerShift: 8,
    assignedTasks: [],
  })

  const addCrew = () => {
    if (!newCrew.name) return
    onLaborPoolChange([...laborPool, { ...newCrew, id: Date.now().toString() }])
    setNewCrew({ ...newCrew, name: "", role: "" })
  }

  const removeCrew = (id: string) => onLaborPoolChange(laborPool.filter((c) => c.id !== id))

  return (
    <Card className="rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">👷 Resource & Labor Pool</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Crew */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Crew / Team Name"
            value={newCrew.name}
            onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
            className="rounded-xl"
          />
          <Input
            placeholder="Role (e.g., Electrician)"
            value={newCrew.role}
            onChange={(e) => setNewCrew({ ...newCrew, role: e.target.value })}
            className="rounded-xl"
          />
          <Button onClick={addCrew} className="rounded-xl flex gap-2">
            <Plus className="w-4 h-4" /> Add Crew
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          {laborPool.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No crews defined yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Daily Avail. (h)</TableHead>
                  <TableHead>Shifts</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laborPool.map((crew) => (
                  <TableRow key={crew.id}>
                    <TableCell>{crew.name}</TableCell>
                    <TableCell>{crew.role}</TableCell>
                    <TableCell>{crew.dailyAvailability}</TableCell>
                    <TableCell>{crew.shiftsPerDay}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCrew(crew.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
