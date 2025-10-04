"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Store, Users, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type UserRole = "store" | "student" | "shelter"

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    address: "",
    zipCode: "",
  })
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roles = [
    {
      id: "store" as UserRole,
      title: "Store",
      description: "Grocery stores & restaurants",
      icon: Store,
    },
    {
      id: "shelter" as UserRole,
      title: "Shelter",
      description: "Food banks & nonprofits",
      icon: Users,
    },
    {
      id: "student" as UserRole,
      title: "Student",
      description: "Individual recipients",
      icon: User,
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRole) {
      setError("Please select a role")
      return
    }

    if (!formData.email || !formData.password || !formData.name) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        userType: selectedRole,
        profileData: {
          name: formData.name,
          contact_email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          zip_code: formData.zipCode ? parseInt(formData.zipCode) : undefined,
        }
      })
      
      if (result.success) {
        // Navigate to appropriate dashboard based on role
        if (selectedRole === "store") {
          router.push("/donor")
        } else {
          router.push("/recipient")
        }
      } else {
        setError(result.error || "Signup failed")
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
      
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FoodCast</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Join FoodCast</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">Create your account and help reduce food waste</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Signup Form */}
          <Card className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">Create Account</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">Fill in your details to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-medium">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main St, City, State"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-slate-700 dark:text-slate-300 font-medium">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      placeholder="12345"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-lg font-semibold" 
                  disabled={!selectedRole || isSubmitting || isLoading}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Role Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">Select Your Role</h2>
            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-500 text-left hover:shadow-2xl w-full ${
                      selectedRole === role.id
                        ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm"
                        : "border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white/20 dark:hover:bg-slate-800/20"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedRole === role.id 
                            ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg scale-110" 
                            : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 group-hover:scale-110"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{role.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{role.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedRole && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    You've selected{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{roles.find((r) => r.id === selectedRole)?.title}</span>.
                    Complete the form to create your account.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
