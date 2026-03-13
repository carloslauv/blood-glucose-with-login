"use client"

import { Slider } from "@/components/ui/slider"
import { FOOD_PRESETS, type MacroInput, type FoodPreset } from "@/lib/glucose-model"
import { cn } from "@/lib/utils"

interface MacroPanelProps {
  macros: MacroInput
  onChange: (macros: MacroInput) => void
}

const MACRO_CONFIG = [
  {
    key: "carbs" as const,
    label: "Carbohydrates",
    unit: "g",
    max: 150,
    color: "from-amber-500 to-orange-500",
    dotColor: "bg-amber-400",
    description: "Primary glucose driver",
  },
  {
    key: "fiber" as const,
    label: "Fiber",
    unit: "g",
    max: 50,
    color: "from-emerald-500 to-green-500",
    dotColor: "bg-emerald-400",
    description: "Buffers glucose spikes",
  },
  {
    key: "protein" as const,
    label: "Protein",
    unit: "g",
    max: 100,
    color: "from-violet-500 to-purple-500",
    dotColor: "bg-violet-400",
    description: "Modest, delayed glucose effect",
  },
  {
    key: "fat" as const,
    label: "Fat",
    unit: "g",
    max: 80,
    color: "from-pink-500 to-rose-500",
    dotColor: "bg-pink-400",
    description: "Slows absorption, no direct spike",
  },
]

const CATEGORY_COLORS: Record<FoodPreset["category"], string> = {
  carbs: "border-amber-500/30 bg-amber-500/10 hover:border-amber-500/60 hover:bg-amber-500/20",
  protein: "border-violet-500/30 bg-violet-500/10 hover:border-violet-500/60 hover:bg-violet-500/20",
  mixed: "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10",
  healthy: "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/60 hover:bg-emerald-500/20",
}

export function MacroPanel({ macros, onChange }: MacroPanelProps) {
  function update(key: keyof MacroInput, value: number) {
    const next = { ...macros, [key]: value }
    // Fiber can't exceed carbs
    if (key === "carbs") next.fiber = Math.min(next.fiber, value)
    if (key === "fiber") next.fiber = Math.min(value, next.carbs)
    onChange(next)
  }

  function applyPreset(preset: FoodPreset) {
    onChange({ ...preset.macros, mealsPerDay: macros.mealsPerDay })
  }

  return (
    <div className="space-y-6">
      {/* Food presets */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-3">
          Quick presets
        </p>
        <div className="grid grid-cols-2 gap-2">
          {FOOD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
                CATEGORY_COLORS[preset.category]
              )}
            >
              <span className="text-lg block leading-none mb-1">{preset.emoji}</span>
              <span className="text-xs font-medium text-white/80 leading-snug block">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Macro sliders */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-3">
          Macros per meal
        </p>
        <div className="space-y-5">
          {MACRO_CONFIG.map((cfg) => (
            <div key={cfg.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", cfg.dotColor)} />
                  <span className="text-sm font-medium text-white/80">{cfg.label}</span>
                  <span className="text-xs text-white/30 hidden sm:block">— {cfg.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={cfg.max}
                    value={macros[cfg.key]}
                    onChange={(e) => update(cfg.key, Math.min(cfg.max, Math.max(0, Number(e.target.value))))}
                    className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right text-sm font-medium text-white focus:outline-none focus:border-white/30 focus:ring-0"
                  />
                  <span className="text-xs text-white/30 w-4">{cfg.unit}</span>
                </div>
              </div>
              <Slider
                min={0}
                max={cfg.max}
                step={1}
                value={[macros[cfg.key]]}
                onValueChange={([v]) => update(cfg.key, v)}
                className={cn(cfg.key === "fiber" && macros[cfg.key] > macros.carbs && "opacity-50")}
              />
              {cfg.key === "fiber" && (
                <p className="text-[11px] text-white/25 mt-1.5">
                  Net carbs after fiber: <span className="text-white/50 font-medium">{Math.max(0, macros.carbs - Math.round(macros.fiber * 0.6))}g</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meals per day */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-3">
          Meals per day
        </p>
        <div className="grid grid-cols-6 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ ...macros, mealsPerDay: n })}
              className={cn(
                "rounded-lg py-2 text-sm font-semibold transition-all",
                macros.mealsPerDay === n
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/25 mt-2">
          {macros.mealsPerDay <= 3
            ? "✓ Structured eating — allows insulin to reset between meals"
            : "⚠ Frequent eating — keeps insulin elevated throughout the day"}
        </p>
      </div>
    </div>
  )
}
