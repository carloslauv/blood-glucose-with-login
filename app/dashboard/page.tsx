import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Dashboard — GlucoseIQ",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/sign-in")

  const firstName =
    session.user?.name?.split(" ")[0] ??
    session.user?.email?.split("@")[0] ??
    "there"

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Welcome */}
      <div className="mb-12">
        <p className="text-white/40 text-sm mb-1">Welcome back</p>
        <h1 className="text-3xl font-bold tracking-tight">Hey {firstName} 👋</h1>
      </div>

      {/* Primary CTA — Simulator */}
      <Link href="/dashboard/simulate" className="block group">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-cyan-500/5 p-7 hover:border-emerald-500/40 hover:from-emerald-500/12 transition-all duration-200 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-3xl block mb-4">📈</span>
              <h2 className="text-xl font-bold tracking-tight mb-2">Glucose Simulator</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-lg">
                Select any meal preset or dial in macros from scratch. Watch glucose and insulin
                curves animate in real time — then change meals per day to see how timing transforms
                the same food.
              </p>
            </div>
            <div className="shrink-0 ml-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/25 transition-colors text-lg">
                →
              </div>
            </div>
          </div>
          <div className="mt-5">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-9 px-5 text-sm rounded-xl">
              Open simulator
            </Button>
          </div>
        </div>
      </Link>

      {/* Coming soon grid */}
      <p className="text-xs font-semibold tracking-widest uppercase text-white/25 mb-4">
        Coming in Phase 3
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            icon: "⚖️",
            title: "Weight Impact Model",
            description:
              "Visualise how weeks of chronically high insulin drive fat accumulation over time.",
            badge: "Phase 3",
          },
          {
            icon: "📋",
            title: "Meal Log",
            description:
              "Save your experiments and build a history of your metabolic responses over time.",
            badge: "Phase 3",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 opacity-60"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full border border-white/10 text-white/30">
                {item.badge}
              </span>
            </div>
            <h3 className="font-semibold mb-1.5 text-sm">{item.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
