/**
 * GlucoseIQ — Metabolic Simulation Engine
 *
 * Simplified but scientifically-grounded model of postprandial
 * glucose and insulin dynamics based on macronutrient composition.
 *
 * References:
 *  - Glycemic Index / Glycemic Load research (Jenkins et al.)
 *  - Insulin Index studies (Holt et al.)
 *  - Fat/fiber buffering effects (Ludwig et al.)
 */

export interface MacroInput {
  /** Grams of carbohydrates */
  carbs: number
  /** Grams of dietary fiber (subset of carbs) */
  fiber: number
  /** Grams of protein */
  protein: number
  /** Grams of fat */
  fat: number
  /** Number of meals per day (1–6) */
  mealsPerDay: number
}

export interface DataPoint {
  /** Minutes after first meal */
  time: number
  /** Blood glucose mg/dL */
  glucose: number
  /** Insulin μU/mL (relative scale) */
  insulin: number
  /** Baseline reference */
  baseline: number
}

export interface SimulationResult {
  /** Full 24-hour timeline */
  points: DataPoint[]
  /** Per-meal metrics */
  meals: MealMetrics[]
  /** Aggregate day metrics */
  day: DayMetrics
}

export interface MealMetrics {
  mealIndex: number
  /** Time of peak glucose (minutes) */
  peakGlucoseTime: number
  /** Peak glucose mg/dL */
  peakGlucose: number
  /** Peak insulin μU/mL */
  peakInsulin: number
  /** Area under the insulin curve (fat-storage proxy) */
  insulinAUC: number
  /** Qualitative spike level */
  spikeLevel: "low" | "moderate" | "high" | "very-high"
}

