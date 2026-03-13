import Link from "next/link"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata = {
  title: "Create account — GlucoseIQ",
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]" />
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
            <h1 className="text-xl font-bold tracking-tight mb-1.5">Create your account</h1>
            <p className="text-sm text-white/40">
              Start understanding how food shapes your metabolism
            </p>
          </div>
          <SignUpForm />
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          By creating an account you agree to our{" "}
          <span className="text-white/40">Terms of Service</span> and{" "}
          <span className="text-white/40">Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}
