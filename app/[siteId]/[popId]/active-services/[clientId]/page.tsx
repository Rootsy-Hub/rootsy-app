import { redirect } from "next/navigation"

export default async function ActiveServicesClientRedirectPage({
  params,
}: {
  params: Promise<{ siteId: string; popId: string; clientId: string }>
}) {
  const { siteId, popId } = await params
  redirect(`/${siteId}/${popId}/operations`)
}