export interface DayMetrics {
  /** Average glucose across the day */
  avgGlucose: number
  /** Max glucose reached */
  maxGlucose: number
  /** Total insulin exposure (AUC) — fat-storage risk proxy */
  totalInsulinAUC: number
  /** 0–100 fat storage risk score */
  fatStorageScore: number
  /** Qualitative risk */
  fatStorageRisk: "low" | "moderate" | "high" | "very-high"
  /** Time spent above 140 mg/dL (hyperglycaemic range) in minutes */
  timeAbove140: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

const GLUCOSE_BASELINE = 90 // mg/dL fasting
const INSULIN_BASELINE = 5 // μU/mL fasting
const MINUTES_IN_DAY = 1440

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Smooth rise-and-fall curve centred at `peak`, width controlled by `spread` */
function mealCurve(t: number, peak: number, spread: number, asymmetry = 1.6): number {
  if (t <= 0) return 0
  // Asymmetric gaussian: fast rise, slow fall
  const sigma = t < peak ? spread : spread * asymmetry
  return Math.exp(-0.5 * ((t - peak) / sigma) ** 2)
}

/** Clamp a value between min and max */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

// ─── Meal simulation ─────────────────────────────────────────────────────────

function simulateMeal(macros: MacroInput) {
  // Effective (net) carbs after fiber buffering
  // Fiber reduces glycaemic load: 1 g fiber ≈ offsets 0.6 g net carb impact
  const netCarbs = Math.max(0, macros.carbs - macros.fiber * 0.6)

  // Carb-driven glucose rise: ~2.5 mg/dL per net carb gram
  // Fat and protein slow absorption slightly
  const absorptionSlowFactor = 1 + macros.fat * 0.008 + macros.protein * 0.004
  const carbGlucoseDelta = (netCarbs * 2.5) / absorptionSlowFactor

  // Protein has a delayed, modest glucose effect (gluconeogenesis ~10%)
  const proteinGlucoseDelta = macros.protein * 0.18

  // Total glucose excursion above baseline
  const totalGlucoseDelta = carbGlucoseDelta + proteinGlucoseDelta

  // Peak time: fat slows the peak; fiber also delays slightly
  const peakTime = 30 + macros.fat * 0.5 + macros.fiber * 0.4

  // Spread: how wide the glucose curve is (minutes)
  // More fat/fiber/protein → broader, flatter curve
  const glucoseSpread = 28 + macros.fat * 0.3 + macros.fiber * 0.5 + macros.protein * 0.15

  // Insulin: follows glucose but with lag; high-carb → disproportionately high insulin
  // Insulin index: protein also triggers meaningful insulin release
  const insulinMultiplier = 1 + (netCarbs / 50) * 0.4 // supra-linear above 50 g carbs
  const insulinDelta = (carbGlucoseDelta * 0.55 + proteinGlucoseDelta * 0.35) * insulinMultiplier
  const insulinPeakLag = 15 + macros.fat * 0.3 // insulin peaks after glucose

  return {
    glucoseDelta: totalGlucoseDelta,
    glucosePeakTime: peakTime,
    glucoseSpread,
    insulinDelta: clamp(insulinDelta, 0, 150),
    insulinPeakTime: peakTime + insulinPeakLag,
    insulinSpread: glucoseSpread * 1.4, // insulin lingers longer
  }
}

// ─── Full day simulation ──────────────────────────────────────────────────────

export function simulate(macros: MacroInput): SimulationResult {
  const count = clamp(macros.mealsPerDay, 1, 6)

  // Distribute meals across the day
  const mealSchedules: Record<number, number[]> = {
    1: [480],                           // 08:00
    2: [480, 780],                      // 08:00 12:00
    3: [480, 780, 1080],                // 08:00 13:00 18:00
    4: [480, 720, 960, 1200],           // 08:00 12:00 16:00 20:00
    5: [480, 660, 840, 1020, 1200],     // 08:00 11:00 14:00 17:00 20:00
    6: [480, 600, 720, 840, 960, 1080], // every 2 h — "snacking"
  }

  const mealTimes = mealSchedules[count]
  const meal = simulateMeal(macros)

  // Build per-minute timeline
  const STEP = 5 // every 5 minutes
  const points: DataPoint[] = []

  for (let t = 0; t < MINUTES_IN_DAY; t += STEP) {
    let glucoseExcursion = 0
    let insulinExcursion = 0

    for (const mt of mealTimes) {
      const dt = t - mt // minutes after this meal
      if (dt < -10 || dt > 240) continue // only active window

      glucoseExcursion +=
        meal.glucoseDelta * mealCurve(dt, meal.glucosePeakTime, meal.glucoseSpread)

      insulinExcursion +=
        meal.insulinDelta * mealCurve(dt, meal.insulinPeakTime, meal.insulinSpread)
    }

    points.push({
      time: t,
      glucose: clamp(GLUCOSE_BASELINE + glucoseExcursion, 70, 350),
      insulin: clamp(INSULIN_BASELINE + insulinExcursion, 0, 200),
      baseline: GLUCOSE_BASELINE,
    })
  }

  // ─── Per-meal metrics ───────────────────────────────────────────────────
  const meals: MealMetrics[] = mealTimes.map((mt, i) => {
    const window = points.filter((p) => p.time >= mt && p.time <= mt + 240)
    const peakGlucose = Math.max(...window.map((p) => p.glucose))
    const peakInsulin = Math.max(...window.map((p) => p.insulin))
    const peakGlucoseTime = window.find((p) => p.glucose === peakGlucose)?.time ?? mt

    // AUC via trapezoidal rule (insulin above baseline)
    const insulinAUC =
      window.reduce((acc, p, idx) => {
        if (idx === 0) return acc
        const prev = window[idx - 1]
        return acc + ((p.insulin - INSULIN_BASELINE + prev.insulin - INSULIN_BASELINE) / 2) * STEP
      }, 0) / 1000

    const spikeLevel: MealMetrics["spikeLevel"] =
      peakGlucose < 120 ? "low"
      : peakGlucose < 150 ? "moderate"
      : peakGlucose < 180 ? "high"
      : "very-high"

    return { mealIndex: i, peakGlucoseTime, peakGlucose, peakInsulin, insulinAUC, spikeLevel }
  })

  // ─── Day metrics ────────────────────────────────────────────────────────
  const avgGlucose = points.reduce((s, p) => s + p.glucose, 0) / points.length
  const maxGlucose = Math.max(...points.map((p) => p.glucose))
  const totalInsulinAUC = meals.reduce((s, m) => s + m.insulinAUC, 0)
  const timeAbove140 = points.filter((p) => p.glucose > 140).length * STEP

  // Fat storage score: 0–100
  // High insulin AUC = fat storage signal. Reference: 3 meals of pure carbs ≈ 80
  const fatStorageScore = clamp(Math.round((totalInsulinAUC / 4.5) * 100), 0, 100)
  const fatStorageRisk: DayMetrics["fatStorageRisk"] =
    fatStorageScore < 25 ? "low"
    : fatStorageScore < 50 ? "moderate"
    : fatStorageScore < 75 ? "high"
    : "very-high"

  return {
    points,
    meals,
    day: { avgGlucose, maxGlucose, totalInsulinAUC, fatStorageScore, fatStorageRisk, timeAbove140 },
  }
}

// ─── Food presets ─────────────────────────────────────────────────────────────

export interface FoodPreset {
  id: string
  name: string
  emoji: string
  description: string
  category: "carbs" | "protein" | "mixed" | "healthy"
  macros: Omit<MacroInput, "mealsPerDay">
}

export const FOOD_PRESETS: FoodPreset[] = [
  {
    id: "white-rice",
    name: "White rice + chicken",
    emoji: "🍚",
    description: "High GI carbs with lean protein",
    category: "mixed",
    macros: { carbs: 65, fiber: 1, protein: 35, fat: 5 },
  },
  {
    id: "soda-candy",
    name: "Soda + candy",
    emoji: "🥤",
    description: "Pure refined sugar, zero fiber",
    category: "carbs",
    macros: { carbs: 80, fiber: 0, protein: 0, fat: 0 },
  },
  {
    id: "pizza",
    name: "Pizza (2 slices)",
    emoji: "🍕",
    description: "Refined carbs, fat, moderate protein",
    category: "mixed",
    macros: { carbs: 60, fiber: 3, protein: 20, fat: 18 },
  },
  {
    id: "steak-veg",
    name: "Steak + vegetables",
    emoji: "🥩",
    description: "High protein, fat, minimal carbs",
    category: "protein",
    macros: { carbs: 10, fiber: 4, protein: 50, fat: 22 },
  },
  {
    id: "salad-avocado",
    name: "Salad + avocado + egg",
    emoji: "🥗",
    description: "Fiber-rich, healthy fats, balanced",
    category: "healthy",
    macros: { carbs: 20, fiber: 10, protein: 18, fat: 25 },
  },
  {
    id: "oatmeal",
    name: "Oatmeal + berries",
    emoji: "🫐",
    description: "Complex carbs with fiber, low fat",
    category: "healthy",
    macros: { carbs: 50, fiber: 8, protein: 10, fat: 6 },
  },
  {
    id: "burger",
    name: "Burger + fries",
    emoji: "🍔",
    description: "High carbs, fat, moderate protein",
    category: "mixed",
    macros: { carbs: 70, fiber: 3, protein: 30, fat: 35 },
  },
  {
    id: "eggs-bacon",
    name: "Eggs + bacon",
    emoji: "🍳",
    description: "Zero carb, high protein, high fat",
    category: "protein",
    macros: { carbs: 2, fiber: 0, protein: 30, fat: 30 },
  },
]
