import { timezoneForPopLedger } from "@/lib/entryDateTimezone"
import { siteIdFromPopRow } from "@/lib/popRoutes"
import { createClient } from "@/utils/supabase/server"

/** Zona horaria del POP desde la base (servidor). */
export async function loadPopLedgerTimeZone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<string> {
  const { data } = await supabase
    .from("pops")
    .select("country, site_id, settings")
    .eq("id", popId)
    .maybeSingle()
  return timezoneForPopLedger(
    data?.country != null ? String(data.country) : null,
    siteIdFromPopRow({
      site_id: data?.site_id as string | null | undefined,
      settings: data?.settings,
    }),
  )
}
