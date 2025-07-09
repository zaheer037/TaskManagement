"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import Link from "next/link"
import { Clock, AlertTriangle, ArrowRight } from "lucide-react"

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
}

export default function NotificationsPage() {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUpcomingTasks()
  }, [])

  const fetchUpcomingTasks = async () => {
    try {
      const response = await api.get("/tasks/upcoming")
      const tasks = response.data.tasks || [];
      // Sort tasks by urgency and deadline
      tasks.sort((a: Task, b: Task) => {
        const aUrgency = getUrgencyLevel(a.deadline);
        const bUrgency = getUrgencyLevel(b.deadline);
        const urgencyOrder = { overdue: 0, urgent: 1, upcoming: 2 };
        
        if (urgencyOrder[aUrgency] !== urgencyOrder[bUrgency]) {
          return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
        }
        
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
      
      setUpcomingTasks(tasks)
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error)
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyLevel = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDeadline <= 0) return "overdue"
    if (hoursUntilDeadline <= 24) return "urgent"
    return "upcoming"
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return "bg-red-100 text-red-800"
      case "urgent":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />
      case "urgent":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilDeadline <= 0) {
      const hoursAgo = Math.abs(Math.round(hoursUntilDeadline))
      return `Overdue by ${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'}`
    }
    
    if (hoursUntilDeadline <= 24) {
      const hours = Math.round(hoursUntilDeadline)
      return `Due in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
    }
    
    const days = Math.round(hoursUntilDeadline / 24)
    return `Due in ${days} ${days === 1 ? 'day' : 'days'}`
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Tasks due within 48 hours and overdue tasks</p>
          </div>

          {error ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : upcomingTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No upcoming deadlines</p>
                <p className="text-gray-400">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.map((task) => {
                const urgency = getUrgencyLevel(task.deadline)
                return (
                  <Card key={task._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            <Link href={`/tasks/${task._id}`} className="hover:text-blue-600">
                              {task.title}
                            </Link>
                          </CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <Badge className={getUrgencyColor(urgency)}>
                          <div className="flex items-center space-x-1">
                            {getUrgencyIcon(urgency)}
                            <span className="ml-1">{formatDeadline(task.deadline)}</span>
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Status:</span>
                          <span className="ml-1 capitalize">{task.status}</span>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className="ml-1">{task.category}</span>
                        </div>
                        <div>
                          <span className="font-medium">Project:</span>
                          <span className="ml-1">{task.project}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Assigned to:</span>
                          <span className="ml-1">
                            {task.assignedTo ? `${task.assignedTo.name} (${task.assignedTo.email})` : 'Unassigned'}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tasks/${task._id}`}>
                            View Details <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
