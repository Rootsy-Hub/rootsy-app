"use client"

import {
  createPopRole,
  deactivatePopMember,
  deleteInactivePopMember,
  deletePopRole,
  getPopHrDashboard,
  getRolePermissionsEditorData,
  inviteUserToPop,
  revokePopInvitation,
  savePopRolePermissions,
  type MemberRow,
  type PendingInviteRow,
  type PermissionCatalogRow,
  type PopRoleRow,
} from "@/app/[siteId]/[popId]/hr/actions"
import { HrInviteDialog, type HrInviteResult } from "@/app/[siteId]/[popId]/hr/HrInviteDialog"
import {
  HrRolePermissionsDialog,
  hrCreateRolePermissionCatalog,
} from "@/app/[siteId]/[popId]/hr/HrRolePermissionsDialog"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksSectionDescriptionClass,
  dataWorkspaceBlocksSectionTitleClass,
  dataWorkspaceEntityCardBadgeClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusInactiveClass,
  dataWorkspaceEntityCardStatusOpenClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsDangerSubtleButton,
  RootsDefaultButton,
} from "@/components/rootsy-button"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import { Plus, UserPlus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type TeamFilter = "active" | "pending" | "inactive"

type ConfirmAction =
  | { kind: "delete-role"; role: PopRoleRow }
  | { kind: "deactivate"; member: MemberRow }
  | { kind: "delete-member"; member: MemberRow }
  | { kind: "revoke"; invite: PendingInviteRow }

function groupMembersByRole(members: MemberRow[]): [string, MemberRow[]][] {
  const grouped = new Map<string, MemberRow[]>()
  for (const member of members) {
    const key = member.roleDisplayName || "—"
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(member)
  }
  const entries = [...grouped.entries()]
  entries.sort((a, b) => {
    if (a[0] === "Propietario") return -1
    if (b[0] === "Propietario") return 1
    return a[0].localeCompare(b[0], "es")
  })
  return entries
}

function memberDisplayName(member: MemberRow): string {
  return `${member.firstName} ${member.lastName}`.trim() || "Sin nombre"
}

function memberInitials(member: MemberRow): string {
  const first = (member.firstName || member.lastName || "?").slice(0, 1).toUpperCase()
  const last = member.lastName ? member.lastName.slice(0, 1).toUpperCase() : ""
  return `${first}${last}`.slice(0, 2)
}

function emailInitials(email: string): string {
  return email.slice(0, 2).toUpperCase()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function isExpired(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

function HrSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className={dataWorkspaceBlocksSectionTitleClass}>{title}</h2>
          {description ? (
            <p className={dataWorkspaceBlocksSectionDescriptionClass}>{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function HrLoseta({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        dataWorkspaceEntityCardLosetaSurfaceClass,
        "h-auto",
        className,
      )}
    >
      {children}
    </article>
  )
}

function HrRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

function HrPersonName({
  title,
  meta,
}: {
  title: string
  meta?: string
}) {
  return (
    <div className="min-w-0">
      <p className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
        {title}
      </p>
      {meta ? (
        <p className={cn(dataWorkspaceEntityCardEyebrowClass, "mt-0.5 truncate")}>
          {meta}
        </p>
      ) : null}
    </div>
  )
}

function HrAvatar({
  imageUrl,
  initials,
  muted,
}: {
  imageUrl?: string | null
  initials: string
  muted?: boolean
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn(dataWorkspaceEntityCardIsotypeClass, "size-10 object-cover")}
      />
    )
  }

  return (
    <div
      className={cn(
        dataWorkspaceEntityCardIsotypeClass,
        "size-10",
        "font-canopy text-xs font-semibold",
        muted && "bg-rootsy-bruma-50 text-rootsy-bruma-500",
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}

function HrPulseCard({ label, value }: { label: string; value: number }) {
  return (
    <HrLoseta className="px-4 py-3">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p className={cn(dataWorkspaceEntityCardStatValueLargeClass, "mt-0.5 text-xl")}>
        {value}
      </p>
    </HrLoseta>
  )
}

function HrPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, refresh } =
    usePopWorkspace()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canManageInvites, setCanManageInvites] = useState(false)
  const [roles, setRoles] = useState<PopRoleRow[]>([])
  const [members, setMembers] = useState<MemberRow[]>([])
  const [pending, setPending] = useState<PendingInviteRow[]>([])
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("active")
  const [banner, setBanner] = useState<{
    type: "ok" | "err" | "info"
    text: string
  } | null>(null)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteResult, setInviteResult] = useState<HrInviteResult | null>(null)
  const [actionKey, setActionKey] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const [permModalOpen, setPermModalOpen] = useState(false)
  const [permModalMode, setPermModalMode] = useState<"create" | "edit">("edit")
  const [permModalRole, setPermModalRole] = useState<{
    id: string
    displayName: string
    name: string
  } | null>(null)
  const [permModalDisplayName, setPermModalDisplayName] = useState("")
  const [permModalList, setPermModalList] = useState<PermissionCatalogRow[]>([])
  const [permModalSelected, setPermModalSelected] = useState<string[]>([])
  const [permModalLoading, setPermModalLoading] = useState(false)
  const [permModalSaving, setPermModalSaving] = useState(false)
  const [permModalError, setPermModalError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getPopHrDashboard(popId)
    if (!res.success) {
      setError(res.error)
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1600)
      }
      return
    }
    setError(null)
    setCanManageInvites(res.canManageInvites)
    setRoles(res.roles)
    setMembers(res.members)
    setPending(res.pendingInvites)
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("ID de POP no encontrado")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await loadDashboard()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, loadDashboard])

  const pageLoading = bootstrapLoading || loading
  const popName = bootstrap?.popName ?? ""

  const activeMembers = useMemo(
    () => members.filter((member) => member.isActive),
    [members],
  )
  const inactiveMembers = useMemo(
    () => members.filter((member) => !member.isActive && !member.isOwner),
    [members],
  )
  const groupedMembers = useMemo(
    () => groupMembersByRole(activeMembers),
    [activeMembers],
  )
  const assignableRoles = useMemo(
    () => roles.filter((role) => role.name !== "owner"),
    [roles],
  )

  const membersByRoleId = useMemo(() => {
    const counts = new Map<string, number>()
    for (const member of activeMembers) {
      counts.set(member.roleId, (counts.get(member.roleId) ?? 0) + 1)
    }
    return counts
  }, [activeMembers])

  const confirmCopy = useMemo(() => {
    if (!confirmAction) {
      return { title: "", description: "", confirmLabel: "Confirmar" }
    }
    if (confirmAction.kind === "delete-role") {
      return {
        title: "Eliminar rol",
        description: `¿Eliminar “${confirmAction.role.displayName}”? Se quitan sus permisos y no se va a poder usar en invitaciones nuevas.`,
        confirmLabel: "Eliminar rol",
      }
    }
    if (confirmAction.kind === "deactivate") {
      return {
        title: "Quitar del equipo",
        description: `¿Desvincular a ${memberDisplayName(confirmAction.member)} de este negocio? Va a pasar a inactivos.`,
        confirmLabel: "Quitar",
      }
    }
    if (confirmAction.kind === "revoke") {
      return {
        title: "Revocar invitación",
        description: `¿Cancelar la invitación a ${confirmAction.invite.email}? Ya no va a poder entrar con ese enlace.`,
        confirmLabel: "Revocar",
      }
    }
    return {
      title: "Eliminar usuario",
      description: `¿Eliminar a ${memberDisplayName(confirmAction.member)} de este negocio? No va a figurar más en RRHH.`,
      confirmLabel: "Eliminar",
    }
  }, [confirmAction])

  const closePermModal = () => {
    setPermModalOpen(false)
    setPermModalMode("edit")
    setPermModalRole(null)
    setPermModalDisplayName("")
    setPermModalList([])
    setPermModalSelected([])
    setPermModalLoading(false)
    setPermModalSaving(false)
    setPermModalError(null)
  }

  const handleOpenCreateRole = () => {
    setPermModalMode("create")
    setPermModalRole(null)
    setPermModalDisplayName("")
    setPermModalList(hrCreateRolePermissionCatalog())
    setPermModalSelected([])
    setPermModalLoading(false)
    setPermModalError(null)
    setPermModalOpen(true)
  }

  const handleOpenEditRole = async (role: PopRoleRow) => {
    if (!popId || !siteId || !role.popId) return
    setPermModalMode("edit")
    setPermModalLoading(true)
    setPermModalError(null)
    setPermModalRole({ id: role.id, displayName: role.displayName, name: role.name })
    setPermModalDisplayName(role.displayName)
    setPermModalList([])
    setPermModalSelected([])
    setPermModalOpen(true)
    const res = await getRolePermissionsEditorData(popId, role.id)
    setPermModalLoading(false)
    if (!res.success) {
      closePermModal()
      setBanner({ type: "err", text: res.error })
      return
    }
    setPermModalRole(res.role)
    setPermModalDisplayName(res.role.displayName)
    setPermModalList(res.permissions)
    setPermModalSelected([...res.selectedGrantKeys])
  }

  const togglePermSelection = (grantKey: string) => {
    setPermModalSelected((prev) =>
      prev.includes(grantKey)
        ? prev.filter((key) => key !== grantKey)
        : [...prev, grantKey],
    )
  }

  const togglePermSection = (keys: string[], enabled: boolean) => {
    setPermModalSelected((prev) => {
      const next = new Set(prev)
      for (const key of keys) {
        if (enabled) next.add(key)
        else next.delete(key)
      }
      return [...next]
    })
  }

  const handleSaveRolePermissions = async () => {
    if (!popId || !siteId) return
    setPermModalSaving(true)
    setPermModalError(null)

    if (permModalMode === "create") {
      const res = await createPopRole(
        popId,
        permModalDisplayName,
        permModalSelected,
      )
      setPermModalSaving(false)
      if (!res.success) {
        setPermModalError(res.error)
        return
      }
      setBanner({ type: "ok", text: "Rol creado correctamente." })
      closePermModal()
      await loadDashboard()
      return
    }

    if (!permModalRole) {
      setPermModalSaving(false)
      return
    }

    const res = await savePopRolePermissions(
      popId,
      permModalRole.id,
      permModalSelected,
    )
    setPermModalSaving(false)
    if (!res.success) {
      setPermModalError(res.error)
      return
    }
    setBanner({ type: "ok", text: "Permisos del rol actualizados." })
    closePermModal()
    await Promise.all([loadDashboard(), refresh()])
  }

  const openInvite = () => {
    setInviteError(null)
    setInviteResult(null)
    setInviteOpen(true)
  }

  const handleInvite = async (input: {
    email: string
    roleId: string
    message: string
  }) => {
    if (!popId || !siteId || !canManageInvites) return
    setInviting(true)
    setInviteError(null)
    const res = await inviteUserToPop(
      popId,
      input.email,
      input.roleId,
      input.message || null,
    )
    setInviting(false)
    if (!res.success) {
      setInviteError(res.error)
      return
    }
    setInviteResult({
      inviteUrl: res.inviteUrl,
      emailSent: res.emailSent,
      emailError: res.emailError,
      resendConfigured: res.resendConfigured,
    })
    setTeamFilter("pending")
    await loadDashboard()
  }

  const copyInviteUrl = async (url: string) => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setBanner({ type: "ok", text: "Enlace copiado al portapapeles." })
  }

  const handleRevoke = async (id: string) => {
    if (!popId || !siteId) return
    setActionKey(`revoke-${id}`)
    const res = await revokePopInvitation(popId, id)
    setActionKey(null)
    if (!res.success) {
      setBanner({ type: "err", text: res.error || "No se pudo revocar." })
      return
    }
    setConfirmAction(null)
    setBanner({ type: "ok", text: "Invitación revocada." })
    await loadDashboard()
  }

  const runConfirmAction = async () => {
    if (!popId || !siteId || !confirmAction) return

    if (confirmAction.kind === "revoke") {
      await handleRevoke(confirmAction.invite.id)
      return
    }

    if (confirmAction.kind === "delete-role") {
      setActionKey(`del-role-${confirmAction.role.id}`)
      const res = await deletePopRole(popId, confirmAction.role.id)
      setActionKey(null)
      if (!res.success) {
        setBanner({ type: "err", text: res.error })
        return
      }
      setConfirmAction(null)
      setBanner({ type: "ok", text: "Rol eliminado." })
      await loadDashboard()
      return
    }

    if (confirmAction.kind === "deactivate") {
      setActionKey(`deact-${confirmAction.member.userId}`)
      const res = await deactivatePopMember(popId, confirmAction.member.userId)
      setActionKey(null)
      if (!res.success) {
        setBanner({ type: "err", text: res.error || "No se pudo quitar al miembro." })
        return
      }
      setConfirmAction(null)
      setBanner({ type: "ok", text: "Usuario desvinculado del POP." })
      await loadDashboard()
      return
    }

    setActionKey(`del-mem-${confirmAction.member.userId}`)
    const res = await deleteInactivePopMember(popId, confirmAction.member.userId)
    setActionKey(null)
    if (!res.success) {
      setBanner({ type: "err", text: res.error || "No se pudo eliminar." })
      return
    }
    setConfirmAction(null)
    setBanner({ type: "ok", text: "Usuario eliminado del equipo." })
    await loadDashboard()
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">ID de POP no encontrado</p>
      </div>
    )
  }

  const teamFilterOptions = [
    { value: "active", label: `Activos ${activeMembers.length}` },
    ...(canManageInvites
      ? [{ value: "pending", label: `Esperando ${pending.length}` }]
      : []),
    { value: "inactive", label: `Inactivos ${inactiveMembers.length}` },
  ]

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="RRHH"
        headerVariant={dataWorkspaceModuleHeaderVariant}
        contentFlush
        loading={pageLoading}
        userName={bootstrap?.userFullName}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel || undefined}
        mainMaxWidthClass="max-w-none"
        mainClassName={dataWorkspaceBlocksPageMainClass}
        headerActions={
          canManageInvites ? (
            <div className="flex items-center gap-2">
              <DataWorkspaceHeaderIconButton
                label="Nuevo rol"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                disabled={permModalLoading || permModalSaving}
                onClick={handleOpenCreateRole}
              >
                <Plus className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
              <DataWorkspaceHeaderIconButton
                label="Invitar"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                primary
                onClick={openInvite}
              >
                <UserPlus className="size-5" aria-hidden />
              </DataWorkspaceHeaderIconButton>
            </div>
          ) : null
        }
      >
        <div className={dataWorkspaceBlocksPageContentClass}>
          {bootstrapError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={`Cabecera: ${bootstrapError}`}
            />
          ) : null}

          {error ? (
            <RootsBanner intent="danger" layout="message" message={error} />
          ) : (
            <>
              {banner ? (
                <RootsBanner
                  intent={
                    banner.type === "ok"
                      ? "success"
                      : banner.type === "err"
                        ? "danger"
                        : "neutral"
                  }
                  layout="message"
                  message={banner.text}
                  onDismiss={() => setBanner(null)}
                />
              ) : null}

              <div
                className={cn(
                  "grid gap-4",
                  canManageInvites
                    ? "grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-2 lg:grid-cols-3",
                )}
              >
                <HrPulseCard label="Activos" value={activeMembers.length} />
                {canManageInvites ? (
                  <HrPulseCard label="Esperando" value={pending.length} />
                ) : null}
                <HrPulseCard label="Inactivos" value={inactiveMembers.length} />
                <HrPulseCard label="Roles" value={roles.length} />
              </div>

              <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                <div className="space-y-4 lg:col-span-8">
                  <HrSection
                    title="Equipo"
                    description="Quién está en el local, con qué rol y en qué estado."
                  >
                    <RootsFormSegmentField
                      label="Estado del equipo"
                      aria-label="Filtrar equipo por estado"
                      layout="inline"
                      value={teamFilter}
                      onValueChange={(value) => setTeamFilter(value as TeamFilter)}
                      options={teamFilterOptions}
                    />

                  {teamFilter === "active" ? (
                    groupedMembers.length === 0 ? (
                      <p className={dataWorkspaceBlocksEmptyStateClass}>
                        Todavía no hay personas activas en este local.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {groupedMembers.map(([roleLabel, list]) => (
                          <HrLoseta key={roleLabel}>
                            <HrRow className="border-b border-rootsy-bruma-200">
                              <h3 className={dataWorkspaceBlocksSectionTitleClass}>
                                {roleLabel}
                              </h3>
                              <span className="font-canopy text-[11px] tabular-nums text-rootsy-bruma-500">
                                {list.length}
                              </span>
                            </HrRow>
                            <ul className="divide-y divide-rootsy-bruma-200">
                              {list.map((member) => (
                                <li key={`${member.userId}-${roleLabel}`}>
                                  <HrRow>
                                    <div className="flex min-w-0 items-center gap-3">
                                      <HrAvatar
                                        imageUrl={member.imageUrl}
                                        initials={memberInitials(member)}
                                      />
                                      <HrPersonName
                                        title={memberDisplayName(member)}
                                        meta={
                                          member.invitedAt
                                            ? `Desde ${formatDate(member.invitedAt)}`
                                            : member.roleDisplayName
                                        }
                                      />
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                      <span
                                        className={
                                          member.isOwner
                                            ? dataWorkspaceEntityCardStatusOpenClass
                                            : dataWorkspaceEntityCardStatusClosedClass
                                        }
                                      >
                                        {member.isOwner ? "Dueño" : "Activo"}
                                      </span>
                                      {canManageInvites && !member.isOwner ? (
                                        <RootsDefaultButton
                                          type="button"
                                          size="compact"
                                          disabled={
                                            actionKey === `deact-${member.userId}`
                                          }
                                          onClick={() =>
                                            setConfirmAction({
                                              kind: "deactivate",
                                              member,
                                            })
                                          }
                                        >
                                          Quitar
                                        </RootsDefaultButton>
                                      ) : null}
                                    </div>
                                  </HrRow>
                                </li>
                              ))}
                            </ul>
                          </HrLoseta>
                        ))}
                      </div>
                    )
                  ) : null}

                  {teamFilter === "pending" ? (
                    pending.length === 0 ? (
                      <p className={dataWorkspaceBlocksEmptyStateClass}>
                        Nadie está esperando entrar.
                      </p>
                    ) : (
                      <HrLoseta>
                        <ul className="divide-y divide-rootsy-bruma-200">
                          {pending.map((invite) => {
                            const expired = isExpired(invite.expiresAt)
                            return (
                              <li key={invite.id}>
                                <HrRow>
                                  <div className="flex min-w-0 items-center gap-3">
                                    <HrAvatar
                                      initials={emailInitials(invite.email)}
                                      muted
                                    />
                                    <HrPersonName
                                      title={invite.email}
                                      meta={`${invite.roleDisplayName} · ${
                                        expired
                                          ? `Venció ${formatDate(invite.expiresAt)}`
                                          : `Vence ${formatDate(invite.expiresAt)}`
                                      }`}
                                    />
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <span
                                      className={
                                        expired
                                          ? dataWorkspaceEntityCardStatusInactiveClass
                                          : dataWorkspaceEntityCardStatusClosedClass
                                      }
                                    >
                                      {expired ? "Vencida" : "Esperando"}
                                    </span>
                                    {invite.inviteUrl ? (
                                      <RootsDefaultButton
                                        type="button"
                                        size="compact"
                                        onClick={() =>
                                          void copyInviteUrl(invite.inviteUrl)
                                        }
                                      >
                                        Copiar enlace
                                      </RootsDefaultButton>
                                    ) : null}
                                    <RootsDangerSubtleButton
                                      type="button"
                                      size="compact"
                                      disabled={actionKey === `revoke-${invite.id}`}
                                      onClick={() =>
                                        setConfirmAction({ kind: "revoke", invite })
                                      }
                                    >
                                      Revocar
                                    </RootsDangerSubtleButton>
                                  </div>
                                </HrRow>
                              </li>
                            )
                          })}
                        </ul>
                      </HrLoseta>
                    )
                  ) : null}

                  {teamFilter === "inactive" ? (
                    inactiveMembers.length === 0 ? (
                      <p className={dataWorkspaceBlocksEmptyStateClass}>
                        Nadie está fuera del equipo.
                      </p>
                    ) : (
                      <HrLoseta>
                        <ul className="divide-y divide-rootsy-bruma-200">
                          {inactiveMembers.map((member) => (
                            <li key={`inactive-${member.userId}-${member.roleId}`}>
                              <HrRow>
                                <div className="flex min-w-0 items-center gap-3">
                                  <HrAvatar
                                    imageUrl={member.imageUrl}
                                    initials={memberInitials(member)}
                                    muted
                                  />
                                  <HrPersonName
                                    title={memberDisplayName(member)}
                                    meta={member.roleDisplayName || "—"}
                                  />
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span
                                    className={dataWorkspaceEntityCardStatusInactiveClass}
                                  >
                                    Inactivo
                                  </span>
                                  {canManageInvites ? (
                                    <RootsDangerSubtleButton
                                      type="button"
                                      size="compact"
                                      disabled={
                                        actionKey === `del-mem-${member.userId}`
                                      }
                                      onClick={() =>
                                        setConfirmAction({
                                          kind: "delete-member",
                                          member,
                                        })
                                      }
                                    >
                                      Eliminar
                                    </RootsDangerSubtleButton>
                                  ) : null}
                                </div>
                              </HrRow>
                            </li>
                          ))}
                        </ul>
                      </HrLoseta>
                    )
                  ) : null}
                  </HrSection>

                  {!canManageInvites ? (
                    <p className="font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
                      Solo el dueño puede invitar y editar permisos.
                    </p>
                  ) : null}
                </div>

                <div className="lg:col-span-4">
                  <HrSection
                    title="Roles y permisos"
                    description="Qué puede hacer cada persona cuando entra."
                    action={
                      canManageInvites ? (
                        <RootsDefaultButton
                          type="button"
                          size="compact"
                          disabled={permModalLoading || permModalSaving}
                          onClick={handleOpenCreateRole}
                        >
                          Nuevo
                        </RootsDefaultButton>
                      ) : null
                    }
                  >
                    {roles.length === 0 ? (
                      <p className={dataWorkspaceBlocksEmptyStateClass}>
                        No hay roles cargados.
                      </p>
                    ) : (
                      <HrLoseta>
                        <ul className="divide-y divide-rootsy-bruma-200">
                          {roles.map((role) => (
                            <li key={role.id}>
                              <HrRow>
                                <HrPersonName
                                  title={role.displayName}
                                  meta={
                                    role.popId
                                      ? `${membersByRoleId.get(role.id) ?? 0} en el equipo`
                                      : "Plantilla del sistema"
                                  }
                                />
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className={dataWorkspaceEntityCardBadgeClass}>
                                    {role.popId ? "POP" : "Sistema"}
                                  </span>
                                  {canManageInvites && role.popId ? (
                                    <>
                                      <RootsDefaultButton
                                        type="button"
                                        size="compact"
                                        disabled={permModalLoading || permModalSaving}
                                        onClick={() => void handleOpenEditRole(role)}
                                      >
                                        Permisos
                                      </RootsDefaultButton>
                                      <RootsDangerSubtleButton
                                        type="button"
                                        size="compact"
                                        disabled={
                                          Boolean(actionKey?.startsWith("del-role-")) ||
                                          permModalLoading ||
                                          permModalSaving
                                        }
                                        onClick={() =>
                                          setConfirmAction({
                                            kind: "delete-role",
                                            role,
                                          })
                                        }
                                      >
                                        Eliminar
                                      </RootsDangerSubtleButton>
                                    </>
                                  ) : null}
                                </div>
                              </HrRow>
                            </li>
                          ))}
                        </ul>
                      </HrLoseta>
                    )}
                  </HrSection>
                </div>
              </div>
            </>
          )}
        </div>
      </DataWorkspaceModuleLayout>

      <HrInviteDialog
        open={inviteOpen}
        roles={assignableRoles}
        saving={inviting}
        error={inviteError}
        result={inviteResult}
        onOpenChange={(open) => {
          if (!open && !inviting) {
            setInviteOpen(false)
            setInviteError(null)
            setInviteResult(null)
          }
        }}
        onSubmit={handleInvite}
        onInviteAnother={() => {
          setInviteResult(null)
          setInviteError(null)
        }}
        onCreateRole={() => {
          setInviteOpen(false)
          setInviteError(null)
          setInviteResult(null)
          handleOpenCreateRole()
        }}
      />

      <HrRolePermissionsDialog
        open={permModalOpen}
        mode={permModalMode}
        displayName={permModalDisplayName}
        permissions={permModalList}
        selectedKeys={permModalSelected}
        loading={permModalLoading}
        saving={permModalSaving}
        error={permModalError}
        onOpenChange={(open) => {
          if (!open && !permModalSaving) closePermModal()
        }}
        onDisplayNameChange={setPermModalDisplayName}
        onToggleKey={togglePermSelection}
        onToggleSection={togglePermSection}
        onSave={() => void handleSaveRolePermissions()}
      />

      <RootsConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open && !actionKey) setConfirmAction(null)
        }}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        busy={Boolean(actionKey)}
        busyConfirmLabel="Procesando…"
        destructive
        onConfirm={() => void runConfirmAction()}
      />
    </>
  )
}

export default HrPage
