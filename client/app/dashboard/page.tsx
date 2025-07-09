"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import Link from "next/link"
import { Edit, Trash2, Eye, Plus } from "lucide-react"

interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  deadline: string
  category: string
  project: string
  assignedTo: string | { name: string; email: string }
  createdAt: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "all", // Updated default value to 'all'
    category: "",
    project: "",
    sortBy: "createdAt",
  })

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status !== "all") params.append("status", filters.status) // Updated condition to exclude 'all'
      if (filters.category) params.append("category", filters.category)
      if (filters.project) params.append("project", filters.project)
      params.append("sortBy", filters.sortBy)

      const response = await api.get(`/tasks?${params.toString()}`)
      const tasksData = response.data.tasks ?? response.data // handle both array and object
      console.log("Fetched tasks:", tasksData)
      
      setTasks(tasksData)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`)
        setTasks(tasks.filter((task) => task._id !== taskId))
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">{user?.role === "admin" ? "All tasks in the system" : "Your tasks"}</p>
            </div>
            <Link href="/tasks/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters & Sorting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem> {/* Updated value to 'all' */}
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Filter by category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                />

                <Input
                  placeholder="Filter by project"
                  value={filters.project}
                  onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                />

                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(tasks ?? []).map((task) => (
                <Card key={task._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Category:</strong> {task.category}
                      </p>
                      <p>
                        <strong>Project:</strong> {task.project}
                      </p>
                      <p>
                        <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Assigned to:</strong>{" "}
                        {typeof task.assignedTo === "object" && task.assignedTo !== null
                          ? `${task.assignedTo.name} (${task.assignedTo.email})`
                          : task.assignedTo}
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/${task._id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/${task._id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTask(task._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && (tasks ?? []).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tasks found</p>
              <Link href="/tasks/create">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first task
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
