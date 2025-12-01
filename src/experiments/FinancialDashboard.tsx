import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ArrowRight } from 'lucide-react'

// Dummy daily data for the entire month - realistic for freelance web dev/designer
const generateDailyData = (baseValue: number, variance: number) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  return days.map((day) => ({
    date: `8/${day}`,
    value: Math.round(baseValue + (Math.random() * variance - variance / 2)),
    isProjected: day > 15,
  }))
}

// More realistic numbers for a freelance web developer/designer
const revenueData = generateDailyData(6500, 3000)  // ~$5k-$8k/month
const costsData = generateDailyData(1200, 600)      // ~$900-$1500/month (tools, hosting, etc.)
const cashData = generateDailyData(5500, 2000)      // ~$4k-$7k cash on hand

type MetricType = 'revenue' | 'costs' | 'cash'

interface MetricInfo {
  label: string
  value: string
  data: typeof revenueData
}

const metrics: Record<MetricType, MetricInfo> = {
  revenue: {
    label: 'Revenue',
    value: '$6,450',
    data: revenueData,
  },
  costs: {
    label: 'Costs',
    value: '$1,180',
    data: costsData,
  },
  cash: {
    label: 'Cash on Hand',
    value: '$5,420',
    data: cashData,
  },
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#2a4a47',
  },
  costs: {
    label: 'Costs',
    color: '#c77c4a',
  },
  cash: {
    label: 'Cash on Hand',
    color: '#467c75',
  },
} satisfies ChartConfig

export default function FinancialDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue')

  // Combine all data into a single dataset with all three metrics
  const combinedData = Array.from({ length: 31 }, (_, i) => ({
    date: `8/${i + 1}`,
    revenue: revenueData[i].value,
    costs: costsData[i].value,
    cash: cashData[i].value,
  }))

  return (
    <div className="min-h-screen bg-[#fafafa] p-8">
      <div className="mx-auto max-w-[960px] space-y-9">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-medium leading-[36px] tracking-[-0.44px] text-[#161a1a]">
            August 2025
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="h-[15px] w-[15px] rounded-full bg-gradient-to-br from-green-400 to-green-600" />
            <span className="text-[14px] leading-[28px] tracking-[-0.28px] text-[#8d9291]">
              In Progress
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Revenue Card */}
          <Card
            className={`cursor-pointer overflow-hidden rounded-[20px] border-0 transition-all ${
              selectedMetric === 'revenue'
                ? 'ring-2 ring-[#161a1a] ring-offset-2'
                : 'hover:scale-105'
            }`}
            onClick={() => setSelectedMetric('revenue')}
          >
            <CardContent className="relative h-[219px] p-5">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a4a47] via-[#1a2f2d] to-[#e5e7e7] opacity-90" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[16px] font-medium leading-[28px] tracking-[-0.32px] text-white">
                    Revenue
                  </p>
                  <p className="text-[36px] font-semibold leading-[44px] tracking-[-0.72px] text-white">
                    $6,450
                  </p>
                </div>
                <button className="flex items-center gap-2 text-[16px] leading-[28px] tracking-[-0.32px] text-white transition-opacity hover:opacity-80">
                  Tell Me More
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Costs Card */}
          <Card
            className={`cursor-pointer rounded-[20px] border-[#e5e7e7] transition-all ${
              selectedMetric === 'costs'
                ? 'ring-2 ring-[#161a1a] ring-offset-2'
                : 'hover:scale-105'
            }`}
            onClick={() => setSelectedMetric('costs')}
          >
            <CardContent className="h-[219px] p-5">
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[16px] font-medium leading-[28px] tracking-[-0.32px] text-[#5a5f5e]">
                    Costs
                  </p>
                  <p className="text-[36px] font-semibold leading-[44px] tracking-[-0.72px] text-[#161a1a]">
                    $1,180
                  </p>
                </div>
                <button className="flex items-center gap-2 text-[16px] leading-[28px] tracking-[-0.32px] text-[#5a5f5e] transition-opacity hover:opacity-80">
                  Tell Me More
                  <ArrowRight className="h-3 w-3 text-[#467c75]" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Cash on Hand Card */}
          <Card
            className={`cursor-pointer rounded-[20px] border-[#e5e7e7] transition-all ${
              selectedMetric === 'cash'
                ? 'ring-2 ring-[#161a1a] ring-offset-2'
                : 'hover:scale-105'
            }`}
            onClick={() => setSelectedMetric('cash')}
          >
            <CardContent className="h-[219px] p-5">
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[16px] font-medium leading-[28px] tracking-[-0.32px] text-[#5a5f5e]">
                    Cash on Hand
                  </p>
                  <p className="text-[36px] font-semibold leading-[44px] tracking-[-0.72px] text-[#161a1a]">
                    $5,420
                  </p>
                </div>
                <button className="flex items-center gap-2 text-[16px] leading-[28px] tracking-[-0.32px] text-[#5a5f5e] transition-opacity hover:opacity-80">
                  Tell Me More
                  <ArrowRight className="h-3 w-3 text-[#467c75]" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Card */}
        <Card className="rounded-[16px] border-[#f1f2f2] p-6">
          <CardContent className="p-0">
            <div className="mb-4">
              <h2 className="text-[18px] font-medium text-[#8d9291]">
                {metrics[selectedMetric].label} Over Time
              </h2>
            </div>
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <LineChart
                data={combinedData}
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
                  interval={4}
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
                      <div className="rounded bg-[#161a1a] px-3 py-2 shadow-lg">
                        <p className="mb-2 text-[13px] text-[#c1c5c5]">
                          {payload[0].payload.date}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: chartConfig.revenue.color }}
                            />
                            <span className="text-[13px] text-[#c1c5c5]">Revenue:</span>
                            <span className="text-[14px] font-medium text-white">
                              ${payload[0].payload.revenue?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: chartConfig.costs.color }}
                            />
                            <span className="text-[13px] text-[#c1c5c5]">Costs:</span>
                            <span className="text-[14px] font-medium text-white">
                              ${payload[0].payload.costs?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: chartConfig.cash.color }}
                            />
                            <span className="text-[13px] text-[#c1c5c5]">Cash:</span>
                            <span className="text-[14px] font-medium text-white">
                              ${payload[0].payload.cash?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
                {/* Revenue line */}
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={chartConfig.revenue.color}
                  strokeWidth={selectedMetric === 'revenue' ? 3 : 2}
                  strokeOpacity={selectedMetric === 'revenue' ? 1 : 0.3}
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
                  strokeWidth={selectedMetric === 'costs' ? 3 : 2}
                  strokeOpacity={selectedMetric === 'costs' ? 1 : 0.3}
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
                  strokeWidth={selectedMetric === 'cash' ? 3 : 2}
                  strokeOpacity={selectedMetric === 'cash' ? 1 : 0.3}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
