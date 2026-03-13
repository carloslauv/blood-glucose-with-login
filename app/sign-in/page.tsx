import Link from "next/link"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata = {
  title: "Sign in — GlucoseIQ",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px]" />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 relative z-10">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500" />
        <span className="font-semibold text-sm tracking-tight">GlucoseIQ</span>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
          <div className="mb-7">
            <h1 className="text-xl font-bold tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-sm text-white/40">Sign in to your GlucoseIQ account</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
