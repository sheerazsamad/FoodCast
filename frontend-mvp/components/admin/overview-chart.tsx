"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { stage: "Predicted", count: 312 },
  { stage: "Confirmed", count: 247 },
  { stage: "Claimed", count: 198 },
  { stage: "In Transit", count: 156 },
  { stage: "Delivered", count: 185 },
]
const colors = ["#93c5fd", "#a5b4fc", "#fda4af", "#fdba74", "#86efac"]

export function OverviewChart() {
  return (
    <ChartContainer
      config={{
        count: {
          label: "Donations",
          color: "#7c9cf3", // soft pastel blue
        },
      }}
      className="h-[300px] w-full"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} background={{ fill: '#f3f4f6' }}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={colors[idx % colors.length]} />
          ))}
        </Bar>
      </BarChart>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        {data.map((item, idx) => (
          <div key={item.stage} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-[3px]"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="text-muted-foreground">{item.stage}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  )
}
