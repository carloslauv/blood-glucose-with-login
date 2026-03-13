import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav user={session.user} />
      <main className="pt-16">{children}</main>
    </div>
  )
}
