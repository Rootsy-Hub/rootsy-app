import { POP_ACCESS_MODULE_TO_PAGE_KEY } from "@/lib/popAccessModuleMap"
import {
  POP_PAGES,
  type PopPageKey,
  permissionByLabel,
} from "@/lib/popPageCrudConstants"
import {
  modulesAvailableForPop,
  type RootsModuleDefinition,
} from "@/lib/rootsySubscriptionCatalog"

export type HrCrudVerb = "read" | "create" | "update" | "delete"

export type HrPermissionCatalogRow = {
  key: string
  resource: string
  action: string
  description: string | null
  actionLabel: string
}

export type HrPermissionVerb = {
  verb: HrCrudVerb
  executeKey: string
  approvalKey: string | null
  actionLabel: string
  description: string | null
}

export type HrPermissionSection = {
  pageKey: PopPageKey
  label: string
  verbs: HrPermissionVerb[]
  permissions: HrPermissionCatalogRow[]
}

export type GrantKeyChanges = {
  grant: string[]
  revoke: string[]
}

const SECTION_LABELS: Record<PopPageKey, string> = {
  sale: "Vender (POS)",
  mesas: "Mesas",
  mostrador: "Mostrador",
  comandas: "Comandas",
  operations: "Operaciones",
  reports: "Reportes",
  statistics: "Estadísticas",
  purchases: "Compras",
  purchase_orders: "Órdenes de compra",
  quotes: "Presupuestos",
  expenses: "Gastos",
  articles: "Artículos",
  recipes: "Recetas",
  services: "Servicios",
  "cobrar-servicios": "Vender servicio",
  promotions: "Promociones",
  inventory: "Inventario",
  manufacturing: "Fabricación",
  clients: "Clientes",
  suppliers: "Proveedores",
  invoices: "Facturas",
  accounts: "Cuentas / tesorería",
  "cash-registers": "Cajas",
  printers: "Impresoras",
  alerts: "Alertas",
  chat: "Chat",
  settings: "Ajustes",
  hr: "Recursos humanos",
  menu: "Menú",
  checks: "Cheques",
  "current-accounts": "Cuentas corrientes",
  audit: "Auditoría",
}

/** Orden de secciones en el editor de permisos (alineado al menú del POP). */
const SECTION_ORDER: PopPageKey[] = [
  "sale",
  "mesas",
  "mostrador",
  "comandas",
  "purchases",
  "expenses",
  "inventory",
  "manufacturing",
  "current-accounts",
  "clients",
  "suppliers",
  "invoices",
  "articles",
  "recipes",
  "promotions",
  "services",
  "checks",
  "operations",
  "statistics",
  "reports",
  "quotes",
  "purchase_orders",
  "accounts",
  "hr",
  "cash-registers",
  "printers",
  "alerts",
  "chat",
  "settings",
  "audit",
  "cobrar-servicios",
]

const ACTION_LABELS: Record<HrCrudVerb, string> = {
  read: "Ver",
  create: "Crear / cargar",
  update: "Editar",
  delete: "Eliminar",
}

const ACTION_DESCRIPTIONS: Record<HrCrudVerb, string> = {
  read: "Entrar a la sección y consultar datos.",
  create: "Registrar operaciones nuevas (ventas, cargas, altas).",
  update: "Modificar registros ya existentes.",
  delete: "Anular, quitar o eliminar registros.",
}

const CRUD_VERBS: readonly HrCrudVerb[] = ["read", "create", "update", "delete"]

type HrPagePermissionShape = {
  verbs: readonly HrCrudVerb[]
  allowApproval: boolean
}

const DEFAULT_PAGE_SHAPE: HrPagePermissionShape = {
  verbs: CRUD_VERBS,
  allowApproval: true,
}

/**
 * Qué acciones ofrece el editor de roles por módulo.
 * No cambia las keys de `POP_PAGES`; solo recorta lo que se puede asignar en HR.
 */
const HR_PAGE_PERMISSION_SHAPE: Partial<Record<PopPageKey, HrPagePermissionShape>> = {
  chat: { verbs: CRUD_VERBS, allowApproval: false },
  audit: { verbs: ["read"], allowApproval: false },
  alerts: { verbs: ["read"], allowApproval: false },
  reports: { verbs: ["read"], allowApproval: false },
  statistics: { verbs: ["read"], allowApproval: false },
  comandas: { verbs: ["read", "update"], allowApproval: false },
}

function pageShape(pageKey: PopPageKey): HrPagePermissionShape {
  return HR_PAGE_PERMISSION_SHAPE[pageKey] ?? DEFAULT_PAGE_SHAPE
}

function splitGrantKey(key: string): { resource: string; action: string } {
  const i = key.indexOf(":")
  if (i <= 0) return { resource: key, action: "" }
  return { resource: key.slice(0, i), action: key.slice(i + 1) }
}

function rowFromKey(
  key: string,
  verb: HrCrudVerb,
  asApproval = false,
): HrPermissionCatalogRow {
  const { resource, action } = splitGrantKey(key)
  return {
    key,
    resource,
    action,
    actionLabel: asApproval
      ? `Con aprobación · ${ACTION_LABELS[verb]}`
      : ACTION_LABELS[verb],
    description: asApproval
      ? "Puede pedir que alguien con permiso de ejecutar confirme la acción con su código."
      : ACTION_DESCRIPTIONS[verb],
  }
}

