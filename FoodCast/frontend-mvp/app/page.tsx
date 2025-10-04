import Link from "next/link"
import { ArrowRight, TrendingUp, Users, Truck, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Header */}
      <header className="relative border-b border-white/20 backdrop-blur-md bg-white/10 dark:bg-slate-900/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FoodCast</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link href="#impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Impact
            </Link>
          </nav>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-xl animate-bounce delay-300"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-green-400/30 to-blue-500/30 rounded-full blur-xl animate-bounce delay-700"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-xl animate-bounce delay-1000"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Live Platform • 2.5M+ Meals Rescued</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-balance leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Predict, recover, and deliver
              </span>
              <br />
              <span className="text-slate-800 dark:text-slate-200">
                surplus food before it goes to waste
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 text-pretty leading-relaxed max-w-3xl mx-auto">
              FoodCast connects grocery stores, food banks, and delivery drivers to rescue surplus food and feed
              communities in need with <span className="font-semibold text-blue-600 dark:text-blue-400">AI-powered predictions</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/20 dark:bg-slate-800/20 border-white/30 dark:border-slate-700/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300 hover:scale-105 px-8 py-4 text-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">2.5M</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Meals Rescued</div>
              <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">89%</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Prediction Accuracy</div>
              <div className="w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">450+</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Partner Stores</div>
              <div className="w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">120+</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Food Banks Served</div>
              <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20 mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Complete Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Built for every role in food recovery
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A complete platform connecting donors, recipients, drivers, and administrators with 
            <span className="font-semibold text-blue-600 dark:text-blue-400"> intelligent automation</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Donor Card */}
          <div className="group relative bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 rounded-2xl p-8 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">For Donors</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Predict surplus inventory, confirm donations, and track your impact on food waste reduction with AI-powered insights.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group-hover:translate-x-1 transition-transform duration-300">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Recipient Card */}
          <div className="group relative bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 rounded-2xl p-8 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">For Recipients</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Browse available donations, claim food for your community, and coordinate pickups seamlessly with real-time updates.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors group-hover:translate-x-1 transition-transform duration-300">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Driver Card */}
          <div className="group relative bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 rounded-2xl p-8 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">For Drivers</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Manage delivery routes, update statuses in real-time, and ensure food reaches those in need with GPS tracking.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors group-hover:translate-x-1 transition-transform duration-300">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="group relative bg-white/10 dark:bg-slate-800/10 backdrop-blur-md border border-white/20 dark:border-slate-700/20 rounded-2xl p-8 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">For Admins</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Track KPIs, analyze trends, and measure the real-world impact of your food recovery program with advanced analytics.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group-hover:translate-x-1 transition-transform duration-300">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-slate-700 dark:to-indigo-900"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/20 dark:border-indigo-800/20 mb-6 backdrop-blur-sm">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              How FoodCast works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              A simple four-step process from prediction to delivery with 
              <span className="font-semibold text-indigo-600 dark:text-indigo-400"> intelligent automation</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="group text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  1
                </div>
                <h3 className="font-bold text-xl mb-4 text-slate-800 dark:text-slate-200">Predict</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Stores forecast surplus inventory based on historical data and upcoming events with AI-powered predictions
                </p>
              </div>
            </div>

            <div className="group text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  2
                </div>
                <h3 className="font-bold text-xl mb-4 text-slate-800 dark:text-slate-200">Confirm</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Donors confirm actual surplus and make it available for claiming with real-time inventory updates
                </p>
              </div>
            </div>

            <div className="group text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  3
                </div>
                <h3 className="font-bold text-xl mb-4 text-slate-800 dark:text-slate-200">Claim</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Food banks browse and claim donations that match their needs with smart matching algorithms
                </p>
              </div>
            </div>

            <div className="group text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  4
                </div>
                <h3 className="font-bold text-xl mb-4 text-slate-800 dark:text-slate-200">Deliver</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Drivers pick up and deliver food to recipients efficiently with optimized routing and tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-24">
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-16 text-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white/90">Join the Movement</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ready to reduce food waste?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of organizations already using FoodCast to rescue surplus food and feed communities with 
              <span className="font-semibold text-white"> intelligent automation</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg font-semibold">
                  Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 px-8 py-4 text-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/20 dark:border-slate-700/20 py-16 bg-gradient-to-br from-slate-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-indigo-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FoodCast</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Connecting communities to reduce food waste and fight hunger with intelligent automation and real-time tracking.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Platform</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-slate-800 dark:text-slate-200 text-lg">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    API Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-slate-800 dark:text-slate-200 text-lg">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-slate-800 dark:text-slate-200 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 dark:border-slate-700/20 mt-12 pt-8 text-center">
            <p className="text-slate-600 dark:text-slate-300">
              © 2025 FoodCast. All rights reserved. Made with ❤️ for a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
