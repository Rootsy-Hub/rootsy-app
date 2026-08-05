"use server"

import { createClient } from "@/utils/supabase/server"

export type BusinessTypeOption = {
  id: string
  name: string
  displayName: string
  description: string | null
}

export async function getActiveBusinessTypes(): Promise<BusinessTypeOption[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("_business_types")
      .select("id, name, display_name, description")
      .eq("is_active", true)
      .order("display_name", { ascending: true })

    if (error || !data) return []

    return data.map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      displayName: String(row.display_name ?? row.name ?? ""),
      description:
        row.description != null ? String(row.description) : null,
    }))
  } catch {
    return []
  }
}
