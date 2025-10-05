"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Users, Truck, BarChart3 } from "lucide-react"

type UserRole = "donor" | "recipient" | "driver" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Check for messages from URL params
  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam) {
      setMessage(messageParam)
    }
  }, [searchParams])

  const roles = [
    {
      id: "donor" as UserRole,
      title: "Donor",
      description: "Grocery stores & restaurants",
      icon: Store,
      route: "/donor",
    },
    {
      id: "recipient" as UserRole,
      title: "Recipient",
      description: "Food banks & nonprofits",
      icon: Users,
      route: "/recipient",
    },
    {
      id: "driver" as UserRole,
      title: "Driver",
      description: "Delivery & logistics",
      icon: Truck,
      route: "/driver",
    },
    {
      id: "admin" as UserRole,
      title: "Admin",
      description: "Platform management",
      icon: BarChart3,
      route: "/admin",
    },
  ]

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
  }

  const handleGoogleSignIn = async () => {
    if (!selectedRole) return

    setIsGoogleLoading(true)

    try {
      // Store the selected role in localStorage temporarily
      localStorage.setItem("selectedRole", selectedRole)
      
      // Sign in with Google - this will redirect to Google OAuth
      await signIn("google", {
        callbackUrl: "/auth/callback",
      })
    } catch (error) {
      console.error("Google sign in error:", error)
      alert("Google sign in failed. Please try again.")
      setIsGoogleLoading(false)
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
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FoodCast</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Welcome back</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">Select your role and sign in with Google</p>
          
          {message && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">{message}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
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
                    onClick={() => handleRoleSelect(role.id)}
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    You've selected{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{roles.find((r) => r.id === selectedRole)?.title}</span>.
                    Click "Sign in with Google" to continue.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Google Sign In */}
          <Card className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">Sign In with Google</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                {selectedRole 
                  ? `Continue as a ${roles.find((r) => r.id === selectedRole)?.title.toLowerCase()}`
                  : "Select a role first to continue"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedRole ? (
                  <>
                    <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-200/20 dark:border-green-800/20 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                          {(() => {
                            const role = roles.find((r) => r.id === selectedRole)
                            const Icon = role?.icon
                            return Icon ? <Icon className="h-6 w-6 text-white" /> : null
                          })()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                            {roles.find((r) => r.id === selectedRole)?.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300">
                            {roles.find((r) => r.id === selectedRole)?.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 py-4 text-lg font-semibold flex items-center justify-center gap-3"
                    >
                      {isGoogleLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Sign in with Google
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      Please select a role to continue with Google sign in
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 dark:border-slate-700/20">
                <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
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