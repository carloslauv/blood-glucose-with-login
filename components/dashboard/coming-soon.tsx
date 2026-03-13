const UPCOMING = [
  {
    icon: "🥗",
    title: "Meal Builder",
    description: "Select foods and macros to build any meal and watch glucose curves animate in real time.",
    badge: "Phase 2",
  },
  {
    icon: "📈",
    title: "Glucose Simulator",
    description: "Full interactive simulation with protein, carbs, fat, fiber sliders and instant feedback.",
    badge: "Phase 2",
  },
  {
    icon: "⏱",
    title: "Meal Frequency Tool",
    description: "Compare 3 structured meals vs 6 snacks with the same calories — see the insulin difference.",
    badge: "Phase 2",
  },
  {
    icon: "🏋️",
    title: "Weight Impact Model",
    description: "Visualize how chronically elevated insulin drives fat storage — make it click for good.",
    badge: "Phase 3",
  },
]

export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="flex-1 px-6 py-16 max-w-4xl mx-auto w-full">
      {/* Welcome */}
      <div className="mb-14">
        <p className="text-white/40 text-sm mb-2">Welcome back</p>
        <h1 className="text-3xl font-bold tracking-tight">
          Hey {name.split(" ")[0]} 👋
        </h1>
      </div>

      {/* Status banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 mb-12 flex items-start gap-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
        <div>
          <p className="font-medium text-emerald-400 mb-1">Phase 1 complete — you&apos;re in!</p>
          <p className="text-sm text-white/50 leading-relaxed">
            Authentication and database are live. The interactive glucose simulator is coming next.
            Your account is ready and all future logs will be saved here.
          </p>
        </div>
      </div>

      {/* Upcoming features */}
      <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-5">
        Coming next
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {UPCOMING.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 hover:border-white/15 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full border border-white/10 text-white/30">
                {item.badge}
              </span>
            </div>
            <h3 className="font-semibold mb-1.5">{item.title}</h3>
            <p className="text-sm text-white/45 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
