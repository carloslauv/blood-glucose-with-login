"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import type { User } from "next-auth"

export function DashboardNav({ user }: { user: User | undefined }) {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/60 border-b border-white/5">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500" />
        <span className="font-semibold text-sm tracking-tight">GlucoseIQ</span>
      </Link>

      <div className="flex items-center gap-4">
        {user?.name && (
          <span className="text-sm text-white/40 hidden sm:block">
            {user.name}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-white/50 hover:text-white hover:bg-white/10 text-xs"
        >
          Sign out
        </Button>
      </div>
    </nav>
  )
}
