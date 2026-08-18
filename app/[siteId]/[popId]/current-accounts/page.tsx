import { CurrentAccountsWorkspaceView } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountsWorkspaceView"
import { parseCurrentAccountsWorkspaceUrl } from "@/app/[siteId]/[popId]/current-accounts/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopCurrentAccounts } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default async function CurrentAccountsPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  const { popId } = await params
  const url = parseCurrentAccountsWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )

  return (
    <PopListHydrationPage state={await prefetchPopCurrentAccounts(popId, url)}>
      <CurrentAccountsWorkspaceView />
    </PopListHydrationPage>
  )
}
