/**
 * Sistema de iconografía Rootsy — fuente de verdad del design system.
 * Phosphor Icons como set de producto · Lucide legacy hasta migración fase 2.
 */

export type IconSize = {
  id: string
  token: string
  px: number
  tailwind: string
  label: string
  usage: string
  sparing?: boolean
}

export type IconColorRole = {
  id: string
  token: string
  label: string
  usage: string
  hex: string
}

export type IconCategory = {
  id: string
  label: string
  examples: string[]
  usage: string
}

export type IconLibraryOption = {
  id: string
  name: string
  package: string
  status: "recommended" | "legacy" | "alternative"
  pros: string[]
  cons: string[]
  bestFor: string
}

export const ROOTSY_ICONOGRAPHY_MANIFESTO =
  "Los íconos de Rootsy son señales de producto — neutros, legibles, sin decoración orgánica. La naturaleza vive en color, tipografía e ilustración; no en íconos de hoja o árbol dentro de la app. Usamos Phosphor Icons: trazo geométrico, pesos tipográficos (Regular / Bold / Fill) y aspecto enterprise alineado a Atlassian. Cada ícono acompaña una acción o estado, con label de texto siempre que sea posible."

export const ROOTSY_ICONOGRAPHY_PRINCIPLES = [
  {
    title: "Comprensión universal",
    detail: "Metáforas establecidas — carrito, recibo, engranaje. Sin símbolos decorativos de marca en UI.",
  },
  {
    title: "Simplicidad legible",
    detail: "Silueta mínima en 16px — reconocible al instante en mostrador y tesorería.",
  },
  {
    title: "Armonía visual",
    detail: "Un solo set, un peso base (Regular), Bold/Fill solo para jerarquía o estado activo.",
  },
  {
    title: "Uso intencional",
    detail: "Ícono + texto label. Sin íconos donde un botón con palabra basta.",
  },
] as const

export const ROOTSY_ICON_LIBRARY_OPTIONS: IconLibraryOption[] = [
  {
    id: "phosphor",
    name: "Phosphor Icons",
    package: "@phosphor-icons/react",
    status: "recommended",
    pros: [
      "6 pesos (Thin → Duotone) — jerarquía sin mezclar librerías",
      "Aspecto geométrico y enterprise, usado en SaaS y dashboards",
      "Fill para nav activo / toggle — coherente con design systems",
      "MIT · tree-shakable · SSR-safe",
    ],
    cons: [
      "Migración desde Lucide (~100 archivos) en fase 2",
      "Nombres de ícono distintos a Lucide — requiere mapa de equivalencias",
    ],
    bestFor: "Rootsy como producto B2B profesional con tokens de peso y estado.",
  },
  {
    id: "lucide",
    name: "Lucide React",
    package: "lucide-react",
    status: "legacy",
    pros: [
      "Ya instalado en todo el codebase",
      "Set amplio, comunidad grande (shadcn/ui default)",
      "strokeWidth ajustable",
    ],
    cons: [
      "Un solo estilo outline — menos control de jerarquía",
      "Trazo redondeado puede sentirse casual junto a UI densa",
      "Tendencia a íconos “decorativos” (hoja) fuera de lugar",
    ],
    bestFor: "Implementación actual — reemplazar gradualmente por Phosphor.",
  },
  {
    id: "heroicons",
    name: "Heroicons",
    package: "@heroicons/react",
    status: "alternative",
    pros: [
      "Curado por Tailwind — minimal, muy limpio",
      "Outline + Solid — dos variantes claras",
      "Bundle pequeño por ícono",
    ],
    cons: [
      "Solo ~300 íconos — cobertura limitada para comercio argentino",
      "Sin pesos intermedios (Bold, Light)",
    ],
    bestFor: "Proyectos Tailwind-first con UI muy reducida.",
  },
]

export const ROOTSY_ICON_LIBRARY = {
  name: "Phosphor Icons",
  package: "@phosphor-icons/react",
  role: "Capa de íconos de producto Rootsy",
  legacyPackage: "lucide-react",
  defaultWeight: "regular" as const,
  activeWeight: "fill" as const,
  secondaryWeight: "bold" as const,
  rationale:
    "Pesos tipográficos, geometría más sobria que Lucide, Fill para estados activos — profesional sin perder calidez vía color canopy.",
  sizeDefault: 16,
  note: "En código: import nombrado · size={16} · weight=\"regular\" · className para color token.",
} as const

export const ROOTSY_ICON_VISUAL_STYLE = {
  weightDefault: "regular — UI general, tablas, formularios",
  weightActive: "fill — nav activo, toggle on, selección",
  weightEmphasis: "bold — CTA secundario, headers compactos",
  perspective: "Frontal / 90° — sin perspectiva 3D diagonal (Atlassian)",
  grid: "16×16 lógico en UI · Phosphor escala con prop size",
  brandIcons: "Prohibidos en producto — Leaf, Tree, Sprout solo en logo/marketing",
} as const

export const ROOTSY_ICON_SIZES: IconSize[] = [
  {
    id: "md",
    token: "icon.size.medium",
    px: 16,
    tailwind: "size-4",
    label: "Base",
    usage: "Default — botones, nav, acciones, inputs con prefijo.",
  },
  {
    id: "sm",
    token: "icon.size.small",
    px: 12,
    tailwind: "size-3",
    label: "Compacto",
    usage: "Chevrons, validación de campo, badges, acciones secundarias.",
    sparing: true,
  },
  {
    id: "lg",
    token: "icon.size.large",
    px: 20,
    tailwind: "size-5",
    label: "Destacado",
    usage: "Empty states, icon tile — no UI densa.",
  },
  {
    id: "xl",
    token: "icon.size.xlarge",
    px: 24,
    tailwind: "size-6",
    label: "Tile",
    usage: "Solo icon tile / onboarding — nunca inline en tablas.",
  },
]