function verbsForPage(pageKey: PopPageKey): HrPermissionVerb[] {
  const shape = pageShape(pageKey)
  const verbs: HrPermissionVerb[] = []
  for (const verb of shape.verbs) {
    const executeKey = permissionByLabel(pageKey, verb)
    if (!executeKey) continue
    const approvalKey =
      shape.allowApproval && verb !== "read"
        ? (permissionByLabel(pageKey, `${verb}RequestApproval`) ??
          `${executeKey}:request_approval`)
        : null
    verbs.push({
      verb,
      executeKey,
      approvalKey,
      actionLabel: ACTION_LABELS[verb],
      description: ACTION_DESCRIPTIONS[verb],
    })
  }
  return verbs
}

function rowsFromVerb(verb: HrPermissionVerb): HrPermissionCatalogRow[] {
  const rows = [rowFromKey(verb.executeKey, verb.verb)]
  if (verb.approvalKey) {
    rows.push(rowFromKey(verb.approvalKey, verb.verb, true))
  }
  return rows
}

export type HrPopModuleScope = {
  businessTypeName?: string | null
  allModules?: boolean
  extraModuleKeys?: readonly string[]
}

function sectionsFromModules(
  modules: readonly RootsModuleDefinition[],
): HrPermissionSection[] {
  const availablePages = new Set<PopPageKey>()
  for (const mod of modules) {
    const pageKey = POP_ACCESS_MODULE_TO_PAGE_KEY[mod.key]
    if (pageKey && pageKey in POP_PAGES) availablePages.add(pageKey)
  }

  const ordered: PopPageKey[] = [
    ...SECTION_ORDER.filter((key) => availablePages.has(key)),
    ...[...availablePages].filter((key) => !SECTION_ORDER.includes(key)),
  ]

  return ordered.map((pageKey) => {
    const verbs = verbsForPage(pageKey)
    return {
      pageKey,
      label: SECTION_LABELS[pageKey] ?? pageKey,
      verbs,
      permissions: verbs.flatMap(rowsFromVerb),
    }
  })
}

/** Catálogo del tipo de POP (rubro + extras). */
export function buildHrPermissionSectionsForPop(
  scope?: HrPopModuleScope,
): HrPermissionSection[] {
  return sectionsFromModules(
    modulesAvailableForPop({
      businessTypeName: scope?.businessTypeName ?? "platform_full",
      allModules: scope?.allModules ?? true,
      extraModuleKeys: scope?.extraModuleKeys,
    }),
  )
}

/** Filas planas (compatibilidad con actions existentes). */
export function buildHrPermissionCatalogRows(
  scope?: HrPopModuleScope,
): HrPermissionCatalogRow[] {
  return buildHrPermissionSections(scope).flatMap((s) => s.permissions)
}

/** Una sección por módulo disponible en el POP. */
export function buildHrPermissionSections(
  scope?: HrPopModuleScope,
): HrPermissionSection[] {
  return buildHrPermissionSectionsForPop(scope)
}

export function sectionGrantKeys(section: HrPermissionSection): string[] {
  return section.verbs.map((verb) => verb.executeKey)
}

export function verbIsGranted(
  verb: HrPermissionVerb,
  selectedKeys: readonly string[],
): boolean {
  if (selectedKeys.includes(verb.executeKey)) return true
  return Boolean(verb.approvalKey && selectedKeys.includes(verb.approvalKey))
}

export function countHrGrantedVerbs(
  sections: readonly HrPermissionSection[],
  selectedKeys: readonly string[],
): { granted: number; total: number } {
  let granted = 0
  let total = 0
  for (const section of sections) {
    total += section.verbs.length
    for (const verb of section.verbs) {
      if (verbIsGranted(verb, selectedKeys)) granted += 1
    }
  }
  return { granted, total }
}

export function verbIsApprovalOnly(
  verb: HrPermissionVerb,
  selectedKeys: readonly string[],
): boolean {
  return Boolean(
    verb.approvalKey &&
      selectedKeys.includes(verb.approvalKey) &&
      !selectedKeys.includes(verb.executeKey),
  )
}

export function grantVerbExecute(verb: HrPermissionVerb): GrantKeyChanges {
  return {
    grant: [verb.executeKey],
    revoke: verb.approvalKey ? [verb.approvalKey] : [],
  }
}

export function revokeVerb(verb: HrPermissionVerb): GrantKeyChanges {
  return {
    grant: [],
    revoke: verb.approvalKey
      ? [verb.executeKey, verb.approvalKey]
      : [verb.executeKey],
  }
}

export function grantVerbApproval(verb: HrPermissionVerb): GrantKeyChanges | null {
  if (!verb.approvalKey) return null
  return {
    grant: [verb.approvalKey],
    revoke: [verb.executeKey],
  }
}

export function sectionSelectAllChanges(
  section: HrPermissionSection,
): GrantKeyChanges {
  return {
    grant: section.verbs.map((verb) => verb.executeKey),
    revoke: section.verbs.flatMap((verb) =>
      verb.approvalKey ? [verb.approvalKey] : [],
    ),
  }
}

export function sectionClearChanges(
  section: HrPermissionSection,
): GrantKeyChanges {
  return {
    grant: [],
    revoke: section.verbs.flatMap((verb) =>
      verb.approvalKey
        ? [verb.executeKey, verb.approvalKey]
        : [verb.executeKey],
    ),
  }
}
