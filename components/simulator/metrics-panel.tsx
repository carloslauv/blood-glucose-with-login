"use client"

import { Badge } from "@/components/ui/badge"
import type { DayMetrics, MealMetrics } from "@/lib/glucose-model"
import { cn } from "@/lib/utils"

interface MetricsPanelProps {
  day: DayMetrics
  meals: MealMetrics[]
}

const RISK_LABELS: Record<string, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  "very-high": "Very High",
}

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  moderate: "text-yellow-400",
  high: "text-orange-400",
  "very-high": "text-red-400",
}

const RISK_BG: Record<string, string> = {
  low: "bg-emerald-500/20",
  moderate: "bg-yellow-500/20",
  high: "bg-orange-500/20",
  "very-high": "bg-red-500/20",
}

function ProgressBar({
  value,
  max = 100,
  risk,
}: {
  value: number
  max?: number
  risk: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  const trackColor =
    risk === "low"
      ? "bg-emerald-500"
      : risk === "moderate"
        ? "bg-yellow-500"
        : risk === "high"
          ? "bg-orange-500"
          : "bg-red-500"

  return (
    <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700", trackColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function MetricsPanel({ day, meals }: MetricsPanelProps) {
  return (
    <div className="space-y-5">
      {/* Fat Storage Risk — hero metric */}
      <div
        className={cn(
          "rounded-2xl border p-5 transition-all duration-500",
          day.fatStorageRisk === "low"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : day.fatStorageRisk === "moderate"
              ? "border-yellow-500/30 bg-yellow-500/5"
              : day.fatStorageRisk === "high"
                ? "border-orange-500/30 bg-orange-500/5"
                : "border-red-500/30 bg-red-500/5"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-1">
              Fat storage risk
            </p>
            <p
              className={cn(
                "text-2xl font-bold tracking-tight",
                RISK_COLORS[day.fatStorageRisk]
              )}
            >
              {RISK_LABELS[day.fatStorageRisk]}
            </p>
          </div>
          <div
            className={cn(
              "text-4xl font-black tabular-nums",
              RISK_COLORS[day.fatStorageRisk]
            )}
          >
            {day.fatStorageScore}
            <span className="text-base font-normal opacity-50">/100</span>
          </div>
        </div>
        <ProgressBar value={day.fatStorageScore} risk={day.fatStorageRisk} />
        <p className="text-xs text-white/35 mt-3 leading-relaxed">
          {day.fatStorageRisk === "low" &&
            "Insulin stays low and intermittent. Your body spends time in fat-burning mode."}
          {day.fatStorageRisk === "moderate" &&
            "Moderate insulin load. Some fat-storage signalling, but manageable."}
          {day.fatStorageRisk === "high" &&
            "High chronic insulin. The body gets a persistent fat-storage signal."}
          {day.fatStorageRisk === "very-high" &&
            "Very high insulin all day. Cells see a constant fat-storage signal — weight gain mode."}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Peak glucose"
          value={`${Math.round(day.maxGlucose)}`}
          unit="mg/dL"
          sub={day.maxGlucose > 180 ? "⚠ Very high" : day.maxGlucose > 140 ? "Elevated" : "Normal"}
          highlight={day.maxGlucose > 140}
        />
        <StatCard
          label="Avg glucose"
          value={`${Math.round(day.avgGlucose)}`}
          unit="mg/dL"
          sub={day.avgGlucose > 110 ? "Above ideal" : "Good"}
          highlight={day.avgGlucose > 110}
        />
        <StatCard
          label="Time >140"
          value={`${day.timeAbove140}`}
          unit="min"
          sub={day.timeAbove140 > 60 ? "High exposure" : day.timeAbove140 > 0 ? "Some exposure" : "None"}
          highlight={day.timeAbove140 > 30}
        />
      </div>

      {/* Per-meal breakdown */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-3">
          Per-meal spikes
        </p>
        <div className="space-y-2">
          {meals.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/6 px-4 py-3"
            >
              <span className="text-white/40 text-sm w-14 shrink-0">Meal {i + 1}</span>
              <div className="flex-1">
                <ProgressBar
                  value={m.peakGlucose - 90}
                  max={160}
                  risk={m.spikeLevel}
                />
              </div>
              <Badge
                variant={m.spikeLevel as "low" | "moderate" | "high" | "very-high"}
                className="shrink-0 text-[11px]"
              >
                {Math.round(m.peakGlucose)} mg/dL
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Insulin AUC explanation */}
      <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-white/25 mb-2">
          How it works
        </p>
        <div className="space-y-2 text-xs text-white/40 leading-relaxed">
          <p>
            <span className="text-emerald-400 font-medium">Glucose</span> rises when carbs are digested.
            Fiber, fat, and protein all slow and blunt the spike.
          </p>
          <p>
            <span className="text-cyan-400 font-medium">Insulin</span> is released to clear glucose.
            High carbs trigger disproportionately high insulin.
          </p>
          <p>
            <span className={cn("font-medium", RISK_COLORS[day.fatStorageRisk])}>
              Fat storage
            </span>{" "}
            happens when insulin stays elevated chronically. Fewer meals = more time at low insulin = fat-burning mode.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  sub,
  highlight,
}: {
  label: string
  value: string
  unit: string
  sub: string
  highlight: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-colors",
        highlight ? "border-orange-500/20 bg-orange-500/5" : "border-white/8 bg-white/[0.02]"
      )}
    >
      <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">{label}</p>
      <p className={cn("text-xl font-bold tabular-nums", highlight ? "text-orange-400" : "text-white")}>
        {value}
        <span className="text-xs font-normal text-white/30 ml-0.5">{unit}</span>
      </p>
      <p className={cn("text-[11px] mt-0.5", highlight ? "text-orange-400/70" : "text-white/30")}>{sub}</p>
    </div>
  )
}
