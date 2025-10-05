"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Package,
  Users,
  Truck,
  Target,
  Clock,
  Leaf,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewChart } from "@/components/admin/overview-chart"
import { CategoryChart } from "@/components/admin/category-chart"
import { RecentActivity } from "@/components/admin/recent-activity"
import { TopDonors } from "@/components/admin/top-donors"
import { PersistentMap } from "@/components/ui/persistent-map"
import { useOffers } from "@/hooks/useOffers"
import { useAnalytics } from "@/hooks/useAnalytics"
import { mockKPIs } from "@/lib/mock-data"
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const { analytics, loading: analyticsLoading, lastUpdated } = useAnalytics()
  const { offers, loading: offersLoading } = useOffers()
  const [showPipelineDetails, setShowPipelineDetails] = useState(false)
  const [showCategoryDetails, setShowCategoryDetails] = useState(false)
  const [kpiCarouselApi, setKpiCarouselApi] = useState<CarouselApi | null>(null)
  
  // Use real analytics data if available, fallback to mock data
  const kpis = analytics ? {
    totalDonations: analytics.totalDonations,
    predictionAccuracy: analytics.predictionAccuracy,
    averageResponseTime: analytics.averageResponseTime,
    totalMealsRescued: analytics.totalMealsRescued,
    totalWeight: analytics.totalWeight,
    co2Saved: analytics.co2Saved,
    totalValueSaved: analytics.totalValueSaved,
    activeDonors: analytics.activeDonors,
    activeRecipients: analytics.activeRecipients,
    pendingOffers: analytics.pendingOffers,
    totalClaimed: analytics.totalClaimed,
    totalDelivered: analytics.totalDelivered,
    totalConfirmed: analytics.totalConfirmed,
    totalPredicted: analytics.totalPredicted
  } : mockKPIs

  const kpiCards = [
    {
      title: "Total Donations",
      value: kpis.totalDonations,
      change: "+12.5%",
      trend: "up" as const,
      icon: Package,
      description: "vs last month",
    },
    {
      title: "Live Claims",
      value: (kpis as any).totalClaimed?.toLocaleString?.() || (kpis as any).totalClaimed || 0,
      change: "+now",
      trend: "up" as const,
      icon: Users,
      description: "Total claimed (live)",
    },
    {
      title: "Prediction Accuracy",
      value: `${kpis.predictionAccuracy}%`,
      change: "+3.2%",
      trend: "up" as const,
      icon: Target,
      description: "AI model performance",
    },
    {
      title: "Predicted Offers",
      value: (kpis as any).totalPredicted?.toLocaleString?.() || (kpis as any).totalPredicted || 0,
      change: "+now",
      trend: "up" as const,
      icon: TrendingUp,
      description: "AI-suggested (live)",
    },
    {
      title: "Avg Response Time",
      value: `${kpis.averageResponseTime}h`,
      change: "-0.5h",
      trend: "up" as const,
      icon: Clock,
      description: "Claim to pickup",
    },
    {
      title: "Meals Rescued",
      value: kpis.totalMealsRescued.toLocaleString(),
      change: "+18.3%",
      trend: "up" as const,
      icon: Users,
      description: "Total impact",
    },
    {
      title: "Food Weight",
      value: `${(kpis as any).totalWeight?.toLocaleString?.() || (kpis as any).totalWeight || 0} lbs`,
      change: "+15.7%",
      trend: "up" as const,
      icon: TrendingUp,
      description: "Total rescued",
    },
    {
      title: "CO₂ Saved",
      value: `${(kpis as any).co2Saved?.toLocaleString?.() || (kpis as any).co2Saved || 0} kg`,
      change: "+14.2%",
      trend: "up" as const,
      icon: Leaf,
      description: "Environmental impact",
    },
  ]

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-2xl"/>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">Admin Analytics</h1>
          <p className="text-muted-foreground">Monitor platform performance and impact metrics</p>
          {lastUpdated && (
            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live as of {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          
        </div>

        {/* KPI Cards Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <Carousel opts={{ align: "center", loop: true }} setApi={setKpiCarouselApi} className="px-2">
            <CarouselContent className="-ml-2">
              {kpiCards.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <CarouselItem key={kpi.title} className="basis-full sm:basis-1/2 lg:basis-1/3 pl-2">
                    <Card className="transition-shadow hover:shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span
                            className={`flex items-center gap-1 ${kpi.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {kpi.trend === "up" ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {kpi.change}
                          </span>
                          <span>{kpi.description}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <div className="mt-3 flex justify-center gap-2">
              <Button size="icon" variant="outline" onClick={() => kpiCarouselApi?.scrollPrev()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => kpiCarouselApi?.scrollNext()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Carousel>
        </div>

        {/* Persistent Map */}
        <PersistentMap 
          userRole="admin"
          offers={offers}
          loading={offersLoading}
          onOfferClick={(offer) => {
            console.log('Admin viewing offer:', offer)
          }}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Donation Pipeline</CardTitle>
              <CardDescription>Track donations from prediction to delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <OverviewChart />
              <div className="mt-4 flex justify-end">
                <button
                  className="px-3 py-2 text-sm rounded-md border bg-white/60 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-900/60 transition"
                  onClick={() => setShowPipelineDetails((v) => !v)}
                >
                  {showPipelineDetails ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              {showPipelineDetails && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-muted-foreground">Predicted ➜ Confirmed</div>
                    <div className="text-xl font-semibold">{(kpis as any).totalPredicted} ➜ {kpis.totalDonations}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-muted-foreground">Claimed ➜ Delivered</div>
                    <div className="text-xl font-semibold">{(kpis as any).totalClaimed} ➜ {(kpis as any).totalDelivered}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Food Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryChart />
              <div className="mt-4 flex justify-end">
                <button
                  className="px-3 py-2 text-sm rounded-md border bg-white/60 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-900/60 transition"
                  onClick={() => setShowCategoryDetails((v) => !v)}
                >
                  {showCategoryDetails ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              {showCategoryDetails && (
                <div className="mt-4 text-sm grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted">Produce: 35%</div>
                  <div className="p-3 rounded-lg bg-muted">Bakery: 25%</div>
                  <div className="p-3 rounded-lg bg-muted">Dairy: 18%</div>
                  <div className="p-3 rounded-lg bg-muted">Prepared: 15%</div>
                  <div className="p-3 rounded-lg bg-muted">Other: 7%</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="donors">Top Donors</TabsTrigger>
            <TabsTrigger value="impact">Impact Report</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6">
            <RecentActivity />
          </TabsContent>

          <TabsContent value="donors" className="mt-6">
            <TopDonors />
          </TabsContent>

          <TabsContent value="impact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>Measuring our contribution to sustainability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <Leaf className="h-8 w-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                    <div className="text-3xl font-bold mb-1">{(kpis.co2Saved / 1000).toFixed(1)}K kg</div>
                    <p className="text-sm text-muted-foreground">CO₂ Emissions Prevented</p>
                  </div>

                  <div className="text-center p-6 bg-muted rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-3xl font-bold mb-1">{kpis.totalMealsRescued.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Meals Provided</p>
                  </div>

                  <div className="text-center p-6 bg-muted rounded-lg">
                    <Truck className="h-8 w-8 mx-auto mb-3 text-accent" />
                    <div className="text-3xl font-bold mb-1">{kpis.totalDelivered}</div>
                    <p className="text-sm text-muted-foreground">Successful Deliveries</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Food Waste Diverted</span>
                      <span className="text-sm text-muted-foreground">
                        {(kpis as any).totalConfirmed > 0 ? (((kpis as any).totalDelivered / (kpis as any).totalConfirmed) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(kpis as any).totalConfirmed > 0 ? ((kpis as any).totalDelivered / (kpis as any).totalConfirmed) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Prediction Accuracy</span>
                      <span className="text-sm text-muted-foreground">{kpis.predictionAccuracy}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: `${kpis.predictionAccuracy}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Claim Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {(kpis as any).totalConfirmed > 0 ? (((kpis as any).totalClaimed / (kpis as any).totalConfirmed) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                        style={{ width: `${(kpis as any).totalConfirmed > 0 ? ((kpis as any).totalClaimed / (kpis as any).totalConfirmed) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