export const ROOTSY_ICON_COLOR_ROLES: IconColorRole[] = [
  {
    id: "default",
    token: "icon.color.default",
    label: "Neutro",
    usage: "Íconos junto a body text.",
    hex: "#57534E",
  },
  {
    id: "subtle",
    token: "icon.color.subtle",
    label: "Secundario",
    usage: "Placeholders, disabled, metadata.",
    hex: "#A8A29E",
  },
  {
    id: "brand",
    token: "icon.color.brand",
    label: "Canopy",
    usage: "Acciones primarias, nav activo.",
    hex: "#1E8F5A",
  },
  {
    id: "inverse",
    token: "icon.color.inverse",
    label: "Inverso",
    usage: "Sobre fondos canopy o dark shell.",
    hex: "#FFFFFF",
  },
  {
    id: "info",
    token: "icon.color.info",
    label: "Info",
    usage: "Información, hints contextuales.",
    hex: "#0284C7",
  },
  {
    id: "warning",
    token: "icon.color.warning",
    label: "Aviso",
    usage: "Avisos no bloqueantes.",
    hex: "#D97706",
  },
  {
    id: "danger",
    token: "icon.color.danger",
    label: "Error",
    usage: "Error, eliminar, destructive.",
    hex: "#DC2626",
  },
  {
    id: "success",
    token: "icon.color.success",
    label: "Éxito",
    usage: "Confirmación, check, estado ok.",
    hex: "#16704A",
  },
]

export const ROOTSY_ICON_CATEGORIES: IconCategory[] = [
  {
    id: "product",
    label: "Producto · workspace",
    examples: ["SquaresFour", "Gear", "Storefront"],
    usage: "Nav, settings, módulos — nunca metáforas orgánicas.",
  },
  {
    id: "commerce",
    label: "Comercio",
    examples: ["ShoppingCart", "Receipt", "CurrencyDollar", "Package"],
    usage: "Ventas, tesorería, inventario.",
  },
  {
    id: "navigation",
    label: "Navegación",
    examples: ["CaretRight", "CaretDown", "ArrowLeft", "List"],
    usage: "CaretDown siempre 12px en triggers.",
  },
  {
    id: "actions",
    label: "Acciones",
    examples: ["Plus", "PencilSimple", "Trash", "Check", "X"],
    usage: "CRUD, confirmar, cerrar — con label o aria-label.",
  },
  {
    id: "status",
    label: "Estado",
    examples: ["CheckCircle", "WarningCircle", "Info", "CircleNotch"],
    usage: "Validación 12px · loaders con reduced-motion.",
  },
]

export const ICONOGRAPHY_GUIDELINES = [
  {
    id: "reuse",
    title: "Reutilizar antes de inventar",
    doText: "Buscar en Phosphor un metafora existente — consistencia cross-app.",
    dontText: "SVG custom o íconos de naturaleza (hoja, árbol) en UI de producto.",
  },
  {
    id: "label",
    title: "Ícono + texto",
    doText: "Botones con ícono y label — accesible y claro.",
    dontText: "Solo ícono sin aria-label en acciones no obvias.",
  },
  {
    id: "chevron",
    title: "Carets 12px",
    doText: "CaretDown/CaretRight en size 12 dentro de selects y botones.",
    dontText: "Caret 16px compitiendo con texto en triggers compactos.",
  },
  {
    id: "weight",
    title: "Peso tipográfico del ícono",
    doText: "Regular en UI · Fill en activo · Bold puntual en énfasis.",
    dontText: "Mezclar Lucide outline con Phosphor Fill en la misma barra.",
  },
  {
    id: "spacing",
    title: "Espaciado",
    doText: "gap space.100 (8px) entre ícono y texto.",
    dontText: "Ícono pegado al copy sin gap.",
  },
  {
    id: "color",
    title: "Color con token",
    doText: "icon.color.brand en CTA · icon.color.subtle en secundario.",
    dontText: "Hex suelto o verde canopy en íconos decorativos.",
  },
] as const

export const ICON_SMALL_USE_CASES = [
  "Carets en buttons, icon buttons y dropdowns",
  "Íconos de validación (info, warning, error) en campos",
  "Dentro de tags, badges y statuses compactos",
  "Acciones secundarias que no compiten con nav principal",
  "Metadata y affiliations de soporte",
] as const

export const LUCIDE_TO_PHOSPHOR_MAP = [
  { lucide: "ChevronDown", phosphor: "CaretDown" },
  { lucide: "ChevronRight", phosphor: "CaretRight" },
  { lucide: "Settings / Cog", phosphor: "Gear" },
  { lucide: "Loader2", phosphor: "CircleNotch" },
  { lucide: "Pencil", phosphor: "PencilSimple" },
  { lucide: "Trash2", phosphor: "Trash" },
  { lucide: "CheckCircle2", phosphor: "CheckCircle" },
  { lucide: "AlertCircle", phosphor: "WarningCircle" },
  { lucide: "Banknote", phosphor: "CurrencyDollar" },
] as const
