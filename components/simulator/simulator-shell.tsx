"use client"

import { useState, useMemo } from "react"
import { simulate, type MacroInput } from "@/lib/glucose-model"
import { MacroPanel } from "./macro-panel"
import { GlucoseChart } from "./glucose-chart"
import { MetricsPanel } from "./metrics-panel"
import { Button } from "@/components/ui/button"

const DEFAULT_MACROS: MacroInput = {
  carbs: 50,
  fiber: 5,
  protein: 25,
  fat: 15,
  mealsPerDay: 3,
}

export function SimulatorShell() {
  const [macros, setMacros] = useState<MacroInput>(DEFAULT_MACROS)
  const [showInsulin, setShowInsulin] = useState(true)

  const result = useMemo(() => simulate(macros), [macros])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Glucose Simulator</h1>
        <p className="text-white/40 text-sm">
          Adjust macros and meal frequency to see real-time effects on glucose and insulin.
        </p>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* Left: inputs */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <MacroPanel macros={macros} onChange={setMacros} />
        </div>

        {/* Right: chart + metrics */}
        <div className="space-y-5">
          {/* Chart card */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-sm">24-hour response</h2>
                <p className="text-xs text-white/35 mt-0.5">
                  {macros.mealsPerDay} meal{macros.mealsPerDay > 1 ? "s" : ""} distributed through the day
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Legend */}
                <div className="flex items-center gap-3 text-xs text-white/40 mr-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-500 rounded-full" />
                    Glucose
                  </span>
                  {showInsulin && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-cyan-500 rounded-full opacity-60" style={{ borderTop: "2px dashed" }} />
                      Insulin
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsulin((s) => !s)}
                  className={`text-xs h-7 px-3 rounded-lg transition-colors ${
                    showInsulin
                      ? "bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25"
                      : "text-white/30 hover:text-white/60 hover:bg-white/5"
                  }`}
                >
                  {showInsulin ? "Hide insulin" : "Show insulin"}
                </Button>
              </div>
            </div>
            <GlucoseChart data={result.points} showInsulin={showInsulin} />

            {/* Glucose zone legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/6">
              <ZoneLabel color="bg-emerald-500/30" label="Optimal" range="70–99 mg/dL" />
              <ZoneLabel color="bg-yellow-500/30" label="Elevated" range="100–139 mg/dL" />
              <ZoneLabel color="bg-orange-500/30" label="High spike" range="140+ mg/dL" />
            </div>
          </div>

          {/* Metrics */}
          <MetricsPanel day={result.day} meals={result.meals} />
        </div>
      </div>

      {/* Science explainer */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <ScienceCard
          title="Why fiber matters"
          body="Fiber slows carbohydrate digestion and absorption, flattening the glucose curve. Even 10g of fiber with a high-carb meal can reduce the glucose spike by 20–30%."
          icon="🌾"
        />
        <ScienceCard
          title="The insulin–fat connection"
          body="Insulin's main job is to store energy. Chronically high insulin (from frequent or high-carb eating) keeps fat cells in storage mode, preventing fat breakdown."
          icon="🔬"
        />
        <ScienceCard
          title="Meal timing is a lever"
          body="Eating 3 structured meals gives insulin 4–5 hours to return to baseline between meals. 6 snacks with the same calories keeps insulin elevated all day — same food, very different signal."
          icon="⏱"
        />
      </div>
    </div>
  )
}

function ZoneLabel({
  color,
  label,
  range,
}: {
  color: string
  label: string
  range: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[11px] text-white/40">
        <span className="text-white/60">{label}</span> {range}
      </span>
    </div>
  )
}

function ScienceCard({
  title,
  body,
  icon,
}: {
  title: string
  body: string
  icon: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <span className="text-2xl block mb-3">{icon}</span>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <p className="text-xs text-white/45 leading-relaxed">{body}</p>
    </div>
  )
}
