import {
  Accessibility,
  AlignLeft,
  AppWindow,
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  Circle,
  Compass,
  Component,
  CornerDownRight,
  Eye,
  GitPullRequest,
  Globe,
  Heart,
  Layers,
  Layers2,
  LayoutGrid,
  LayoutTemplate,
  Library,
  Map,
  Menu,
  MessageCircle,
  MousePointerClick,
  Move,
  Newspaper,
  Package,
  Palette,
  Play,
  Scale,
  Sparkles,
  Square,
  Table2,
  Target,
  TextCursor,
  TrendingUp,
  Type,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"

const HANDBOOK_NAV_ICONS: Record<string, LucideIcon> = {
  overview: Compass,
  vision: Eye,
  estrategia: Target,
  principios: Scale,
  "plataforma-de-marca": Sparkles,
  "voz-y-tono": MessageCircle,
  "identidad-visual": Palette,
  territorio: Map,
  comunidad: Users,
  ecosistema: Globe,
  producto: Package,
  experiencia: Heart,
  "sistema-de-diseno": Component,
  contenido: AlignLeft,
  organizacion: Building2,
  "forma-de-trabajo": Workflow,
  impacto: TrendingUp,
  biblioteca: Library,
  plantillas: LayoutTemplate,
  actualizaciones: Newspaper,
}

const HANDBOOK_DESIGN_SYSTEM_NAV_ICONS: Record<string, LucideIcon> = {
  overview: Compass,
  color: Palette,
  tipografia: Type,
  "espaciado-y-proporciones": Move,
  layout: LayoutGrid,
  "superficies-y-profundidad": Layers2,
  borde: Square,
  radios: CornerDownRight,
  elevacion: Layers,
  iconografia: Circle,
  logotipos: BadgeCheck,
  movimiento: Play,
  navegacion: Menu,
  acciones: MousePointerClick,
  formularios: TextCursor,
  datos: Table2,
  feedback: Bell,
  overlays: AppWindow,
  patrones: Workflow,
  "presencia-de-rootsy": Sparkles,
  accesibilidad: Accessibility,
  "contenido-de-interfaz": AlignLeft,
  contribuciones: GitPullRequest,
}

export function getHandbookNavIcon(sectionId: string): LucideIcon | null {
  return HANDBOOK_NAV_ICONS[sectionId] ?? BookOpen
}

export function getHandbookDesignSystemNavIcon(pageId: string): LucideIcon | null {
  return (
    HANDBOOK_DESIGN_SYSTEM_NAV_ICONS[pageId] ??
    HANDBOOK_DESIGN_SYSTEM_NAV_ICONS[pageId.replace(/-final$/, "")] ??
    null
  )
}
