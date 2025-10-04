"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Users, Truck, BarChart3, ArrowLeft, ArrowRight } from "lucide-react"

type UserRole = "donor" | "recipient" | "driver" | "admin"
type SignupStep = "role" | "recipient_type" | "details"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState<SignupStep>("role")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as UserRole,
    recipient_type: "",
    name: "",
    address: "",
    phone: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false)

  // Pre-fill email if redirected from login
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
  }, [searchParams])

  // Handle step parameter from URL (for OAuth redirect)
  useEffect(() => {
    const stepParam = searchParams.get('step')
    if (stepParam === 'details') {
      // Only go to details if we have the required data AND we're in OAuth flow
      const oauthFromStep = localStorage.getItem('oauthFromStep')
      if (oauthFromStep && formData.role && (formData.role !== "recipient" || formData.recipient_type)) {
        setCurrentStep('details')
      } else {
        // If we don't have the required data or aren't in OAuth flow, start from role selection
        setCurrentStep('role')
      }
    }
  }, [searchParams, formData.role, formData.recipient_type])

  // Handle OAuth success - populate form data and move to details step
  useEffect(() => {
    if (session && session.user && currentStep !== "details" && isOAuthInProgress) {
      // Check if we came from OAuth flow (stored in localStorage)
      const oauthFromStep = localStorage.getItem('oauthFromStep')
      
      // Only proceed if we have role and recipient_type (if needed) selected AND we came from OAuth
      if (oauthFromStep && formData.role && (formData.role !== "recipient" || formData.recipient_type)) {
        setFormData(prev => ({
          ...prev,
          email: session.user?.email || "",
          name: session.user?.name || ""
        }))
        
        // Move to details step after OAuth success
        setCurrentStep("details")
        
        // Clear the OAuth flag and reset progress flag
        localStorage.removeItem('oauthFromStep')
        setIsOAuthInProgress(false)
      }
    }
  }, [session, currentStep, formData.role, formData.recipient_type, isOAuthInProgress])

  // Store current step and form data in localStorage to persist across OAuth redirects
  useEffect(() => {
    if (currentStep !== "role") {
      localStorage.setItem('signupStep', currentStep)
    }
    // Save form data (excluding password for security)
    const { password, confirmPassword, ...safeFormData } = formData
    localStorage.setItem('signupFormData', JSON.stringify(safeFormData))
  }, [currentStep, formData])

  // Restore step and form data from localStorage on page load
  useEffect(() => {
    const savedStep = localStorage.getItem('signupStep') as SignupStep
    const savedFormData = localStorage.getItem('signupFormData')
    
    // Only restore saved step if we're not coming from a direct signup page visit
    const stepParam = searchParams.get('step')
    if (!stepParam && savedStep && savedStep !== "role") {
      setCurrentStep(savedStep)
    } else {
      // Always start from role selection for direct visits
      setCurrentStep('role')
    }
    
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Error parsing saved form data:', error)
      }
    }
    
    // Clear any stale OAuth flags on page load
    localStorage.removeItem('oauthFromStep')
    setIsOAuthInProgress(false)
  }, [searchParams])

  const roles = [
    {
      id: "donor" as UserRole,
      title: "Donor",
      description: "Grocery stores & restaurants",
      icon: Store,
    },
    {
      id: "recipient" as UserRole,
      title: "Recipient",
      description: "Food banks & nonprofits",
      icon: Users,
    },
    {
      id: "driver" as UserRole,
      title: "Driver",
      description: "Delivery & logistics",
      icon: Truck,
    },
    {
      id: "admin" as UserRole,
      title: "Admin",
      description: "Platform management",
      icon: BarChart3,
    },
  ]

  const recipientTypes = [
    { id: "student", title: "Student", description: "Individual student or student organization" },
    { id: "shelter", title: "Shelter", description: "Homeless shelter or emergency housing" },
    { id: "food_pantry", title: "Food Pantry", description: "Community food pantry or distribution center" },
    { id: "nonprofit", title: "Nonprofit", description: "Nonprofit organization serving community" },
    { id: "community_center", title: "Community Center", description: "Community center or local organization" },
    { id: "church", title: "Church", description: "Religious organization or church" },
    { id: "other", title: "Other", description: "Other type of recipient organization" }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleRecipientTypeSelect = (recipientType: string) => {
    setFormData(prev => ({ ...prev, recipient_type: recipientType }))
  }

  const handleNextStep = () => {
    setError("")
    
    if (currentStep === "role") {
      if (!formData.role) {
        setError("Please select a role")
        return
      }
      if (formData.role === "recipient") {
        setCurrentStep("recipient_type")
      } else {
        // For non-recipient roles, go directly to OAuth
        handleGoogleOAuth()
      }
    } else if (currentStep === "recipient_type") {
      if (!formData.recipient_type) {
        setError("Please select what type of recipient you are")
        return
      }
      // After selecting recipient type, go to OAuth
      handleGoogleOAuth()
    }
  }

  const handlePrevStep = () => {
    setError("")
    if (currentStep === "recipient_type") {
      setCurrentStep("role")
    } else if (currentStep === "details") {
      // If coming back from details, we need to determine where to go
      if (formData.role === "recipient") {
        setCurrentStep("recipient_type")
      } else {
        setCurrentStep("role")
      }
    }
  }

  const handleGoogleOAuth = async () => {
    try {
      // Store the current step before OAuth to know where to return
      localStorage.setItem('oauthFromStep', currentStep)
      setIsOAuthInProgress(true)
      
      await signIn('google', { 
        callbackUrl: '/signup?step=details',
        redirect: false 
      })
    } catch (error) {
      console.error('OAuth error:', error)
      setError('Failed to authenticate with Google. Please try again.')
      setIsOAuthInProgress(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.email || !formData.password || !formData.role || !formData.name || !formData.address || !formData.phone) {
      setError("Please fill in all required fields")
      return
    }

    // Additional validation for recipients
    if (formData.role === "recipient" && !formData.recipient_type) {
      setError("Please select what type of recipient you are")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      // Map frontend roles to backend roles
      const backendRole = formData.role === "donor" ? "store" : 
                         formData.role === "recipient" ? "shelter" : 
                         formData.role === "driver" ? "student" : "admin"

      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: backendRole,
          recipient_type: formData.role === "recipient" ? formData.recipient_type : undefined,
          name: formData.name,
          address: formData.address,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (data.success) {
        // Clear signup flow data
        localStorage.removeItem('signupStep')
        localStorage.removeItem('signupFormData')
        localStorage.removeItem('oauthFromStep')
        setIsOAuthInProgress(false)
        
        // Store user data in localStorage for frontend demo
        localStorage.setItem("userRole", formData.role)
        localStorage.setItem("userEmail", formData.email)
        localStorage.setItem("userName", data.data.user.name)
        localStorage.setItem("userId", data.data.user.id)
        localStorage.setItem("recipientType", data.data.user.recipient_type || "")

        // Navigate to appropriate dashboard
        const role = roles.find((r) => r.id === formData.role)
        if (role) {
          router.push(`/${formData.role}`)
        }
      } else {
        setError(data.error || "Signup failed")
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError("Network error. Please check if the backend server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "role":
        return renderRoleSelection()
      case "recipient_type":
        return renderRecipientTypeSelection()
      case "details":
        return renderDetailsForm()
      default:
        return renderRoleSelection()
    }
  }

  const renderRoleSelection = () => (
    <div className="w-full max-w-4xl relative z-10">
      <div className="text-center mb-12">
        <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FoodCast</span>
        </Link>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Choose Your Role</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">Select how you'd like to participate in reducing food waste</p>
        {searchParams.get('email') && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>No account found</strong> for this email. Please create an account to continue.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => handleRoleSelect(role.id)}
              className={`group relative p-8 rounded-2xl border-2 transition-all duration-500 text-left hover:shadow-2xl ${
                formData.role === role.id
                  ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm"
                  : "border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white/20 dark:hover:bg-slate-800/20"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                    formData.role === role.id 
                      ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg scale-110" 
                      : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 group-hover:scale-110"
                  }`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-slate-200">{role.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{role.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <Button 
          onClick={handleNextStep}
          disabled={!formData.role}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-3 text-lg font-semibold"
        >
          Continue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )

  const renderRecipientTypeSelection = () => (
    <div className="w-full max-w-4xl relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">What type of recipient are you?</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">Help us understand your organization better</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
        {recipientTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => handleRecipientTypeSelect(type.id)}
            className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
              formData.recipient_type === type.id
                ? "border-green-500 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm"
                : "border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md hover:border-green-300 dark:hover:border-green-600 hover:bg-white/20 dark:hover:bg-slate-800/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  formData.recipient_type === type.id 
                    ? "border-green-500 bg-green-500" 
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {formData.recipient_type === type.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{type.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {formData.recipient_type === "student" && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 text-center">
          <p className="font-semibold">📧 Student Email Required</p>
          <p className="text-sm mt-1">You must use your school email address (ending in .edu) to verify your student status.</p>
        </div>
      )}

      <div className="mt-12 flex justify-center gap-4">
        <Button 
          onClick={handlePrevStep}
          variant="outline"
          className="border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-slate-800/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={handleNextStep}
          disabled={!formData.recipient_type}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-3 text-lg font-semibold"
        >
          Continue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )

  const renderOAuthStep = () => (
    <div className="w-full max-w-2xl relative z-10 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Verify Your Email</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">Sign in with Google to verify your email address</p>
      </div>

      <Card className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Sign in with Google</h3>
              <p className="text-slate-600 dark:text-slate-300">We'll use your Google account to verify your email and get your basic profile information.</p>
            </div>
            
            <Button 
              onClick={handleGoogleOAuth}
              disabled={status === "loading"}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-4 text-lg font-semibold"
            >
              {status === "loading" ? "Connecting..." : "Continue with Google"}
            </Button>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handlePrevStep}
          variant="outline"
          className="border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-slate-800/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    </div>
  )

  const renderDetailsForm = () => (
    <div className="w-full max-w-4xl relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Complete Your Profile</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">Just a few more details to finish setting up your account</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <Card className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">Account Details</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Complete your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">Full Name</Label>
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
                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
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
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">Confirm Password</Label>
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
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={handlePrevStep}
                  variant="outline"
                  className="flex-1 border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-slate-800/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-lg font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">Account Summary</h2>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Role</h3>
              <p className="text-slate-600 dark:text-slate-300">{roles.find((r) => r.id === formData.role)?.title}</p>
            </div>
            {formData.recipient_type && (
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-200/20 dark:border-green-800/20 backdrop-blur-sm">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Recipient Type</h3>
                <p className="text-slate-600 dark:text-slate-300">{recipientTypes.find((t) => t.id === formData.recipient_type)?.title}</p>
              </div>
            )}
            <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200/20 dark:border-purple-800/20 backdrop-blur-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Email Verification</h3>
              <p className="text-slate-600 dark:text-slate-300">✓ Verified via Google OAuth</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {renderStepContent()}
    </div>
  )
}