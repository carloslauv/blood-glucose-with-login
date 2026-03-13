const FEATURES = [
  {
    icon: "⚡",
    title: "Real-time simulation",
    description:
      "Every macro change updates the glucose and insulin curves instantly — no page refresh, no lag.",
    accent: "from-yellow-500/20 to-orange-500/10",
  },
  {
    icon: "🧬",
    title: "Science-backed model",
    description:
      "Curves follow the glycemic index, insulin index, and fiber-buffering research used in metabolic medicine.",
    accent: "from-purple-500/20 to-pink-500/10",
  },
  {
    icon: "🍽",
    title: "Meal frequency matters",
    description:
      "Visual proof that eating 3 structured meals keeps insulin lower than 6 small snacks with the same calories.",
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: "📊",
    title: "Fat storage explained",
    description:
      "See how chronically elevated insulin pushes the body into fat-storage mode — not calories alone.",
    accent: "from-blue-500/20 to-cyan-500/10",
  },
  {
    icon: "🎯",
    title: "Macro combinations",
    description:
      "Pair carbs with protein and fat to blunt glucose spikes. See the buffering effect in real time.",
    accent: "from-red-500/20 to-orange-500/10",
  },
  {
    icon: "💾",
    title: "Log and compare",
    description:
      "Save meal experiments to your personal history. Track what works and build intuition over time.",
    accent: "from-indigo-500/20 to-purple-500/10",
  },
]

export function FeatureGrid() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-cyan-400/70 mb-4">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Everything you need to understand metabolism.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border border-white/8 bg-gradient-to-br ${f.accent} p-6 hover:border-white/15 transition-colors`}
            >
              <span className="text-3xl block mb-4">{f.icon}</span>
              <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
