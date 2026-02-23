'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface AnalyticsData {
  projectsByProvider: { name: string; count: number }[]
  projectsByStatus: { name: string; count: number }[]
  projectsByMonth: { month: string; count: number }[]
  componentsByCategory: { name: string; count: number }[]
}

// Chart colors: Override via CSS custom properties (--chart-provider-*, --chart-status-*, --chart-palette-N)
function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

const PROVIDER_COLORS: Record<string, string> = {
  aws: getCSSVar('--chart-provider-aws', '#FF9900'),
  azure: getCSSVar('--chart-provider-azure', '#0078D4'),
  gcp: getCSSVar('--chart-provider-gcp', '#4285F4'),
  multi: getCSSVar('--chart-provider-multi', '#8B5CF6'),
}

const STATUS_COLORS: Record<string, string> = {
  draft: getCSSVar('--chart-status-draft', '#94A3B8'),
  active: getCSSVar('--chart-status-active', '#22C55E'),
  archived: getCSSVar('--chart-status-archived', '#F59E0B'),
  completed: getCSSVar('--chart-status-completed', '#3B82F6'),
}

const CHART_COLORS = [
  getCSSVar('--chart-palette-0', '#3B82F6'),
  getCSSVar('--chart-palette-1', '#22C55E'),
  getCSSVar('--chart-palette-2', '#F59E0B'),
  getCSSVar('--chart-palette-3', '#EF4444'),
  getCSSVar('--chart-palette-4', '#8B5CF6'),
  getCSSVar('--chart-palette-5', '#EC4899'),
  getCSSVar('--chart-palette-6', '#06B6D4'),
  getCSSVar('--chart-palette-7', '#F97316'),
]

export function DashboardCharts({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Projects by Provider */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Projects by Cloud Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.projectsByProvider.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.projectsByProvider}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {data.projectsByProvider.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PROVIDER_COLORS[entry.name.toLowerCase()] || '#8B5CF6'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              No project data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects by Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Projects by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.projectsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.projectsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, value }: { name?: string; value?: number }) => `${name || ''} (${value || 0})`}
                >
                  {data.projectsByStatus.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name.toLowerCase()] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              No project data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects over time */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Projects Created Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.projectsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.projectsByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              No project data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Components by Category */}
      {data.componentsByCategory.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Components Used by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.componentsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {data.componentsByCategory.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
