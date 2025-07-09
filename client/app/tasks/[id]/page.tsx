"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import Link from "next/link"
import { Edit, Trash2, ArrowLeft } from "lucide-react"

interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  deadline: string
  category: string
  project: string
  assignedTo: {
    _id: string
    name: string
    email: string
  }
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTask()
    }
  }, [params.id])

  const fetchTask = async () => {
    try {
      const response = await api.get(`/tasks/${params.id}`)
      setTask(response.data.task) // Updated to use response.data.task
    } catch (error) {
      console.error("Error fetching task:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${params.id}`)
        router.push("/dashboard")
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!task) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500">Task not found</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/tasks/${task._id}/edit`}>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={deleteTask} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{task.description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Task Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 text-gray-700">{task.category || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="font-medium">Project:</span>
                      <span className="ml-2 text-gray-700">{task.project || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span>
                      <span className="ml-2 text-gray-700">
                        {task.deadline ? new Date(task.deadline).toLocaleString() : "Not set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">People</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Assigned to:</span>
                      <span className="ml-2 text-gray-700">
                        {task.assignedTo ? `${task.assignedTo.name} (${task.assignedTo.email})` : "Unassigned"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Created by:</span>
                      <span className="ml-2 text-gray-700">
                        {task.createdBy.name} ({task.createdBy.email})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2 text-gray-700">{new Date(task.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Last updated:</span>
                    <span className="ml-2 text-gray-700">{new Date(task.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
