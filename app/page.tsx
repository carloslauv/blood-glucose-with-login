import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GlucoseCurve } from "@/components/landing/glucose-curve"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { HowItWorks } from "@/components/landing/how-it-works"

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500" />
          <span className="font-semibold text-sm tracking-tight">GlucoseIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-white text-black hover:bg-white/90 font-medium">
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Interactive nutrition science for the modern family
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            See exactly what{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              food does
            </span>
            <br />
            to your body.
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            Real-time glucose and insulin simulations based on what you eat.
            Built to make metabolic science intuitive — and unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-12 text-base rounded-xl">
                Start exploring →
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="border-white/15 text-white hover:bg-white/5 h-12 px-8 text-base rounded-xl">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Glucose curve animation */}
        <div className="relative z-10 mt-20 w-full max-w-3xl mx-auto">
          <GlucoseCurve />
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Feature grid */}
      <FeatureGrid />

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
            Understanding starts here.
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Turn abstract nutrition facts into something you can see, feel, and finally understand.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold px-10 h-12 text-base rounded-xl">
              Create your free account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        <p>© {new Date().getFullYear()} GlucoseIQ. Built with care.</p>
      </footer>
    </main>
  )
}
