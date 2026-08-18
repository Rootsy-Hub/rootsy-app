import { CurrentAccountsWorkspaceView } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountsWorkspaceView"
import { parseCurrentAccountsWorkspaceUrl } from "@/app/[siteId]/[popId]/current-accounts/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopCurrentAccounts } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default function CurrentAccountsPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  return (
    <PopListHydrationPage
      state={loadCurrentAccounts(params, searchParams)}
    >
      <CurrentAccountsWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadCurrentAccounts(
  params: PopPageParams,
  searchParams: PopPageSearchParams,
) {
  const { popId } = await params
  const url = parseCurrentAccountsWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )
  return prefetchPopCurrentAccounts(popId, url)
}
