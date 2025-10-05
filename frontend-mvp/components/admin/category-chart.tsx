"use client"

import { Label, Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { category: "Produce", value: 35 },
  { category: "Bakery", value: 25 },
  { category: "Dairy", value: 18 },
  { category: "Prepared", value: 15 },
  { category: "Other", value: 7 },
]
const colors = ["#86efac", "#fca5a5", "#93c5fd", "#fcd34d", "#c7d2fe"]

const totalValue = data.reduce((acc, curr) => acc + curr.value, 0)

export function CategoryChart() {
  return (
    <>
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
          <Pie data={data} dataKey="value" nameKey="category" innerRadius={60} outerRadius={100} stroke="#fff" strokeWidth={2}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
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
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        {data.map((item, idx) => (
          <div key={item.category} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-[3px]"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="text-muted-foreground">
              {item.category}: <span className="text-foreground font-medium">{item.value}%</span>
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
