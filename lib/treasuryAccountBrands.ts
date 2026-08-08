import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"

export type TreasuryBrandCategory = "bank" | "wallet"

export type TreasuryAccountBrandPreset = {
  key: string
  label: string
  /** Nombre sugerido al crear la cuenta. */
  defaultName: string
  category: TreasuryBrandCategory
  /** Monograma corto en la tarjeta. */
  monogram: string
  /** Tailwind: gradiente de fondo del encabezado. */
  headerGradient: string
  /** Tailwind: color del monograma / acento. */
  accentClass: string
  /** Tailwind: texto sobre el encabezado. */
  headerTextClass: string
}

export const TREASURY_BRAND_OTHER_KEY = "other"

export const ARG_BANK_BRANDS: TreasuryAccountBrandPreset[] = [
  {
    key: "galicia",
    label: "Galicia",
    defaultName: "Banco Galicia",
    category: "bank",
    monogram: "GAL",
    headerGradient: "from-[#ff6600] via-[#f57c00] to-[#e65100]",
    accentClass: "text-orange-950",
    headerTextClass: "text-white",
  },
  {
    key: "santander",
    label: "Santander",
    defaultName: "Banco Santander",
    category: "bank",
    monogram: "SAN",
    headerGradient: "from-[#ec0000] via-[#d40000] to-[#b80000]",
    accentClass: "text-red-950",
    headerTextClass: "text-white",
  },
  {
    key: "bbva",
    label: "BBVA",
    defaultName: "BBVA",
    category: "bank",
    monogram: "BBVA",
    headerGradient: "from-[#004481] via-[#003d73] to-[#002f5c]",
    accentClass: "text-blue-950",
    headerTextClass: "text-white",
  },
  {
    key: "macro",
    label: "Macro",
    defaultName: "Banco Macro",
    category: "bank",
    monogram: "MAC",
    headerGradient: "from-[#00205b] via-[#001a4d] to-[#001438]",
    accentClass: "text-blue-950",
    headerTextClass: "text-white",
  },
  {
    key: "nacion",
    label: "Banco Nación",
    defaultName: "Banco Nación",
    category: "bank",
    monogram: "BN",
    headerGradient: "from-[#005eb8] via-[#004e99] to-[#003f7d]",
    accentClass: "text-blue-950",
    headerTextClass: "text-white",
  },
  {
    key: "provincia",
    label: "Provincia",
    defaultName: "Banco Provincia",
    category: "bank",
    monogram: "BP",
    headerGradient: "from-[#00a859] via-[#009650] to-[#008347]",
    accentClass: "text-green-950",
    headerTextClass: "text-white",
  },
  {
    key: "ciudad",
    label: "Ciudad",
    defaultName: "Banco Ciudad",
    category: "bank",
    monogram: "BC",
    headerGradient: "from-[#00b4d8] via-[#0096b8] to-[#007a98]",
    accentClass: "text-cyan-950",
    headerTextClass: "text-white",
  },
  {
    key: "icbc",
    label: "ICBC",
    defaultName: "ICBC",
    category: "bank",
    monogram: "ICBC",
    headerGradient: "from-[#c8102e] via-[#a50d25] to-[#880a1f]",
    accentClass: "text-red-950",
    headerTextClass: "text-white",
  },
  {
    key: "supervielle",
    label: "Supervielle",
    defaultName: "Supervielle",
    category: "bank",
    monogram: "SUP",
    headerGradient: "from-[#e87722] via-[#d96a18] to-[#c45d14]",
    accentClass: "text-orange-950",
    headerTextClass: "text-white",
  },
  {
    key: "patagonia",
    label: "Patagonia",
    defaultName: "Banco Patagonia",
    category: "bank",
    monogram: "PAT",
    headerGradient: "from-[#004b3a] via-[#004434] to-[#003b2f]",
    accentClass: "text-emerald-950",
    headerTextClass: "text-white",
  },
]

