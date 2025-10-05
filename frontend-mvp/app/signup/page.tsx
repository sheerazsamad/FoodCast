"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { loadGoogleMaps, initializePlacesAutocomplete, type PlaceDetails } from "@/lib/googleMapsLoader"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import AddressAutocompleteInput from "@/components/ui/AddressAutocompleteInput"
import { Label } from "@/components/ui/label"
import { Store, Users, Truck, BarChart3 } from "lucide-react"

type UserRole = "donor" | "recipient" | "driver" | "admin"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    address: "",
    phone: ""
  })
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const [fromLogin, setFromLogin] = useState(false)
  const [googleUserInfo, setGoogleUserInfo] = useState<{email: string, name: string} | null>(null)

  // Check if user came from login (account doesn't exist)
  useEffect(() => {
    const fromParam = searchParams.get('from')
    if (fromParam === 'login') {
      setFromLogin(true)
      // Get Google user info from localStorage
      const storedGoogleInfo = localStorage.getItem('googleUserInfo')
      if (storedGoogleInfo) {
        try {
          const parsedInfo = JSON.parse(storedGoogleInfo)
          setGoogleUserInfo(parsedInfo)
          // Clear the stored info
          localStorage.removeItem('googleUserInfo')
        } catch (error) {
          console.error('Error parsing Google user info:', error)
        }
      }
    }
  }, [searchParams])

  // Initialize Google Places Autocomplete for address
  useEffect(() => {
    const init = async () => {
      try {
        await loadGoogleMaps()
        if (addressInputRef.current) {
          const ac = initializePlacesAutocomplete(addressInputRef.current, (place) => {
            setPlaceDetails(place)
            setFormData(prev => ({
              ...prev,
              address: place.formatted_address,
            }))
            setAddressError(null)
          })
          if (!ac) setAddressError('Failed to initialize address autocomplete')
        }
      } catch (e) {
        setAddressError('Failed to load map services')
      }
    }
    init()
  }, [])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNextStep = () => {
    if (step === 1 && selectedRole) {
      setStep(2)
    } else if (step === 2 && formData.address && formData.phone) {
      handleGoogleSignIn()
    }
  }

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!selectedRole) return

    setIsLoading(true)

    try {
      // Store all form data in localStorage temporarily
      localStorage.setItem("selectedRole", selectedRole)
      localStorage.setItem("signupFormData", JSON.stringify(formData))
      
      if (fromLogin && googleUserInfo) {
        // User is coming from login and already has Google session
        // Skip OAuth and go directly to registration
        await handleUserRegistration(selectedRole, JSON.stringify(formData), googleUserInfo)
      } else {
        // Normal signup flow - sign in with Google
        await signIn("google", {
          callbackUrl: "/auth/callback",
        })
      }
    } catch (error) {
      console.error("Sign in error:", error)
      alert("Sign in failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleUserRegistration = async (role: string, formData: string, user: any) => {
    try {
      const parsedFormData = JSON.parse(formData)
      
      // Prepare registration data
      const registrationData = {
        email: user.email || "",
        name: user.name || "",
        role: role,
        address: parsedFormData.address,
        city: "",
        zipCode: "",
        phone: parsedFormData.phone
      }

      // Call the registration API
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()

      if (result.success) {
        // Store user data in localStorage for frontend demo
        localStorage.setItem("userRole", role)
        localStorage.setItem("userEmail", user.email || "")
        localStorage.setItem("userName", user.name || "")
        localStorage.setItem("userId", result.data.user.id)
        
        // Clean up temporary data
        localStorage.removeItem("selectedRole")
        localStorage.removeItem("signupFormData")
        
        // Redirect to the appropriate dashboard
        router.push(`/${role}`)
      } else {
        console.error('Registration failed:', result.error)
        alert('Registration failed. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
      setIsLoading(false)
    }
  }

  const isStep1Valid = selectedRole !== null
  const isStep2Valid = formData.address && formData.phone

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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            {fromLogin ? "Complete Your Registration" : "Join FoodCast"}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            {fromLogin ? (
              <>
                Account not found for <span className="font-semibold text-blue-600 dark:text-blue-400">{googleUserInfo?.email}</span>.
                <br />Please complete your registration below.
              </>
            ) : (
              step === 1 ? "Choose your role to get started" : "Complete your profile information"
            )}
          </p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-8 mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= stepNumber 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 2 && (
                    <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                      step > stepNumber 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600" 
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Role Selection */
          <div className="grid md:grid-cols-2 gap-12">
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      You've selected{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">{roles.find((r) => r.id === selectedRole)?.title}</span>.
                      Click continue to provide your contact information.
                    </p>
                  </div>
                  <Button 
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-lg font-semibold"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">What's Next?</h2>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-200/20 dark:border-green-800/20 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Select Your Role</h3>
                      <p className="text-slate-600 dark:text-slate-300">Choose how you'll participate in reducing food waste</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Complete Profile</h3>
                      <p className="text-slate-600 dark:text-slate-300">Provide your contact information and address</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200/20 dark:border-purple-800/20 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Sign in with Google</h3>
                      <p className="text-slate-600 dark:text-slate-300">Secure authentication with your Google account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Contact Information */
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">Contact Information</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  We need your address and phone number to complete your registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">Street Address</Label>
                    <AddressAutocompleteInput
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(v) => setFormData(prev => ({...prev, address: v}))}
                      onPlaceSelected={(place) => setPlaceDetails(place)}
                    />
                    {addressError && (
                      <p className="text-sm text-red-500">{addressError}</p>
                    )}
                    {placeDetails && (
                      <p className="text-sm text-green-600">✓ Address verified: {placeDetails.formatted_address}</p>
                    )}
                  </div>

                {/* City and ZIP removed; populated via selected address if needed later */}

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-medium">Phone Number</Label>
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

                  <div className="flex gap-4">
                    <Button 
                      onClick={handlePrevStep}
                      variant="outline"
                      className="flex-1 border-white/30 dark:border-slate-600/30 text-slate-600 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-800/10"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      disabled={!isStep2Valid || isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-lg font-semibold"
                    >
                      {isLoading ? "Signing in..." : "Continue with Google"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">Account Summary</h2>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Role</h3>
                  <p className="text-slate-600 dark:text-slate-300">{roles.find((r) => r.id === selectedRole)?.title}</p>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-200/20 dark:border-green-800/20 backdrop-blur-sm">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Contact Info</h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><strong>Address:</strong> {formData.address || "Not provided"}</p>
                    <p><strong>Phone:</strong> {formData.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200/20 dark:border-purple-800/20 backdrop-blur-sm">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Next Step</h3>
                  <p className="text-slate-600 dark:text-slate-300">✓ Sign in with Google to verify your email and complete registration</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}