"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import Link from "next/link"
import { FolderOpen } from "lucide-react"

interface Task {
  _id: string
  title: string
  status: "pending" | "in-progress" | "completed"
  deadline: string
  assignedTo: {
    name: string
  }
}

interface ProjectGroup {
  project: string
  tasks: Task[]
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const response = await api.get("/tasks/projects")
      setProjects(response.data.projects)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
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

  if (user?.role !== "admin") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">Access Denied</p>
                <p className="text-gray-400">Only administrators can view this page.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Projects Overview</h1>
            <p className="text-gray-600">Tasks grouped by project</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No projects found</p>
                <p className="text-gray-400">Create some tasks to see projects here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.project} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center">
                        <FolderOpen className="w-5 h-5 mr-2" />
                        {project.project || "Unassigned"}
                      </CardTitle>
                      <Badge variant="outline">{project.totalTasks} tasks</Badge>
                    </div>
                    <CardDescription>
                      {project.completedTasks} completed • {project.inProgressTasks} in progress •{" "}
                      {project.pendingTasks} pending
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((project.completedTasks / project.totalTasks) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(project.completedTasks / project.totalTasks) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Recent Tasks</h4>
                      <div className="space-y-2">
                        {project.tasks.slice(0, 3).map((task) => (
                          <div key={task._id} className="flex items-center justify-between text-sm">
                            <Link href={`/tasks/${task._id}`} className="flex-1 hover:text-blue-600 truncate">
                              {task.title}
                            </Link>
                            <div className="flex items-center space-x-2 ml-2">
                              <Badge className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {project.tasks.length > 3 && (
                          <p className="text-xs text-gray-500">+{project.tasks.length - 3} more tasks</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
