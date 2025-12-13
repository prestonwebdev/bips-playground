import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'

interface DataPoint {
  date: string
  revenue: number
  costs: number
  cash: number
}

interface PerformanceChartProps {
  data: DataPoint[]
  title?: string
}

/**
 * Chart Colors - Muted Data Palette
 * These match the design system tokens defined in index.css:
 * --color-chart-revenue, --color-chart-costs, --color-chart-cash
 */
const CHART_COLORS = {
  revenue: '#2a4a47',  // Dark teal - primary metric
  costs: '#c9a087',    // Muted tan/sand
  cash: '#8d9291',     // Muted gray
} as const

const chartConfig = {
  revenue: {
    label: 'Income',
    color: CHART_COLORS.revenue,
  },
  costs: {
    label: 'Costs',
    color: CHART_COLORS.costs,
  },
  cash: {
    label: 'Cash',
    color: CHART_COLORS.cash,
  },
}

export function PerformanceChart({
  data,
  title = 'Performance Summary',
}: PerformanceChartProps) {
  return (
    <Card className="rounded-[16px] border-[#f1f2f2] p-6 shadow-none h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[18px] font-medium text-[#8d9291] font-['Poppins']">
          {title}
        </h2>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="0"
            vertical={false}
            stroke="#e5e7e7"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{
              fill: '#8d9291',
              fontSize: 14,
              fontWeight: 500,
            }}
            interval={1}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tickFormatter={(value) => `${value / 1000}K`}
            tick={{
              fill: '#8d9291',
              fontSize: 14,
              fontWeight: 500,
            }}
            domain={[0, 10000]}
            ticks={[2000, 4000, 6000, 8000, 10000]}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null

              return (
                <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                  <p className="mb-2 text-[13px] text-[#c1c5c5] font-['Poppins']">
                    {payload[0].payload.date}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: chartConfig.revenue.color }}
                      />
                      <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                        Income:
                      </span>
                      <span className="text-[14px] font-medium text-white font-['Poppins']">
                        ${payload[0].payload.revenue?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: chartConfig.costs.color }}
                      />
                      <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                        Costs:
                      </span>
                      <span className="text-[14px] font-medium text-white font-['Poppins']">
                        ${payload[0].payload.costs?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: chartConfig.cash.color }}
                      />
                      <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                        Cash:
                      </span>
                      <span className="text-[14px] font-medium text-white font-['Poppins']">
                        ${payload[0].payload.cash?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }}
          />
          {/* Income line */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={chartConfig.revenue.color}
            strokeWidth={3}
            dot={false}
            activeDot={{
              fill: chartConfig.revenue.color,
              stroke: 'white',
              strokeWidth: 3,
              r: 6,
            }}
          />
          {/* Costs line */}
          <Line
            type="monotone"
            dataKey="costs"
            stroke={chartConfig.costs.color}
            strokeWidth={3}
            dot={false}
            activeDot={{
              fill: chartConfig.costs.color,
              stroke: 'white',
              strokeWidth: 3,
              r: 6,
            }}
          />
          {/* Cash on Hand line */}
          <Line
            type="monotone"
            dataKey="cash"
            stroke={chartConfig.cash.color}
            strokeWidth={3}
            dot={false}
            activeDot={{
              fill: chartConfig.cash.color,
              stroke: 'white',
              strokeWidth: 3,
              r: 6,
            }}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  )
}
