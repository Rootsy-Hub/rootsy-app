import { redirect } from "next/navigation"
import type { PopPageParams } from "@/lib/workspaceSearchParams"

export default async function ActiveServicesRedirectPage({
  params,
}: {
  params: PopPageParams
}) {
  const { siteId, popId } = await params
  redirect(`/${siteId}/${popId}/operations`)
}
