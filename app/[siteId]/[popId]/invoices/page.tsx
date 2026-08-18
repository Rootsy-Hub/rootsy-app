import { InvoicesWorkspaceView } from "@/app/[siteId]/[popId]/invoices/InvoicesWorkspaceView"
import { parseInvoicesWorkspaceUrl } from "@/app/[siteId]/[popId]/invoices/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopInvoicesTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default async function InvoicesPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  const { popId } = await params
  const url = parseInvoicesWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )

  return (
    <PopListHydrationPage state={await prefetchPopInvoicesTable(popId, url)}>
      <InvoicesWorkspaceView />
    </PopListHydrationPage>
  )
}
