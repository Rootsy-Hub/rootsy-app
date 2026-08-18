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
  dataWorkspaceEntityCardStatusInactiveClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
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
  RootsPrimaryButton,
} from "@/components/rootsy-button"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import { Clock3, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"

type ConfirmAction =
  | { kind: "delete-role"; role: PopRoleRow }
  | { kind: "deactivate"; member: MemberRow }
  | { kind: "delete-member"; member: MemberRow }

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

function HrSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className={dataWorkspaceBlocksSectionTitleClass}>{title}</h2>
        {description ? (
          <p className={dataWorkspaceBlocksSectionDescriptionClass}>{description}</p>
        ) : null}
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
    <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, className)}>
      {children}
    </article>
  )
}

function HrPersonAvatar({
  member,
  muted,
}: {
  member: MemberRow
  muted?: boolean
}) {
  if (member.imageUrl) {
    return (
      <img
        src={member.imageUrl}
        alt=""
        className={cn(dataWorkspaceEntityCardIsotypeClass, "size-11 object-cover")}
      />
    )
  }

  return (
    <div
      className={cn(
        dataWorkspaceEntityCardIsotypeClass,
        "font-canopy text-xs font-semibold",
        muted && "bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-500)]",
      )}
      aria-hidden
    >
      {memberInitials(member)}
    </div>
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
  const [banner, setBanner] = useState<{
    type: "ok" | "err" | "info"
    text: string
  } | null>(null)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRoleId, setInviteRoleId] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [inviting, setInviting] = useState(false)
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null)
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
    setInviteRoleId((prev) => {
      if (prev) return prev
      const assignable = res.roles.find((role) => role.name !== "owner")
      return assignable?.id ?? ""
    })
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

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault()
    if (!popId || !siteId || !canManageInvites) return
    setInviting(true)
    setBanner(null)
    setLastInviteUrl(null)
    const res = await inviteUserToPop(
      popId,
      inviteEmail,
      inviteRoleId,
      inviteMessage || null,
    )
    setInviting(false)
    if (!res.success) {
      setBanner({ type: "err", text: res.error })
      return
    }
    setLastInviteUrl(res.inviteUrl)
    setInviteEmail("")
    setInviteMessage("")
    let bannerText: string
    if (res.emailSent) {
      bannerText = "Invitación enviada por correo."
    } else if (!res.resendConfigured) {
      bannerText =
        "Invitación creada. No hay RESEND_API_KEY en el servidor: compartí el enlace de abajo."
    } else if (res.emailError) {
      bannerText = `Invitación creada pero falló el correo: ${res.emailError}. Compartí el enlace manualmente.`
    } else {
      bannerText =
        "Invitación creada. Compartí el enlace si la persona no recibió el correo."
    }
    setBanner({ type: "ok", text: bannerText })
    await loadDashboard()
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
    setBanner({ type: "ok", text: "Invitación revocada." })
    await loadDashboard()
  }

  const runConfirmAction = async () => {
    if (!popId || !siteId || !confirmAction) return

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

  const copyInviteUrl = () => {
    if (!lastInviteUrl) return
    void navigator.clipboard.writeText(lastInviteUrl)
    setBanner({ type: "ok", text: "Enlace copiado al portapapeles." })
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">ID de POP no encontrado</p>
      </div>
    )
  }

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
            <DataWorkspaceHeaderIconButton
              label="Nuevo rol"
              headerVariant={dataWorkspaceModuleHeaderVariant}
              primary
              disabled={
                permModalLoading ||
                permModalSaving ||
                Boolean(actionKey?.startsWith("del-role-"))
              }
              onClick={handleOpenCreateRole}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
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

              {lastInviteUrl ? (
                <HrLoseta className="gap-3 p-5">
                  <p className={dataWorkspaceEntityCardEyebrowClass}>
                    Enlace de invitación
                  </p>
                  <p className="break-all font-canopy text-sm text-[var(--rootsy-bruma-900)]">
                    {lastInviteUrl}
                  </p>
                  <RootsDefaultButton
                    type="button"
                    size="compact"
                    onClick={copyInviteUrl}
                  >
                    Copiar enlace
                  </RootsDefaultButton>
                </HrLoseta>
              ) : null}

              <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <div className="space-y-8 lg:col-span-5">
                  <HrSection
                    title="Roles"
                    description="Plantillas de permisos para invitar al equipo (Mozos, Administración, etc.)."
                  >
                    {roles.length === 0 ? (
                      <p className={dataWorkspaceBlocksEmptyStateClass}>
                        No hay roles cargados.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {roles.map((role) => (
                          <li key={role.id}>
                            <HrLoseta className="p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 space-y-1">
                                  <h3 className={dataWorkspaceEntityCardTitleClass}>
                                    {role.displayName}
                                  </h3>
                                  <p className={dataWorkspaceEntityCardEyebrowClass}>
                                    {role.popId
                                      ? `${membersByRoleId.get(role.id) ?? 0} miembro(s) · Rol del POP`
                                      : "Rol de sistema"}
                                  </p>
                                </div>
                                {canManageInvites && role.popId ? (
                                  <div className="flex shrink-0 flex-wrap gap-2">
                                    <RootsDefaultButton
                                      type="button"
                                      size="compact"
                                      disabled={
                                        Boolean(actionKey?.startsWith("del-role-")) ||
                                        permModalLoading ||
                                        permModalSaving
                                      }
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
                                        setConfirmAction({ kind: "delete-role", role })
                                      }
                                    >
                                      Eliminar
                                    </RootsDangerSubtleButton>
                                  </div>
                                ) : (
                                  <span className={dataWorkspaceEntityCardBadgeClass}>
                                    {role.popId ? "POP" : "Sistema"}
                                  </span>
                                )}
                              </div>
                            </HrLoseta>
                          </li>
                        ))}
                      </ul>
                    )}
                  </HrSection>

                  {canManageInvites ? (
                    <>
                      <HrSection
                        title="Nueva invitación"
                        description="La persona tiene que tener cuenta en Rootsy. Recibe un correo o podés compartir el enlace."
                      >
                        <HrLoseta className="p-5">
                          <form
                            onSubmit={(event) => void handleInvite(event)}
                            className="space-y-4"
                          >
                            {assignableRoles.length === 0 ? (
                              <p className="font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
                                No hay roles asignables. Creá un rol nuevo para
                                poder invitar.
                              </p>
                            ) : (
                              <>
                                <RootsFormTextField
                                  label="Correo electrónico"
                                  id="invEmail"
                                  type="email"
                                  value={inviteEmail}
                                  onChange={(event) =>
                                    setInviteEmail(event.target.value)
                                  }
                                  placeholder="nombre@ejemplo.com"
                                  autoComplete="email"
                                  required
                                />
                                <RootsFormSelectField
                                  label="Rol"
                                  id="invRole"
                                  value={inviteRoleId}
                                  onValueChange={setInviteRoleId}
                                  placeholder="Elegir rol"
                                >
                                  {assignableRoles.map((role) => (
                                    <RootsFormSelectItem key={role.id} value={role.id}>
                                      {role.displayName}
                                    </RootsFormSelectItem>
                                  ))}
                                </RootsFormSelectField>
                                <RootsFormTextareaField
                                  label="Mensaje"
                                  id="invMsg"
                                  value={inviteMessage}
                                  onChange={(event) =>
                                    setInviteMessage(event.target.value)
                                  }
                                  placeholder="Mensaje personal para la invitación"
                                  hint="Opcional"
                                />
                                <RootsPrimaryButton
                                  type="submit"
                                  disabled={!inviteRoleId}
                                  loading={inviting}
                                  loadingLabel="Enviando…"
                                >
                                  Enviar invitación
                                </RootsPrimaryButton>
                              </>
                            )}
                          </form>
                        </HrLoseta>
                      </HrSection>

                      <HrSection title="Invitaciones pendientes">
                        {pending.length === 0 ? (
                          <p className={dataWorkspaceBlocksEmptyStateClass}>
                            No hay invitaciones pendientes.
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {pending.map((invite) => (
                              <li key={invite.id}>
                                <HrLoseta className="flex flex-wrap items-center justify-between gap-3 p-4">
                                  <div className="min-w-0 space-y-1">
                                    <p className={dataWorkspaceEntityCardTitleClass}>
                                      {invite.email}
                                    </p>
                                    <p className={dataWorkspaceEntityCardEyebrowClass}>
                                      {invite.roleDisplayName}
                                    </p>
                                  </div>
                                  <RootsDefaultButton
                                    type="button"
                                    size="compact"
                                    disabled={actionKey === `revoke-${invite.id}`}
                                    loading={actionKey === `revoke-${invite.id}`}
                                    onClick={() => void handleRevoke(invite.id)}
                                  >
                                    Revocar
                                  </RootsDefaultButton>
                                </HrLoseta>
                              </li>
                            ))}
                          </ul>
                        )}
                      </HrSection>
                    </>
                  ) : (
                    <HrLoseta className="p-5">
                      <p className="font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
                        Solo el dueño del punto de venta puede enviar
                        invitaciones y editar permisos de roles.
                      </p>
                    </HrLoseta>
                  )}
                </div>

                <div className="space-y-8 lg:col-span-7">
                  <HrSection
                    title="Equipo por rol"
                    description="Personas con acceso activo a este local."
                  >
                    {groupedMembers.length === 0 ? (
                      <p className={dataWorkspaceBlocksEmptyStateClass}>
                        Todavía no hay miembros en el equipo.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {groupedMembers.map(([roleLabel, list]) => (
                          <div key={roleLabel} className="space-y-3">
                            <div className="flex items-baseline justify-between gap-2">
                              <h3 className={dataWorkspaceBlocksSectionTitleClass}>
                                {roleLabel}
                              </h3>
                              <span className="font-canopy text-[11px] tabular-nums text-[var(--rootsy-bruma-500)]">
                                {list.length}
                              </span>
                            </div>
                            <ul className="space-y-3">
                              {list.map((member) => (
                                <li key={`${member.userId}-${roleLabel}`}>
                                  <HrLoseta className="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                      <HrPersonAvatar member={member} />
                                      <div className="min-w-0 space-y-1">
                                        <p className={dataWorkspaceEntityCardTitleClass}>
                                          {memberDisplayName(member)}
                                        </p>
                                        {member.invitedAt ? (
                                          <p className="flex items-center gap-1 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                                            <Clock3
                                              className="size-3 shrink-0"
                                              aria-hidden
                                            />
                                            Desde{" "}
                                            {new Date(
                                              member.invitedAt,
                                            ).toLocaleDateString("es-AR")}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
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
                                    ) : member.isOwner ? (
                                      <span
                                        className={dataWorkspaceEntityCardStatusOpenClass}
                                      >
                                        Dueño
                                      </span>
                                    ) : null}
                                  </HrLoseta>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </HrSection>

                  <HrSection
                    title="Usuarios inactivos"
                    description="Los quitaste del equipo. Pueden volver a invitarse o eliminarlos del historial."
                  >
                    {inactiveMembers.length === 0 ? (
                      <p className={dataWorkspaceBlocksEmptyStateClass}>
                        No hay usuarios inactivos.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {inactiveMembers.map((member) => (
                          <li key={`inactive-${member.userId}-${member.roleId}`}>
                            <HrLoseta className="flex flex-wrap items-center justify-between gap-3 p-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <HrPersonAvatar member={member} muted />
                                <div className="min-w-0 space-y-1">
                                  <p className={dataWorkspaceEntityCardTitleClass}>
                                    {memberDisplayName(member)}
                                  </p>
                                  <p className={dataWorkspaceEntityCardEyebrowClass}>
                                    {member.roleDisplayName || "—"}
                                  </p>
                                </div>
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
                            </HrLoseta>
                          </li>
                        ))}
                      </ul>
                    )}
                  </HrSection>
                </div>
              </div>
            </>
          )}
        </div>
      </DataWorkspaceModuleLayout>

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
