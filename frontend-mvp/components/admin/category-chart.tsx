"use client"

import { Label, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { category: "Produce", value: 35, fill: "hsl(var(--chart-1))" },
  { category: "Bakery", value: 25, fill: "hsl(var(--chart-2))" },
  { category: "Dairy", value: 18, fill: "hsl(var(--chart-3))" },
  { category: "Prepared", value: 15, fill: "hsl(var(--chart-4))" },
  { category: "Other", value: 7, fill: "hsl(var(--chart-5))" },
]

const totalValue = data.reduce((acc, curr) => acc + curr.value, 0)

export function CategoryChart() {
  return (
    <ChartContainer
      config={{
        value: {
          label: "Percentage",
        },
      }}
      className="h-[300px] w-full"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie data={data} dataKey="value" nameKey="category" innerRadius={60} outerRadius={100}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                      {totalValue}%
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
                      Total
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
