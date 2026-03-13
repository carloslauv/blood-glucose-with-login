import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ComingSoon } from "@/components/dashboard/coming-soon"

export const metadata = {
  title: "Dashboard — GlucoseIQ",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/sign-in")

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <ComingSoon name={session.user?.name ?? session.user?.email ?? "there"} />
    </div>
  )
}
