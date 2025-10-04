"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Users, Truck, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UserRole = "store" | "student" | "shelter" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roles = [
    {
      id: "store" as UserRole,
      title: "Store",
      description: "Grocery stores & restaurants",
      icon: Store,
      route: "/donor",
    },
    {
      id: "shelter" as UserRole,
      title: "Shelter",
      description: "Food banks & nonprofits",
      icon: Users,
      route: "/recipient",
    },
    {
      id: "student" as UserRole,
      title: "Student",
      description: "Individual recipients",
      icon: Users,
      route: "/recipient",
    },
    {
      id: "admin" as UserRole,
      title: "Admin",
      description: "Platform management",
      icon: BarChart3,
      route: "/admin",
    },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      setError("Please select a role")
      return
    }

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await login({ email, password })
      
      if (result.success) {
        // Navigate to appropriate dashboard
        const role = roles.find((r) => r.id === selectedRole)
        if (role) {
          router.push(role.route)
        }
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FoodCast</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Welcome back</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">Sign in to your account and select your role</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Login Form */}
          <Card className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">Sign In</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/30 dark:border-slate-600/30 bg-white/20 dark:bg-slate-700/20" />
                    <span className="text-slate-600 dark:text-slate-300">Remember me</span>
                  </label>
                  <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-lg font-semibold" disabled={!selectedRole || isSubmitting || isLoading}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">
                    Sign up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Role Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">Select Your Role</h2>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-500 text-left hover:shadow-2xl ${
                      selectedRole === role.id
                        ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm"
                        : "border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white/20 dark:hover:bg-slate-800/20"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                          selectedRole === role.id 
                            ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg scale-110" 
                            : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 group-hover:scale-110"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">{role.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{role.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedRole && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    You've selected{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{roles.find((r) => r.id === selectedRole)?.title}</span>.
                    Sign in to continue to your dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
