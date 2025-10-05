"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { ArrowRight, TrendingUp, Users, Truck, BarChart3, Leaf, CheckCircle, Star, ArrowLeft, Store, Heart, Zap, Target } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function ModernLandingPage() {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const { analytics, loading: analyticsLoading } = useAnalytics()

  const toggleCardFlip = (roleId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roleId)) {
        newSet.delete(roleId)
      } else {
        newSet.add(roleId)
      }
      return newSet
    })
  }

  // Enhanced data structure with detailed descriptions for FoodCast platform
  const roles = [
    {
      id: 'donor',
      title: 'Donor',
      subtitle: 'Grocery Stores & Restaurants',
      icon: Store,
      color: 'cyan',
      description: 'Predict and confirm surplus food donations',
      detailedDescription: 'FoodCast\'s AI-powered prediction system helps grocery stores and restaurants forecast surplus food before it goes to waste. Donors can easily confirm predictions, set pickup times, and track their impact on reducing food waste in their community.',
      features: [
        'AI-powered surplus prediction',
        'One-click donation confirmation',
        'Real-time impact tracking',
        'Automated pickup scheduling',
        'Waste reduction analytics'
      ],
      benefits: [
        'Reduce food waste costs',
        'Improve sustainability metrics',
        'Support local communities',
        'Tax deduction opportunities',
        'Enhanced brand reputation'
      ]
    },
    {
      id: 'recipient',
      title: 'Recipient',
      subtitle: 'Students & Shelters',
      icon: Users,
      color: 'purple',
      description: 'Browse and claim available food items',
      detailedDescription: 'Food banks, shelters, and community organizations can easily browse available food donations, filter by preferences, and claim items that meet their needs. The platform provides real-time updates on availability and delivery options.',
      features: [
        'Real-time food availability',
        'Advanced filtering options',
        'Delivery and pickup options',
        'Nutritional information',
        'Community connections'
      ],
      benefits: [
        'Access to fresh, nutritious food',
        'Reduced food costs',
        'Community support network',
        'Flexible pickup/delivery',
        'Nutritional guidance'
      ]
    },
    {
      id: 'driver',
      title: 'Driver',
      subtitle: 'Volunteer Delivery',
      icon: Truck,
      color: 'emerald',
      description: 'Pickup and deliver food donations',
      detailedDescription: 'Volunteer drivers play a crucial role in connecting donors with recipients. The platform provides optimized routes, real-time tracking, and easy communication tools to make deliveries efficient and rewarding.',
      features: [
        'Optimized delivery routes',
        'Real-time navigation',
        'Delivery confirmation',
        'Flexible scheduling',
        'Impact tracking'
      ],
      benefits: [
        'Make a direct community impact',
        'Flexible volunteer hours',
        'Meet like-minded volunteers',
        'Gain logistics experience',
        'Tax-deductible mileage'
      ]
    },
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'Platform Management',
      icon: BarChart3,
      color: 'yellow',
      description: 'Monitor and manage platform operations',
      detailedDescription: 'Platform administrators have access to comprehensive analytics, user management tools, and system monitoring capabilities to ensure smooth operations and continuous improvement of the food redistribution network.',
      features: [
        'Real-time analytics dashboard',
        'User management tools',
        'System monitoring',
        'Impact reporting',
        'Community insights'
      ],
      benefits: [
        'Data-driven decision making',
        'Efficient platform management',
        'Community impact visibility',
        'System optimization',
        'Strategic planning support'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative w-full h-full">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0">
        {/* Static gradient elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-500/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-500/30 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-orange-500/30 rounded-full blur-xl animate-pulse delay-3000"></div>
        
        {/* Additional scattered gradients */}
        <div className="absolute top-1/3 left-1/6 w-36 h-36 bg-gradient-to-br from-cyan-300/15 to-blue-400/25 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-2/3 right-1/6 w-44 h-44 bg-gradient-to-br from-purple-300/15 to-pink-400/25 rounded-full blur-2xl animate-pulse delay-1500"></div>
        <div className="absolute top-1/6 right-1/3 w-32 h-32 bg-gradient-to-br from-emerald-300/15 to-teal-400/25 rounded-full blur-2xl animate-pulse delay-2500"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-yellow-300/15 to-orange-400/25 rounded-full blur-2xl animate-pulse delay-3500"></div>
        
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-white/10 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation Header */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
            </div>
              <div>
                <h1 className="text-xl font-bold text-white">FoodCast</h1>
                <p className="text-xs text-white/60">Forecast. Recover. Nourish.</p>
        </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="bg-white text-black hover:bg-gray-100 shadow-lg px-6 py-2 rounded-md transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg px-6 py-2 rounded-md transition-colors">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section - Diagonal Layout */}
      <section className="relative min-h-screen flex items-center z-10">
        <div className="container mx-auto px-6 py-20 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 backdrop-blur-sm">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-cyan-300">Live Platform</span>
                <span className="text-sm text-white/70">
                  • {analytics ? `${analytics.totalMealsRescued.toLocaleString()}+ Meals Rescued` : 'Loading...'}
                </span>
              </div>
              
              <h1 className="text-7xl md:text-8xl font-black leading-none">
                <span className="block text-white">Forecast.</span>
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Recover.
                </span>
                <span className="block text-white">Nourish.</span>
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed max-w-lg">
                Transform food waste into community nourishment with <span className="font-semibold text-cyan-300">AI-powered predictions</span> and seamless redistribution.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-2xl px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all duration-300 rounded-md">
                    Start Your Journey <ArrowRight className="ml-2 h-5 w-5 inline" />
                  </button>
              </Link>
            </div>
          </div>

            {/* Right Side - Interactive Cards */}
            <div className="relative overflow-visible">
              <div className="grid grid-cols-2 gap-6 overflow-visible">
                {roles.map((role) => {
                  const IconComponent = role.icon
                  const isFlipped = flippedCards.has(role.id)
                  
                  return (
                    <div
                      key={role.id}
                      className={`relative cursor-pointer transition-all duration-500 hover:scale-105 ${
                        role.id === 'recipient' || role.id === 'admin' ? 'mt-8' : ''
                      }`}
                      style={{ perspective: '1000px' }}
                    >
                      <div
                        className={`relative w-full h-48 transition-transform duration-700 transform-style-preserve-3d overflow-visible ${
                          isFlipped ? 'rotate-y-180' : ''
                        }`}
                        onClick={() => toggleCardFlip(role.id)}
                      >
                        {/* Front of Card */}
                        <div className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-500 ${
                          role.color === 'cyan' ? 'border-white/20 hover:border-cyan-400/50' :
                          role.color === 'purple' ? 'border-white/20 hover:border-purple-400/50' :
                          role.color === 'emerald' ? 'border-white/20 hover:border-emerald-400/50' :
                          'border-white/20 hover:border-yellow-400/50'
                        } group`}>
                          <div className={`w-12 h-12 bg-gradient-to-br ${
                            role.color === 'cyan' ? 'from-cyan-400 to-blue-500' :
                            role.color === 'purple' ? 'from-purple-400 to-pink-500' :
                            role.color === 'emerald' ? 'from-emerald-400 to-teal-500' :
                            'from-yellow-400 to-orange-500'
                          } rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">{role.title}</h3>
                          <p className="text-sm text-white/70">{role.subtitle}</p>
                          <p className="text-xs text-white/60 mt-2">{role.description}</p>
                        </div>

                        {/* Back of Card */}
                        <div className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border rotate-y-180 transition-all duration-500 ${
                          role.color === 'cyan' ? 'border-cyan-400/50' :
                          role.color === 'purple' ? 'border-purple-400/50' :
                          role.color === 'emerald' ? 'border-emerald-400/50' :
                          'border-yellow-400/50'
                        } overflow-y-auto`}>
                          <div className="h-full flex flex-col">
                            <div className={`w-12 h-12 bg-gradient-to-br ${
                              role.color === 'cyan' ? 'from-cyan-400 to-blue-500' :
                              role.color === 'purple' ? 'from-purple-400 to-pink-500' :
                              role.color === 'emerald' ? 'from-emerald-400 to-teal-500' :
                              'from-yellow-400 to-orange-500'
                            } rounded-2xl flex items-center justify-center mb-4`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{role.title}</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-4">{role.detailedDescription}</p>
                            
                            <div className="space-y-3 flex-1">
                              <div>
                                <h4 className="font-semibold text-white mb-2 text-sm">Key Features:</h4>
                                <ul className="space-y-1">
                                  {role.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-white/70">
                                      <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
              </div>
                              
                              <div>
                                <h4 className="font-semibold text-white mb-2 text-sm">Benefits:</h4>
                                <ul className="space-y-1">
                                  {role.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-white/70">
                                      <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                                      {benefit}
                                    </li>
                                  ))}
                                </ul>
            </div>
          </div>

                            <div className="mt-4 pt-4 border-t border-white/20">
                              <div className="flex items-center justify-center gap-2 text-xs text-white/50">
                                <ArrowLeft className="h-3 w-3" />
                                <span>Click to flip back</span>
                              </div>
                            </div>
                          </div>
              </div>
            </div>
          </div>
                  )
                })}
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-bounce"></div>
              <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-xl animate-bounce delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm mb-8">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-300">Simple Process</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-white mb-8">
              How It Works
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Four simple steps from AI prediction to food delivery
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
              <div className="flex-1">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">1</div>
                      <h3 className="text-2xl font-bold text-white">Predict</h3>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    AI analyzes sales data and inventory to predict surplus food with 89% accuracy.
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-cyan-400/20 to-blue-500/30 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-white/70">AI Prediction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-24">
              <div className="flex-1">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">2</div>
                      <h3 className="text-2xl font-bold text-white">Confirm</h3>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Donors confirm actual surplus and make it available for claiming.
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-purple-400/20 to-pink-500/30 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-white/70">Confirm Surplus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
              <div className="flex-1">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">3</div>
                      <h3 className="text-2xl font-bold text-white">Claim</h3>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Food banks browse and claim donations that match their community needs.
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-emerald-400/20 to-teal-500/30 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-white/70">Smart Matching</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                      <Truck className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">4</div>
                      <h3 className="text-2xl font-bold text-white">Nourish</h3>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Drivers pick up and deliver food efficiently with optimized routing.
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-yellow-400/20 to-orange-500/30 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-white/70">Optimized Delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="relative py-32 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
              Our Impact
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Real numbers from our community of food waste warriors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Meals Rescued Card */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <div className="text-6xl font-black text-white mb-2">
                  {analytics ? `${analytics.totalMealsRescued.toLocaleString()}` : 'Loading...'}
                </div>
                <div className="text-lg font-semibold text-white mb-1">Meals Rescued</div>
                <div className="text-sm text-white/70">From going to waste</div>
              </div>
            </div>

            {/* Community Members Card */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-6xl font-black text-white mb-2">
                  {analytics ? `${(analytics.activeDonors + analytics.activeRecipients).toLocaleString()}+` : 'Loading...'}
                </div>
                <div className="text-lg font-semibold text-white mb-1">Community Members</div>
                <div className="text-sm text-white/70">Active participants</div>
              </div>
            </div>

            {/* Food Saved Card */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-emerald-400/50 transition-all duration-500 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-6xl font-black text-white mb-2">
                  {analytics ? `${analytics.totalWeight.toLocaleString()}` : 'Loading...'}
                </div>
                <div className="text-lg font-semibold text-white mb-1">lbs Food Saved</div>
                <div className="text-sm text-white/70">From waste</div>
              </div>
            </div>
          </div>

          {/* Additional Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            {/* CO2 Saved */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics ? `${analytics.co2Saved} kg` : 'Loading...'}
                </div>
                <div className="text-sm font-medium text-white/80 mb-1">CO2 Saved</div>
                <div className="text-xs text-white/60">Environmental impact</div>
              </div>
            </div>

            {/* Value Saved */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics ? `$${analytics.totalValueSaved.toLocaleString()}` : 'Loading...'}
                </div>
                <div className="text-sm font-medium text-white/80 mb-1">Value Saved</div>
                <div className="text-xs text-white/60">Economic impact</div>
              </div>
            </div>

            {/* Active Donors */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics ? `${analytics.activeDonors}` : 'Loading...'}
                </div>
                <div className="text-sm font-medium text-white/80 mb-1">Active Donors</div>
                <div className="text-xs text-white/60">Businesses participating</div>
              </div>
            </div>

            {/* Pending Offers */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics ? `${analytics.pendingOffers}` : 'Loading...'}
                </div>
                <div className="text-sm font-medium text-white/80 mb-1">Live Offers</div>
                <div className="text-xs text-white/60">Available now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-16 border border-white/20">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
                Ready to Reduce Food Waste?
              </h2>
              <p className="text-xl text-white/80 mb-12 leading-relaxed">
                Join hundreds of organizations already using FoodCast to rescue surplus food and feed communities
            </p>
            
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/login">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-2xl px-12 py-6 text-xl font-bold transform hover:scale-105 transition-all duration-300 rounded-md">
                    Start Your Journey <ArrowRight className="ml-3 h-6 w-6 inline" />
                  </button>
              </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-white/10 z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-8 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">FoodCast</h3>
                <p className="text-sm text-white/60">AI-Powered Food Recovery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</a>
              <a href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60">
              Made with ❤️ for a sustainable future
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}