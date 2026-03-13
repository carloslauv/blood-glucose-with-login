"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignInForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/70 text-sm">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-emerald-500/50 h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/70 text-sm">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-emerald-500/50 h-11"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black hover:bg-white/90 font-semibold h-11 text-sm rounded-xl mt-2"
      >
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 transition-colors">
          Create one
        </Link>
      </p>
    </form>
  )
}
