"use client"

import dynamic from 'next/dynamic'
import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"

interface User {
  _id: string
  name: string
  email: string
}

interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  deadline: string
  category: string
  project: string
  assignedTo: string
}

// Create a client-only date input component
const DateTimeInput = dynamic(
  () => Promise.resolve(({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <Input
      type="datetime-local"
      value={value}
      onChange={onChange}
    />
  )),
  { ssr: false }
)

export default function EditTaskPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    deadline: "",
    category: "",
    project: "",
    assignedTo: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchTask()
      fetchUsers()
    }
  }, [params.id])

  const fetchTask = async () => {
    try {
      const response = await api.get(`/tasks/${params.id}`)
      const task = response.data.task // Updated to use response.data.task

      if (!task) {
        throw new Error('Task not found')
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
        category: task.category || '',
        project: task.project || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
      })
    } catch (error) {
      console.error("Error fetching task:", error)
      router.push("/dashboard")
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users")
      const usersData = response.data.users || response.data; // Handle both formats for backward compatibility
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.put(`/tasks/${params.id}`, formData)
      router.push(`/tasks/${params.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (fetchLoading) {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Enter task description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <DateTimeInput
                      value={formData.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      placeholder="e.g., Development, Design, Marketing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Input
                      id="project"
                      value={formData.project}
                      onChange={(e) => handleChange("project", e.target.value)}
                      placeholder="e.g., Website Redesign, Mobile App"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => handleChange("assignedTo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Task"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push(`/tasks/${params.id}`)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
