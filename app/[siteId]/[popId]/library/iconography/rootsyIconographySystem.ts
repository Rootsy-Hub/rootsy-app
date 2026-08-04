/**
 * Sistema de iconografía Rootsy — fuente de verdad del design system.
 * Iconsax (tier gratuito) como set de producto.
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

export type IconsaxVariant = "Linear" | "Outline" | "Bold" | "Bulk" | "Broken" | "TwoTone"

export const ROOTSY_ICONOGRAPHY_MANIFESTO =
  "Los íconos de Rootsy son señales de producto — neutras, legibles, sin decoración. Usamos Iconsax en su tier gratuito: ~1.000 íconos base sobre grid de 24px, seis variantes por ícono y estética SaaS moderna. La identidad nature vive en color, tipografía e ilustración — no en íconos orgánicos dentro de la app. Cada ícono acompaña una acción o estado, con label de texto siempre que sea posible."

export const ROOTSY_ICONOGRAPHY_PRINCIPLES = [
  {
    title: "Comprensión universal",
    detail: "Metáforas establecidas — carrito, recibo, engranaje. Sin símbolos decorativos en UI.",
  },
  {
    title: "Simplicidad legible",
    detail: "Silueta mínima en 16px — reconocible al instante en mostrador y tesorería.",
  },
  {
    title: "Armonía visual",
    detail: "Un solo set Iconsax · variant Linear en UI · Bold en nav activo.",
  },
  {
    title: "Uso intencional",
    detail: "Ícono + texto label. Sin íconos donde un botón con palabra basta.",
  },
] as const

export const ROOTSY_ICON_LIBRARY = {
  name: "Iconsax",
  package: "iconsax-reactjs",
  site: "https://iconsax.io",
  role: "Capa de íconos de producto Rootsy",
  tier: "Gratuito — ~1.000 íconos · 6 variantes · licencia MIT",
  variantDefault: "Linear" as IconsaxVariant,
  variantActive: "Bold" as IconsaxVariant,
  variantEmphasis: "Outline" as IconsaxVariant,
  grid: "24×24",
  rationale:
    "Set curado para interfaces SaaS — variantes coherentes, aspecto moderno y profesional sin costo de licencia en el tier free.",
  sizeDefault: 16,
  note: 'En código: import nombrado · size={16} · variant="Linear" · className para color token.',
} as const

export const ROOTSY_ICON_VARIANTS: {
  id: IconsaxVariant
  label: string
  usage: string
}[] = [
  { id: "Linear", label: "Linear", usage: "Default — UI, tablas, formularios, nav en reposo." },
  { id: "Bold", label: "Bold", usage: "Nav activo, CTA con ícono, énfasis puntual." },
  { id: "Outline", label: "Outline", usage: "Alternativa outline — solo si todo el módulo la adopta." },
  { id: "Bulk", label: "Bulk", usage: "Empty states o tiles — no mezclar con Linear en la misma barra." },
  { id: "TwoTone", label: "TwoTone", usage: "Marketing / onboarding — no UI operativa densa." },
  { id: "Broken", label: "Broken", usage: "Decorativo — evitar en producto." },
]

export const ROOTSY_ICON_VISUAL_STYLE = {
  variantDefault: "Linear — trazo limpio, peso uniforme en toda la UI",
  variantActive: "Bold — nav seleccionado, toggle on, item activo",
  perspective: "Frontal / 90° — sin perspectiva 3D diagonal",
  grid: "24×24 canvas · render nativo a 24px en previews y tiles",
  color: "currentColor + tokens icon.color.* — nunca hex suelto",
  productIcons: "Solo metáforas de producto — sin íconos orgánicos en pantallas operativas",
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
    examples: ["Element4", "Setting2", "Shop"],
    usage: "Nav, settings, módulos.",
  },
  {
    id: "commerce",
    label: "Comercio",
    examples: ["ShoppingCart", "Receipt", "DollarCircle", "Box"],
    usage: "Ventas, tesorería, inventario.",
  },
  {
    id: "navigation",
    label: "Navegación",
    examples: ["ArrowRight2", "ArrowDown2", "ArrowLeft2", "Menu"],
    usage: "ArrowDown2 siempre 12px en triggers.",
  },
  {
    id: "actions",
    label: "Acciones",
    examples: ["Add", "Edit", "Trash", "TickCircle", "CloseCircle"],
    usage: "CRUD, confirmar, cerrar — con label o aria-label.",
  },
  {
    id: "status",
    label: "Estado",
    examples: ["TickCircle", "Warning2", "InfoCircle", "Refresh"],
    usage: "Validación 12px · loaders con reduced-motion.",
  },
]

export const ICONOGRAPHY_GUIDELINES = [
  {
    id: "reuse",
    title: "Reutilizar antes de inventar",
    doText: "Buscar en Iconsax un metafora existente — consistencia cross-app.",
    dontText: "SVG custom o íconos decorativos fuera del set aprobado.",
  },
  {
    id: "label",
    title: "Ícono + texto",
    doText: "Botones con ícono y label — accesible y claro.",
    dontText: "Solo ícono sin aria-label en acciones no obvias.",
  },
  {
    id: "chevron",
    title: "Chevrons 12px",
    doText: "ArrowDown2/ArrowRight2 en size 12 dentro de selects y botones.",
    dontText: "Chevron 16px compitiendo con texto en triggers compactos.",
  },
  {
    id: "variant",
    title: "Variante consistente",
    doText: "Linear en UI · Bold en activo · misma variante en todo el módulo.",
    dontText: "Mezclar Linear, Bulk y TwoTone en la misma toolbar.",
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
    dontText: "Hex suelto o color de ícono distinto al rol semántico.",
  },
] as const

export const ICON_SMALL_USE_CASES = [
  "Chevrons en buttons, icon buttons y dropdowns",
  "Íconos de validación (info, warning, error) en campos",
  "Dentro de tags, badges y statuses compactos",
  "Acciones secundarias que no compiten con nav principal",
  "Metadata y affiliations de soporte",
] as const

export const ICONSAX_IMPORT_EXAMPLE = `import { ShoppingCart, Receipt } from "iconsax-reactjs"

<ShoppingCart size={16} variant="Linear" className="text-foreground" />
<ShoppingCart size={16} variant="Bold" className="text-primary" />`
