"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AuthCallback() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session?.user) {
      // Get the selected role from localStorage
      const selectedRole = localStorage.getItem("selectedRole")
      const signupFormData = localStorage.getItem("signupFormData")
      
      if (selectedRole && signupFormData) {
        // This is a new user signup - register them in the database
        handleUserRegistration(selectedRole, signupFormData, session.user)
      } else {
        // This is a login attempt - check if user exists
        checkUserAndRedirect(session.user)
      }
    } else {
      // Not authenticated, go back to login
      router.push("/login")
    }
  }, [session, status, router])

  const checkUserAndRedirect = async (user: any) => {
    try {
      // Check if user exists in our database
      const response = await fetch('/api/users/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email })
      })

      const result = await response.json()

      if (result.success && result.exists) {
        // User exists - check if they have a role stored
        const existingRole = localStorage.getItem("userRole")
        const selectedRole = localStorage.getItem("selectedRole")
        
        if (existingRole) {
          // Update user info and redirect to dashboard
          localStorage.setItem("userEmail", user.email || "")
          localStorage.setItem("userName", user.name || "")
          router.push(`/${existingRole}`)
        } else if (selectedRole) {
          // User exists and has a selected role from login - store it and redirect
          localStorage.setItem("userRole", selectedRole)
          localStorage.setItem("userEmail", user.email || "")
          localStorage.setItem("userName", user.name || "")
          localStorage.removeItem("selectedRole")
          router.push(`/${selectedRole}`)
        } else {
          // User exists but no role stored - redirect to login with message
          router.push("/login?message=Please select your role to continue")
        }
      } else {
        // User doesn't exist - redirect to signup with Google info pre-filled
        localStorage.setItem("googleUserInfo", JSON.stringify({
          email: user.email,
          name: user.name
        }))
        router.push("/signup?from=login")
      }
    } catch (error) {
      console.error('Error checking user:', error)
      // On error, redirect to signup to be safe
      localStorage.setItem("googleUserInfo", JSON.stringify({
        email: user.email,
        name: user.name
      }))
      router.push("/signup?from=login")
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
        city: parsedFormData.city,
        zipCode: parsedFormData.zipCode,
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
        router.push("/signup")
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
      router.push("/signup")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Signing you in...</h2>
        <p className="text-slate-600 dark:text-slate-300">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}
