"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function SignOutButton() {
  const handleSignOut = async () => {
    // Clear localStorage
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("selectedRole")
    
    // Sign out from NextAuth
    await signOut({ callbackUrl: "/" })
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  )
}
