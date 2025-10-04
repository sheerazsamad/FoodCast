"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { stage: "Predicted", count: 312, fill: "hsl(var(--chart-1))" },
  { stage: "Confirmed", count: 247, fill: "hsl(var(--chart-2))" },
  { stage: "Claimed", count: 198, fill: "hsl(var(--chart-3))" },
  { stage: "In Transit", count: 156, fill: "hsl(var(--chart-4))" },
  { stage: "Delivered", count: 185, fill: "hsl(var(--chart-5))" },
]

export function OverviewChart() {
  return (
    <ChartContainer
      config={{
        count: {
          label: "Donations",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px] w-full"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="stage" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
