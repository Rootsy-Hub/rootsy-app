"use client"

import {
  createPopRole,
  deactivatePopMember,
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
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import withAuth from "@/hoc/withAuth"
import { cn } from "@/lib/utils"
import {
  Clock3,
  Loader2,
  Plus,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

const shellCard = dataWorkspaceShellCard

const sectionTitleClass =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"

function groupMembersByRole(members: MemberRow[]): [string, MemberRow[]][] {
  const m = new Map<string, MemberRow[]>()
  for (const mem of members) {
    const key = mem.roleDisplayName || "—"
    if (!m.has(key)) m.set(key, [])
    m.get(key)!.push(mem)
  }
  const entries = [...m.entries()]
  entries.sort((a, b) => {
    if (a[0] === "Propietario") return -1
    if (b[0] === "Propietario") return 1
    return a[0].localeCompare(b[0], "es")
  })
  return entries
}

function memberInitials(mem: MemberRow): string {
  const a = (mem.firstName || mem.lastName || "?").slice(0, 1).toUpperCase()
  const b = mem.lastName ? mem.lastName.slice(0, 1).toUpperCase() : ""
  return `${a}${b}`.slice(0, 2)
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
      const assignable = res.roles.find((r) => r.name !== "owner")
      return assignable?.id ?? ""
    })
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("ID de POP no encontrado")
      return
    }
    let c = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await loadDashboard()
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [popId, siteId, loadDashboard])

  const pageLoading = bootstrapLoading || loading
  const popName = bootstrap?.popName ?? ""

  const groupedMembers = useMemo(() => groupMembersByRole(members), [members])
  const assignableRoles = useMemo(
    () => roles.filter((r) => r.name !== "owner"),
    [roles],
  )

  const membersByRoleId = useMemo(() => {
    const m = new Map<string, number>()
    for (const mem of members) {
      m.set(mem.roleId, (m.get(mem.roleId) ?? 0) + 1)
    }
    return m
  }, [members])

  const closePermModal = () => {
    setPermModalOpen(false)
    setPermModalMode("edit")
    setPermModalRole(null)
    setPermModalDisplayName("")
    setPermModalList([])
    setPermModalSelected([])
    setPermModalLoading(false)
    setPermModalSaving(false)
  }

  const handleOpenCreateRole = () => {
    setPermModalMode("create")
    setPermModalRole(null)
    setPermModalDisplayName("")
    setPermModalList(hrCreateRolePermissionCatalog())
    setPermModalSelected([])
    setPermModalLoading(false)
    setPermModalOpen(true)
  }

  const handleOpenEditRole = async (r: PopRoleRow) => {
    if (!popId || !siteId || !r.popId) return
    setPermModalMode("edit")
    setPermModalLoading(true)
    setPermModalRole({ id: r.id, displayName: r.displayName, name: r.name })
    setPermModalDisplayName(r.displayName)
    setPermModalList([])
    setPermModalSelected([])
    setPermModalOpen(true)
    const res = await getRolePermissionsEditorData(popId, r.id)
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
        ? prev.filter((x) => x !== grantKey)
        : [...prev, grantKey],
    )
  }

  const togglePermSection = (keys: string[], enabled: boolean) => {
    setPermModalSelected((prev) => {
      const set = new Set(prev)
      for (const k of keys) {
        if (enabled) set.add(k)
        else set.delete(k)
      }
      return [...set]
    })
  }

  const handleSaveRolePermissions = async () => {
    if (!popId || !siteId) return
    setPermModalSaving(true)

    if (permModalMode === "create") {
      const res = await createPopRole(
        popId,
        permModalDisplayName,
        permModalSelected,
      )
      setPermModalSaving(false)
      if (!res.success) {
        setBanner({ type: "err", text: res.error })
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
      setBanner({ type: "err", text: res.error })
      return
    }
    setBanner({ type: "ok", text: "Permisos del rol actualizados." })
    closePermModal()
    await Promise.all([loadDashboard(), refresh()])
  }

  const handleDeleteRole = async (r: PopRoleRow) => {
    if (!popId || !siteId || !r.popId) return
    const ok = window.confirm(
      `¿Eliminar el rol "${r.displayName}"? Se quitarán sus permisos y no podrá usarse en nuevas invitaciones.`,
    )
    if (!ok) return
    setActionKey(`del-role-${r.id}`)
    const res = await deletePopRole(popId, r.id)
    setActionKey(null)
    if (!res.success) {
      setBanner({ type: "err", text: res.error })
      return
    }
    setBanner({ type: "ok", text: "Rol eliminado." })
    await loadDashboard()
  }

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
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

  const handleDeactivate = async (userId: string) => {
    if (!popId || !siteId) return
    setActionKey(`deact-${userId}`)
    const res = await deactivatePopMember(popId, userId)
    setActionKey(null)
    if (!res.success) {
      setBanner({ type: "err", text: res.error || "No se pudo quitar al miembro." })
      return
    }
    setBanner({ type: "ok", text: "Usuario desvinculado del POP." })
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
        mainClassName="min-h-0 overflow-y-auto"
      >
        <div className="rootsy-app-light relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : (
            <>
              {banner ? (
                <div
                  role="status"
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm",
                    banner.type === "ok" &&
                      "border-emerald-500/30 bg-emerald-500/8 text-foreground",
                    banner.type === "err" &&
                      "border-destructive/30 bg-destructive/8 text-destructive",
                    banner.type === "info" &&
                      "border-border/80 bg-muted/40 text-foreground",
                  )}
                >
                  {banner.text}
                </div>
              ) : null}

              {lastInviteUrl ? (
                <div className={cn(shellCard, "px-4 py-3")}>
                  <p className={sectionTitleClass}>Enlace de invitación</p>
                  <p className="mt-2 break-all text-xs text-foreground">
                    {lastInviteUrl}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={copyInviteUrl}
                  >
                    Copiar enlace
                  </Button>
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                <div className="space-y-6 lg:col-span-5">
                  <section className={cn(shellCard, "p-5")}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Roles
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Plantillas de permisos para invitar al equipo (Mozos,
                          Administración, etc.).
                        </p>
                      </div>
                      {canManageInvites ? (
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1.5 shrink-0"
                          disabled={
                            permModalLoading ||
                            permModalSaving ||
                            actionKey?.startsWith("del-role-")
                          }
                          onClick={handleOpenCreateRole}
                        >
                          <Plus className="size-4" aria-hidden />
                          Nuevo rol
                        </Button>
                      ) : null}
                    </div>
                    {roles.length === 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">
                        No hay roles cargados.
                      </p>
                    ) : (
                      <ul className="mt-4 divide-y divide-border/60">
                        {roles.map((r) => (
                          <li
                            key={r.id}
                            className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">
                                {r.displayName}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {r.popId
                                  ? `${membersByRoleId.get(r.id) ?? 0} miembro(s) · Rol del POP`
                                  : "Rol de sistema (plantilla)"}
                              </p>
                            </div>
                            {canManageInvites && r.popId ? (
                              <div className="flex shrink-0 flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    actionKey?.startsWith("del-role-") ||
                                    permModalLoading ||
                                    permModalSaving
                                  }
                                  onClick={() => void handleOpenEditRole(r)}
                                >
                                  Permisos
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  disabled={
                                    actionKey?.startsWith("del-role-") ||
                                    permModalLoading ||
                                    permModalSaving
                                  }
                                  onClick={() => void handleDeleteRole(r)}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                {r.popId ? "POP" : "Sistema"}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {canManageInvites ? (
                    <>
                      <section className={cn(shellCard, "p-5")}>
                        <h3 className="text-sm font-semibold text-foreground">
                          Nueva invitación
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          La persona debe tener cuenta en Rootsy. Recibirá un
                          correo o podés compartir el enlace.
                        </p>
                        <form
                          onSubmit={(e) => void handleInvite(e)}
                          className="mt-4 space-y-4"
                        >
                          {assignableRoles.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No hay roles asignables. Creá roles en la base o
                              usá plantillas como Mozos.
                            </p>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="invEmail">Correo electrónico</Label>
                                <Input
                                  id="invEmail"
                                  type="email"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  placeholder="nombre@ejemplo.com"
                                  autoComplete="email"
                                  required
                                  className="bg-background"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="invRole">Rol</Label>
                                <Select
                                  value={inviteRoleId}
                                  onValueChange={setInviteRoleId}
                                  required
                                >
                                  <SelectTrigger id="invRole" className="bg-background">
                                    <SelectValue placeholder="Elegir rol" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assignableRoles.map((r) => (
                                      <SelectItem key={r.id} value={r.id}>
                                        {r.displayName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="invMsg">Mensaje (opcional)</Label>
                                <Textarea
                                  id="invMsg"
                                  value={inviteMessage}
                                  onChange={(e) =>
                                    setInviteMessage(e.target.value)
                                  }
                                  placeholder="Mensaje personal para la invitación"
                                  className="min-h-[72px] bg-background"
                                />
                              </div>
                              <Button
                                type="submit"
                                disabled={inviting || !inviteRoleId}
                                className="gap-2"
                              >
                                {inviting ? (
                                  <>
                                    <Loader2
                                      className="size-4 animate-spin"
                                      aria-hidden
                                    />
                                    Enviando…
                                  </>
                                ) : (
                                  "Enviar invitación"
                                )}
                              </Button>
                            </>
                          )}
                        </form>
                      </section>

                      <section className={cn(shellCard, "p-5")}>
                        <h3 className="text-sm font-semibold text-foreground">
                          Invitaciones pendientes
                        </h3>
                        {pending.length === 0 ? (
                          <p className="mt-3 text-sm text-muted-foreground">
                            No hay invitaciones pendientes.
                          </p>
                        ) : (
                          <ul className="mt-4 divide-y divide-border/60">
                            {pending.map((p) => (
                              <li
                                key={p.id}
                                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {p.email}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {p.roleDisplayName}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={actionKey === `revoke-${p.id}`}
                                  onClick={() => void handleRevoke(p.id)}
                                >
                                  Revocar
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    </>
                  ) : (
                    <section className={cn(shellCard, "p-5")}>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Solo el dueño del punto de venta puede enviar
                        invitaciones y editar permisos de roles.
                      </p>
                    </section>
                  )}
                </div>

                <section className={cn(shellCard, "p-5 lg:col-span-7")}>
                  <h3 className="text-sm font-semibold text-foreground">
                    Equipo por rol
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Personas con acceso activo a este local.
                  </p>
                  {groupedMembers.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Todavía no hay miembros en el equipo.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-6">
                      {groupedMembers.map(([roleLabel, list]) => (
                        <div key={roleLabel}>
                          <div className="mb-2 flex items-baseline justify-between gap-2">
                            <h4 className="text-sm font-semibold text-foreground">
                              {roleLabel}
                            </h4>
                            <span className="text-[11px] tabular-nums text-muted-foreground">
                              {list.length}
                            </span>
                          </div>
                          <ul className="divide-y divide-border/60 rounded-xl border border-border/50 bg-muted/10">
                            {list.map((mem) => (
                              <li
                                key={`${mem.userId}-${roleLabel}`}
                                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  {mem.imageUrl ? (
                                    <img
                                      src={mem.imageUrl}
                                      alt=""
                                      className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border/80"
                                    />
                                  ) : (
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/15">
                                      {memberInitials(mem)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                      {`${mem.firstName} ${mem.lastName}`.trim() ||
                                        "Sin nombre"}
                                    </p>
                                    {mem.invitedAt ? (
                                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock3
                                          className="size-3 shrink-0"
                                          aria-hidden
                                        />
                                        Desde{" "}
                                        {new Date(
                                          mem.invitedAt,
                                        ).toLocaleDateString("es-AR")}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                                {canManageInvites && !mem.isOwner ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={actionKey === `deact-${mem.userId}`}
                                    onClick={() =>
                                      void handleDeactivate(mem.userId)
                                    }
                                  >
                                    Quitar
                                  </Button>
                                ) : mem.isOwner ? (
                                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                    Dueño
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
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
        onOpenChange={(open) => {
          if (!open && !permModalSaving) closePermModal()
        }}
        onDisplayNameChange={setPermModalDisplayName}
        onToggleKey={togglePermSelection}
        onToggleSection={togglePermSection}
        onSave={() => void handleSaveRolePermissions()}
      />
    </>
  )
}

export default withAuth(HrPage)