export const ARG_WALLET_BRANDS: TreasuryAccountBrandPreset[] = [
  {
    key: "mercadopago",
    label: "Mercado Pago",
    defaultName: "Mercado Pago",
    category: "wallet",
    monogram: "MP",
    headerGradient: "from-[#009ee3] via-[#0088cc] to-[#0072aa]",
    accentClass: "text-sky-950",
    headerTextClass: "text-white",
  },
  {
    key: "modo",
    label: "MODO",
    defaultName: "MODO",
    category: "wallet",
    monogram: "MODO",
    headerGradient: "from-[#008f7a] via-[#007a68] to-[#006556]",
    accentClass: "text-emerald-950",
    headerTextClass: "text-white",
  },
  {
    key: "uala",
    label: "Ualá",
    defaultName: "Ualá",
    category: "wallet",
    monogram: "UA",
    headerGradient: "from-[#7b1fa2] via-[#6a1b8f] to-[#58167c]",
    accentClass: "text-purple-950",
    headerTextClass: "text-white",
  },
  {
    key: "personal_pay",
    label: "Personal Pay",
    defaultName: "Personal Pay",
    category: "wallet",
    monogram: "PP",
    headerGradient: "from-[#0066cc] via-[#005bb5] to-[#004f9e]",
    accentClass: "text-blue-950",
    headerTextClass: "text-white",
  },
  {
    key: "naranja_x",
    label: "Naranja X",
    defaultName: "Naranja X",
    category: "wallet",
    monogram: "NX",
    headerGradient: "from-[#ff6600] via-[#eb5e00] to-[#d45500]",
    accentClass: "text-orange-950",
    headerTextClass: "text-white",
  },
  {
    key: "lemon",
    label: "Lemon",
    defaultName: "Lemon",
    category: "wallet",
    monogram: "LM",
    headerGradient: "from-[#0a0a0a] via-[#111111] to-[#000000]",
    accentClass: "text-lime-300",
    headerTextClass: "text-white",
  },
  {
    key: "astropay",
    label: "AstroPay",
    defaultName: "AstroPay",
    category: "wallet",
    monogram: "AP",
    headerGradient: "from-[#1a2332] via-[#121820] to-[#0a0e14]",
    accentClass: "text-orange-400",
    headerTextClass: "text-white",
  },
]

const ALL_PRESETS = [...ARG_BANK_BRANDS, ...ARG_WALLET_BRANDS]

const PRESET_BY_KEY = new Map(ALL_PRESETS.map((p) => [p.key, p]))

export function getTreasuryBrandPresets(
  category: TreasuryBrandCategory,
): TreasuryAccountBrandPreset[] {
  return category === "bank" ? ARG_BANK_BRANDS : ARG_WALLET_BRANDS
}

export function getTreasuryBrandPreset(
  brandKey: string | null | undefined,
): TreasuryAccountBrandPreset | null {
  if (!brandKey || brandKey === TREASURY_BRAND_OTHER_KEY) return null
  return PRESET_BY_KEY.get(brandKey) ?? null
}

export function resolveTreasuryAccountBrand(args: {
  kind: TreasuryAccountKind
  brandKey?: string | null
  name?: string
}): TreasuryAccountBrandPreset | null {
  const fromKey = getTreasuryBrandPreset(args.brandKey)
  if (fromKey) return fromKey
  const normalized = (args.name ?? "").trim().toLowerCase()
  if (!normalized) return null
  return (
    ALL_PRESETS.find(
      (p) =>
        normalized === p.defaultName.toLowerCase() ||
        normalized.includes(p.label.toLowerCase()),
    ) ?? null
  )
}

export const TREASURY_MOTHER_CREATE_KIND_OPTIONS = [
  { value: "cash" as const, label: "Efectivo" },
  { value: "bank" as const, label: "Banco" },
  { value: "wallet" as const, label: "Billetera" },
] as const

/** @deprecated Usar TREASURY_MOTHER_CREATE_KIND_OPTIONS en el modal de alta. */
export const CREATE_ACCOUNT_KIND_OPTIONS = [
  ...TREASURY_MOTHER_CREATE_KIND_OPTIONS.map((opt) => ({
    ...opt,
    description:
      opt.value === "cash"
        ? "Caja o caja chica"
        : opt.value === "bank"
          ? "Cuenta bancaria"
          : "PSP o billetera virtual",
  })),
  { value: "other" as const, label: "Otro", description: "Otra cuenta" },
]

export function defaultBrandKeyForKind(
  kind: TreasuryAccountKind,
): string | null {
  if (kind === "bank") return ARG_BANK_BRANDS[0]?.key ?? TREASURY_BRAND_OTHER_KEY
  if (kind === "wallet") return ARG_WALLET_BRANDS[0]?.key ?? TREASURY_BRAND_OTHER_KEY
  return TREASURY_BRAND_OTHER_KEY
}

export function accountNameFromCreateSelection(args: {
  name: string
}): string {
  return args.name.trim()
}
