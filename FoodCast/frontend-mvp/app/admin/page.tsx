"use client"

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
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewChart } from "@/components/admin/overview-chart"
import { CategoryChart } from "@/components/admin/category-chart"
import { RecentActivity } from "@/components/admin/recent-activity"
import { TopDonors } from "@/components/admin/top-donors"
import { mockKPIs } from "@/lib/mock-data"

export default function AdminDashboard() {
  const kpis = mockKPIs

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
      title: "Prediction Accuracy",
      value: `${kpis.predictionAccuracy}%`,
      change: "+3.2%",
      trend: "up" as const,
      icon: Target,
      description: "AI model performance",
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
      value: `${(kpis.totalWeight / 1000).toFixed(1)}K lbs`,
      change: "+15.7%",
      trend: "up" as const,
      icon: TrendingUp,
      description: "Total rescued",
    },
    {
      title: "CO₂ Saved",
      value: `${(kpis.co2Saved / 1000).toFixed(1)}K kg`,
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
        <div>
          <h1 className="text-3xl font-bold">Admin Analytics</h1>
          <p className="text-muted-foreground">Monitor platform performance and impact metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
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
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Donation Pipeline</CardTitle>
              <CardDescription>Track donations from prediction to delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <OverviewChart />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Food Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryChart />
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
                        {((kpis.totalDelivered / kpis.totalConfirmed) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(kpis.totalDelivered / kpis.totalConfirmed) * 100}%` }}
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
                        {((kpis.totalClaimed / kpis.totalConfirmed) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                        style={{ width: `${(kpis.totalClaimed / kpis.totalConfirmed) * 100}%` }}
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
