"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, Users, Truck, BarChart3, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import type { UserRole } from "@/lib/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
  userName: string
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const roleConfig = {
    donor: { icon: Store, title: "Donor Portal", color: "text-primary" },
    recipient: { icon: Users, title: "Recipient Portal", color: "text-accent" },
    driver: { icon: Truck, title: "Driver Portal", color: "text-primary" },
    admin: { icon: BarChart3, title: "Admin Portal", color: "text-accent" },
  }

  const config = roleConfig[role]
  const Icon = config.icon

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <header className="relative border-b border-white/20 backdrop-blur-md bg-white/10 dark:bg-slate-900/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">FoodCast</span>
            </Link>
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/20 dark:border-slate-700/20">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color === 'text-primary' ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{config.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{userName}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 capitalize font-medium">{role}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white/20 dark:bg-slate-800/20 border-white/30 dark:border-slate-700/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300 hover:scale-105">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden bg-white/20 dark:bg-slate-800/20 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color === 'text-primary' ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{config.title}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{userName}</div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
