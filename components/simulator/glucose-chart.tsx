"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { DataPoint } from "@/lib/glucose-model"

interface GlucoseChartProps {
  data: DataPoint[]
  showInsulin: boolean
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h < 12 ? "am" : "pm"
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return m === 0 ? `${displayH}${period}` : `${displayH}:${String(m).padStart(2, "0")}${period}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-black/90 backdrop-blur-sm px-4 py-3 text-sm shadow-xl">
      <p className="text-white/40 text-xs mb-2">{formatTime(label as number)}</p>
      {payload.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entry: any) =>
          entry.dataKey !== "baseline" && (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="text-white/60 capitalize">{entry.dataKey}</span>
              <span className="font-semibold text-white ml-auto pl-4">
                {Math.round(entry.value)}
                {entry.dataKey === "glucose" ? " mg/dL" : " μU/mL"}
              </span>
            </div>
          )
      )}
    </div>
  )
}

export function GlucoseChart({ data, showInsulin }: GlucoseChartProps) {
  // Downsample to every 15 min for chart performance
  const chartData = data.filter((_, i) => i % 3 === 0)

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="insulinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            ticks={[360, 480, 600, 720, 840, 960, 1080, 1200, 1320]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            yAxisId="glucose"
            domain={[60, 220]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={38}
            tickFormatter={(v) => `${v}`}
          />

          {showInsulin && (
            <YAxis
              yAxisId="insulin"
              orientation="right"
              domain={[0, 120]}
              tick={{ fill: "rgba(6,182,212,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={38}
              tickFormatter={(v) => `${v}`}
            />
          )}

          <Tooltip content={<CustomTooltip />} />

          {/* Healthy range band */}
          <ReferenceLine
            yAxisId="glucose"
            y={140}
            stroke="rgba(251,191,36,0.25)"
            strokeDasharray="4 4"
            label={{ value: "140", position: "right", fill: "rgba(251,191,36,0.4)", fontSize: 10 }}
          />
          <ReferenceLine
            yAxisId="glucose"
            y={90}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 4"
          />

          {/* Baseline reference */}
          <Area
            yAxisId="glucose"
            type="monotone"
            dataKey="baseline"
            stroke="transparent"
            fill="transparent"
            isAnimationActive={false}
          />

          {/* Glucose area */}
          <Area
            yAxisId="glucose"
            type="monotone"
            dataKey="glucose"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#glucoseGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 1.5 }}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />

          {/* Insulin area */}
          {showInsulin && (
            <Area
              yAxisId="insulin"
              type="monotone"
              dataKey="insulin"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#insulinGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#06b6d4", stroke: "#fff", strokeWidth: 1.5 }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
