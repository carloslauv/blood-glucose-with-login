"use client"

import { useEffect, useRef, useState } from "react"

const SCENARIOS = [
  {
    label: "White Rice + Soda",
    color: "#ef4444",
    glucosePeak: 95,
    insulinPeak: 88,
    description: "High glycemic — rapid spike",
  },
  {
    label: "Chicken + Vegetables",
    color: "#10b981",
    glucosePeak: 28,
    insulinPeak: 22,
    description: "Low glycemic — gentle response",
  },
  {
    label: "Oats + Berries",
    color: "#3b82f6",
    glucosePeak: 42,
    insulinPeak: 38,
    description: "Medium glycemic — moderate rise",
  },
]

function buildCurvePoints(
  peak: number,
  width: number,
  height: number,
  baseline: number
): string {
  const points: [number, number][] = []
  const steps = 80
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // Log-normal-like shape: fast rise, slow fall
    const y =
      t < 0.3
        ? peak * Math.sin((t / 0.3) * (Math.PI / 2))
        : peak * Math.exp(-3 * ((t - 0.3) / 0.7))
    points.push([t * width, baseline - y * ((height * 0.7) / 100)])
  }
  return (
    `M ${points[0][0]} ${points[0][1]} ` +
    points
      .slice(1)
      .map(([x, y]) => `L ${x} ${y}`)
      .join(" ")
  )
}

export function GlucoseCurve() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const animRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const DURATION = 2200

  useEffect(() => {
    startRef.current = null
    setProgress(0)

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const p = Math.min(elapsed / DURATION, 1)
      setProgress(p)
      if (p < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [active])

  // Auto-cycle
  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % SCENARIOS.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const scenario = SCENARIOS[active]
  const W = 600
  const H = 200
  const baseline = H - 20

  const glucosePath = buildCurvePoints(scenario.glucosePeak, W, H, baseline)
  const insulinPath = buildCurvePoints(scenario.insulinPeak, W, H, baseline)

  // Clip path progress
  const clipX = progress * W

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 text-left">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              i === active
                ? "bg-white/10 border-white/20 text-white"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: i === active ? s.color : "#555" }}
            />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 160 }}
          aria-hidden
        >
          <defs>
            <clipPath id="reveal">
              <rect x={0} y={0} width={clipX} height={H} />
            </clipPath>
            <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scenario.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={scenario.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={0}
              y1={baseline - f * (H * 0.7)}
              x2={W}
              y2={baseline - f * (H * 0.7)}
              stroke="white"
              strokeOpacity={0.05}
              strokeWidth={1}
            />
          ))}

          {/* Baseline */}
          <line
            x1={0}
            y1={baseline}
            x2={W}
            y2={baseline}
            stroke="white"
            strokeOpacity={0.1}
            strokeWidth={1}
          />

          {/* Glucose fill */}
          <path
            d={`${glucosePath} L ${W} ${baseline} L 0 ${baseline} Z`}
            fill="url(#gGrad)"
            clipPath="url(#reveal)"
          />

          {/* Glucose line */}
          <path
            d={glucosePath}
            fill="none"
            stroke={scenario.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            clipPath="url(#reveal)"
          />

          {/* Insulin line (dashed) */}
          <path
            d={insulinPath}
            fill="none"
            stroke={scenario.color}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            strokeOpacity={0.5}
            strokeLinecap="round"
            clipPath="url(#reveal)"
          />
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: scenario.color }} />
            <span className="text-xs text-white/50">Blood glucose</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-0.5 rounded-full opacity-50"
              style={{
                backgroundColor: scenario.color,
                backgroundImage: `repeating-linear-gradient(90deg, ${scenario.color} 0, ${scenario.color} 4px, transparent 4px, transparent 8px)`,
              }}
            />
            <span className="text-xs text-white/50">Insulin response</span>
          </div>
          <div className="ml-auto text-xs text-white/30">{scenario.description}</div>
        </div>
      </div>

      <p className="mt-5 text-xs text-white/25 text-center">
        Illustrative model · actual values depend on individual metabolism
      </p>
    </div>
  )
}
