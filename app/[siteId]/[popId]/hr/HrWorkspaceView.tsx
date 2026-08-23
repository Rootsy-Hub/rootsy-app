"use client"

import type {
  EmployeeRow,
  MemberRow,
  PendingInviteRow,
  PermissionCatalogRow,
  PopRoleRow,
  UpsertEmployeeInput,
} from "@/app/[siteId]/[popId]/hr/hrTypes"
import { buildHrPermissionSectionsForPop } from "@/lib/hrPermissionCatalog"
import {
  clockEmployeeIn,
  clockEmployeeOut,
  createPopRole,
  deactivatePopMember,
  deleteInactivePopMember,
  reactivatePopMember,
  deletePopRole,
  fetchHrDashboard,
  getRolePermissionsEditorData,
  inviteUserToPop,
  markEmployeeLeft,
  markEmployeeReturned,
  renewPopInvitation,
  revokePopInvitation,
  savePopRolePermissions,
  updatePopMemberRole,
  upsertPopEmployee,
} from "@/lib/rootsyApi/hrClient"
import { HrChangeRoleDialog } from "@/app/[siteId]/[popId]/hr/HrChangeRoleDialog"
import { HrInviteDialog, type HrInviteResult } from "@/app/[siteId]/[popId]/hr/HrInviteDialog"
import { HrPageSkeleton } from "@/app/[siteId]/[popId]/hr/HrPageSkeleton"
import { HrPersonCard } from "@/app/[siteId]/[popId]/hr/HrPersonCard"
import { HrPersonDialog } from "@/app/[siteId]/[popId]/hr/HrPersonDialog"
import { HrRolePermissionsDialog } from "@/app/[siteId]/[popId]/hr/HrRolePermissionsDialog"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import { DataWorkspaceHeaderTooltipIconButton } from "@/components/layouts/DataWorkspaceHeaderTooltipIconButton"
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
import { KeyRound, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type PeopleFilter = "negocio" | "local" | "acceso" | "invitadas" | "baja"

function pendingInviteForPerson(
  person: EmployeeRow,
  invites: PendingInviteRow[],
): PendingInviteRow | null {
  const byEmployee = invites.find((invite) => invite.employeeId === person.id)
  if (byEmployee) return byEmployee
  const email = person.email?.trim().toLowerCase()
  if (!email) return null
  return (
    invites.find((invite) => invite.email.trim().toLowerCase() === email) ?? null
  )
}

type ConfirmAction =
  | { kind: "delete-role"; role: PopRoleRow }
  | { kind: "deactivate"; member: MemberRow }
  | { kind: "reactivate"; member: MemberRow }
  | { kind: "delete-member"; member: MemberRow }
  | { kind: "revoke"; invite: PendingInviteRow }
  | { kind: "leave"; person: EmployeeRow }
  | { kind: "return"; person: EmployeeRow }

function memberDisplayName(member: MemberRow): string {
  return `${member.firstName} ${member.lastName}`.trim() || "Sin nombre"
}

function personDisplayName(person: EmployeeRow): string {
  return `${person.firstName} ${person.lastName}`.trim() || "Sin nombre"
}

function isStubPersonName(person: EmployeeRow): boolean {
  const first = person.firstName.trim()
  const last = person.lastName.trim()
  return !first || (first === "Sin" && !last)
}

function personForCard(
  person: EmployeeRow,
  member?: MemberRow,
): EmployeeRow {
  if (!member || !isStubPersonName(person)) return person
  const first = member.firstName.trim()
  const last = member.lastName.trim()
  if (!first && !last) return person
  return {
    ...person,
    firstName: first || person.firstName,
    lastName: last || person.lastName,
  }
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

export function HrWorkspaceView() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const {
    bootstrap,
    popAccess,
    loading: bootstrapLoading,
    error: bootstrapError,
    refresh,
  } = usePopWorkspace()

  const hrSections = useMemo(
    () =>
      buildHrPermissionSectionsForPop({
        businessTypeName:
          popAccess?.subscription.businessTypeName || "platform_full",
        allModules: popAccess?.limits.allModules ?? true,
        extraModuleKeys: popAccess?.enabledModules
          .filter((mod) => mod.isExtra)
          .map((mod) => mod.key),
      }),
    [popAccess],
  )
  const hrCatalogRows = useMemo(
    () => hrSections.flatMap((section) => section.permissions),
    [hrSections],
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canManageInvites, setCanManageInvites] = useState(false)
  const [canManagePeople, setCanManagePeople] = useState(false)
  const [roles, setRoles] = useState<PopRoleRow[]>([])
  const [members, setMembers] = useState<MemberRow[]>([])
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [pending, setPending] = useState<PendingInviteRow[]>([])
  const [peopleFilter, setPeopleFilter] = useState<PeopleFilter>("negocio")
  const [banner, setBanner] = useState<{
    type: "ok" | "err" | "info"
    text: string
  } | null>(null)

  const [personOpen, setPersonOpen] = useState(false)
  const [personEditing, setPersonEditing] = useState<EmployeeRow | null>(null)
  const [personSaving, setPersonSaving] = useState(false)
  const [personError, setPersonError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invitePerson, setInvitePerson] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)
  const inviteEmail = invitePerson?.email ?? ""
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteResult, setInviteResult] = useState<HrInviteResult | null>(null)
  const [roleMember, setRoleMember] = useState<MemberRow | null>(null)
  const [roleSaving, setRoleSaving] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
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
    const res = await fetchHrDashboard(popId)
    if (!res.success) {
      setError(res.error)
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1600)
      }
      return
    }
    setError(null)
    setCanManageInvites(res.canManageInvites)
    setCanManagePeople(res.canManagePeople)
    setRoles(res.roles)
    setMembers(res.members)
    setEmployees(res.employees)
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

  const activePeople = useMemo(
    () => employees.filter((person) => !person.leftAt),
    [employees],
  )
  const peopleInLocal = useMemo(
    () => activePeople.filter((person) => person.isClockedIn),
    [activePeople],
  )
  const peopleWithAccess = useMemo(
    () =>
      activePeople.filter((person) =>
        members.some(
          (member) => member.userId === person.userId && member.isActive,
        ),
      ),
    [activePeople, members],
  )
  const peopleLeft = useMemo(
    () => employees.filter((person) => Boolean(person.leftAt)),
    [employees],
  )
  const peopleInvited = useMemo(
    () =>
      activePeople.filter((person) =>
        Boolean(pendingInviteForPerson(person, pending)),
      ),
    [activePeople, pending],
  )
  const visiblePeople = useMemo(() => {
    if (peopleFilter === "local") return peopleInLocal
    if (peopleFilter === "acceso") return peopleWithAccess
    if (peopleFilter === "invitadas") return peopleInvited
    if (peopleFilter === "baja") return peopleLeft
    return activePeople
  }, [
    peopleFilter,
    activePeople,
    peopleInLocal,
    peopleWithAccess,
    peopleInvited,
    peopleLeft,
  ])

  const activeMembers = useMemo(
    () => members.filter((member) => member.isActive),
    [members],
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
      return {
        title: "",
        description: "",
        confirmLabel: "Confirmar",
        destructive: true,
      }
    }
    if (confirmAction.kind === "delete-role") {
      return {
        title: "Eliminar rol",
        description: `¿Eliminar “${confirmAction.role.displayName}”? Se quitan sus permisos y no se va a poder usar en invitaciones nuevas.`,
        confirmLabel: "Eliminar rol",
        destructive: true,
      }
    }
    if (confirmAction.kind === "deactivate") {
      return {
        title: "Quitar acceso a Rootsy",
        description: `¿Sacar a ${memberDisplayName(confirmAction.member)} de Rootsy en este local? Sigue en el equipo. No va a poder abrir el sistema.`,
        confirmLabel: "Quitar acceso",
        destructive: true,
      }
    }
    if (confirmAction.kind === "reactivate") {
      return {
        title: "Restaurar acceso a Rootsy",
        description: `¿${memberDisplayName(confirmAction.member)} vuelve a entrar a este local con el rol ${confirmAction.member.roleDisplayName}?`,
        confirmLabel: "Restaurar acceso",
        destructive: false,
      }
    }
    if (confirmAction.kind === "revoke") {
      return {
        title: "Revocar invitación",
        description: `¿Cancelar la invitación a ${confirmAction.invite.email}? Ya no va a poder entrar con ese enlace.`,
        confirmLabel: "Revocar",
        destructive: true,
      }
    }
    if (confirmAction.kind === "leave") {
      const stillHasAccess = Boolean(
        confirmAction.person.userId &&
          members.some(
            (item) =>
              item.userId === confirmAction.person.userId &&
              item.isActive &&
              !item.isOwner,
          ),
      )
      return {
        title: "Ya no trabaja acá",
        description: stillHasAccess
          ? `¿${personDisplayName(confirmAction.person)} deja de trabajar acá? Queda en el historial. El acceso a Rootsy se saca aparte.`
          : `¿${personDisplayName(confirmAction.person)} deja de trabajar acá? Queda en el historial.`,
        confirmLabel: "Ya no trabaja acá",
        destructive: true,
      }
    }
    if (confirmAction.kind === "return") {
      return {
        title: "Volver al equipo",
        description: `¿${personDisplayName(confirmAction.person)} vuelve a trabajar acá? El acceso a Rootsy se da aparte, si lo necesita.`,
        confirmLabel: "Volver al equipo",
        destructive: false,
      }
    }
    return {
      title: "Eliminar usuario",
      description: `¿Eliminar a ${memberDisplayName(confirmAction.member)} de este negocio? No va a figurar más en RRHH.`,
      confirmLabel: "Eliminar",
      destructive: true,
    }
  }, [confirmAction, members])

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
    setPermModalList(hrCatalogRows)
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
    setPermModalList(hrCatalogRows)
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
    setPermModalList(hrCatalogRows)
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

  const openInvite = (person: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
  }) => {
    setInvitePerson({
      id: person.id,
      name: `${person.firstName} ${person.lastName}`.trim() || "Sin nombre",
      email: person.email?.trim() ?? "",
    })
    setInviteError(null)
    setInviteResult(null)
    setInviteOpen(true)
  }

  const handleInvite = async (input: { roleId: string; message: string }) => {
    if (!popId || !siteId || !canManageInvites || !invitePerson) return
    setInviting(true)
    setInviteError(null)
    const res = await inviteUserToPop(
      popId,
      invitePerson.email,
      input.roleId,
      input.message || null,
      invitePerson.id,
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
    await loadDashboard()
  }

  const openChangeRole = (member: MemberRow) => {
    setRoleMember(member)
    setRoleError(null)
  }

  const handleChangeRole = async (roleId: string) => {
    if (!popId || !siteId || !roleMember) return
    setRoleSaving(true)
    setRoleError(null)
    const res = await updatePopMemberRole(popId, roleMember.userId, roleId)
    setRoleSaving(false)
    if (!res.success) {
      setRoleError(res.error || "No se pudo cambiar el rol.")
      return
    }
    setRoleMember(null)
    setBanner({ type: "ok", text: "Rol de Rootsy actualizado." })
    await Promise.all([loadDashboard(), refresh()])
  }

  const openNewPerson = () => {
    setPersonEditing(null)
    setPersonError(null)
    setPersonOpen(true)
  }

  const handleSavePerson = async (input: UpsertEmployeeInput) => {
    if (!popId) return
    setPersonSaving(true)
    setPersonError(null)
    const res = await upsertPopEmployee(popId, input)
    setPersonSaving(false)
    if (!res.success) {
      setPersonError(res.error)
      return
    }
    setPersonOpen(false)
    setPersonEditing(null)
    setBanner({
      type: "ok",
      text: input.id ? "Persona actualizada." : "Persona cargada en el negocio.",
    })
    await loadDashboard()
    const createdEmail = input.email.trim()
    if (!input.id && createdEmail && canManageInvites) {
      openInvite({
        id: res.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: createdEmail,
      })
    }
  }

  const handleClock = async (person: EmployeeRow) => {
    if (!popId) return
    setActionKey(`clock-${person.id}`)
    const res = person.isClockedIn
      ? await clockEmployeeOut(popId, person.id)
      : await clockEmployeeIn(popId, person.id)
    setActionKey(null)
    if (!res.success) {
      setBanner({ type: "err", text: res.error || "No se pudo marcar." })
      return
    }
    setBanner({
      type: "ok",
      text: person.isClockedIn
        ? `${personDisplayName(person)} salió del local.`
        : `${personDisplayName(person)} entró al local.`,
    })
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

  const handleRenewInvite = async (invite: PendingInviteRow) => {
    if (!popId || !siteId) return
    setActionKey(`renew-${invite.id}`)
    const res = await renewPopInvitation(popId, invite.id)
    setActionKey(null)
    if (!res.success) {
      setBanner({ type: "err", text: res.error || "No se pudo renovar." })
      return
    }
    setBanner({
      type: "ok",
      text: "Invitación renovada. El enlace sirve 7 días más.",
    })
    await loadDashboard()
  }

  const runConfirmAction = async () => {
    if (!popId || !siteId || !confirmAction) return

    if (confirmAction.kind === "revoke") {
      await handleRevoke(confirmAction.invite.id)
      return
    }

    if (confirmAction.kind === "return") {
      setActionKey(`return-${confirmAction.person.id}`)
      const res = await markEmployeeReturned(popId, confirmAction.person.id)
      setActionKey(null)
      if (!res.success) {
        setBanner({ type: "err", text: res.error || "No se pudo volver a cargar." })
        return
      }
      setConfirmAction(null)
      setPeopleFilter("negocio")
      setBanner({
        type: "ok",
        text: confirmAction.person.userId
          ? "Volvió al equipo. Si tiene que entrar a Rootsy, restaurá el acceso desde la ficha."
          : "Volvió al equipo. El acceso a Rootsy se da aparte.",
      })
      await loadDashboard()
      return
    }

    if (confirmAction.kind === "leave") {
      setActionKey(`leave-${confirmAction.person.id}`)
      const res = await markEmployeeLeft(popId, confirmAction.person.id)
      setActionKey(null)
      if (!res.success) {
        setBanner({ type: "err", text: res.error || "No se pudo registrar." })
        return
      }
      setConfirmAction(null)
      setBanner({
        type: "ok",
        text: "Quedó en el historial. Ya no trabaja acá.",
      })
      await loadDashboard()
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
      setBanner({ type: "ok", text: "Ya no entra a Rootsy. Sigue en el equipo." })
      await loadDashboard()
      return
    }

    if (confirmAction.kind === "reactivate") {
      setActionKey(`react-${confirmAction.member.userId}`)
      const res = await reactivatePopMember(popId, confirmAction.member.userId)
      setActionKey(null)
      if (!res.success) {
        setBanner({
          type: "err",
          text: res.error || "No se pudo restaurar el acceso.",
        })
        return
      }
      setConfirmAction(null)
      setBanner({ type: "ok", text: "Ya puede entrar al pop de nuevo." })
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

  const peopleFilterOptions = [
    { value: "negocio", label: "Todas" },
    { value: "local", label: "En el local" },
    { value: "acceso", label: "Con Rootsy" },
    { value: "invitadas", label: "Invitadas" },
    { value: "baja", label: "Ya no" },
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
        headerActions={
          <>
            {siteId && popId ? (
              <DataWorkspaceHeaderTooltipIconButton
                label="Fichar"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                onClick={() => router.push(`/${siteId}/${popId}/hr/fichar`)}
              >
                <KeyRound className="size-5" aria-hidden />
              </DataWorkspaceHeaderTooltipIconButton>
            ) : null}
            {canManagePeople ? (
              <DataWorkspaceHeaderTooltipIconButton
                label="Cargar persona"
                headerVariant={dataWorkspaceModuleHeaderVariant}
                primary
                onClick={openNewPerson}
              >
                <Plus className="size-5" aria-hidden />
              </DataWorkspaceHeaderTooltipIconButton>
            ) : null}
          </>
        }
        mainMaxWidthClass="max-w-none"
        mainClassName={dataWorkspaceBlocksPageMainClass}
      >
        <div className={dataWorkspaceBlocksPageContentClass}>
          {bootstrapError ? (
            <RootsBanner
              intent="danger"
              layout="message"
              message={`Cabecera: ${bootstrapError}`}
            />
          ) : null}

          {pageLoading ? (
            <HrPageSkeleton />
          ) : error ? (
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

              <DataWorkspaceBlocksSection>
                <RootsFormSegmentField
                  label="Ver personas"
                  aria-label="Filtrar personas"
                  layout="inline"
                  className="[&>span:first-child]:sr-only"
                  groupClassName="border-0"
                  value={peopleFilter}
                  onValueChange={(value) => setPeopleFilter(value as PeopleFilter)}
                  options={peopleFilterOptions}
                />

                {visiblePeople.length === 0 ? (
                  <p className={dataWorkspaceBlocksEmptyStateClass}>
                    {peopleFilter === "local"
                      ? "Nadie está en el local ahora."
                      : peopleFilter === "acceso"
                        ? "Nadie de estas personas usa Rootsy todavía."
                        : peopleFilter === "invitadas"
                          ? "Nadie tiene una invitación pendiente."
                          : peopleFilter === "baja"
                            ? "Nadie figura como que ya no trabaja acá."
                            : "Todavía no hay personas cargadas."}
                  </p>
                ) : (
                  <div className={dataWorkspaceEntityCardsGridClass}>
                    {visiblePeople.map((person) => {
                      const member = members.find(
                        (item) => item.userId === person.userId,
                      )
                      const invite = pendingInviteForPerson(person, pending)
                      const cardPerson = personForCard(person, member)
                      return (
                        <HrPersonCard
                          key={person.id}
                          person={cardPerson}
                          imageUrl={member?.imageUrl}
                          isOwner={Boolean(member?.isOwner)}
                          rootsyRole={
                            member?.isActive ? member.roleDisplayName : null
                          }
                          pendingInvite={invite}
                          canManagePeople={canManagePeople}
                          canManageInvites={canManageInvites}
                          detailHref={`/${siteId}/${popId}/hr/${person.id}`}
                          clockBusy={actionKey === `clock-${person.id}`}
                          inviteBusy={
                            invite
                              ? actionKey === `revoke-${invite.id}` ||
                                actionKey === `renew-${invite.id}`
                              : false
                          }
                          onOpen={() => {
                            setPersonEditing(cardPerson)
                            setPersonError(null)
                            setPersonOpen(true)
                          }}
                          onClock={() => void handleClock(person)}
                          onInvite={() => openInvite(person)}
                          onCopyInvite={
                            invite
                              ? () => void copyInviteUrl(invite.inviteUrl)
                              : undefined
                          }
                          onRenewInvite={
                            invite
                              ? () => void handleRenewInvite(invite)
                              : undefined
                          }
                          onRevokeInvite={
                            invite
                              ? () =>
                                  setConfirmAction({ kind: "revoke", invite })
                              : undefined
                          }
                          onChangeRole={
                            member &&
                            member.isActive &&
                            !member.isOwner &&
                            assignableRoles.length > 0
                              ? () => openChangeRole(member)
                              : undefined
                          }
                          onRevokeAccess={
                            member && member.isActive && !member.isOwner
                              ? () =>
                                  setConfirmAction({
                                    kind: "deactivate",
                                    member,
                                  })
                              : undefined
                          }
                          onRestoreAccess={
                            member && !member.isActive && !member.isOwner && !person.leftAt
                              ? () =>
                                  setConfirmAction({
                                    kind: "reactivate",
                                    member,
                                  })
                              : undefined
                          }
                          onLeave={() =>
                            setConfirmAction({ kind: "leave", person })
                          }
                          onReturn={() =>
                            setConfirmAction({ kind: "return", person })
                          }
                        />
                      )
                    })}
                  </div>
                )}
              </DataWorkspaceBlocksSection>

              <DataWorkspaceBlocksSection
                title="Si entra a Rootsy"
                description="Qué puede hacer en el sistema. Distinto del puesto en el local."
                action={
                  canManageInvites ? (
                    <RootsDefaultButton
                      type="button"
                      size="compact"
                      disabled={permModalLoading || permModalSaving}
                      onClick={handleOpenCreateRole}
                    >
                      Nuevo rol
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
                                  ? `${membersByRoleId.get(role.id) ?? 0} con acceso`
                                  : "Plantilla de Rootsy"
                              }
                            />
                            {canManageInvites && role.popId ? (
                              <div className="flex shrink-0 items-center gap-2">
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
                              </div>
                            ) : null}
                          </HrRow>
                        </li>
                      ))}
                    </ul>
                  </HrLoseta>
                )}
              </DataWorkspaceBlocksSection>
            </>
          )}
        </div>
      </DataWorkspaceModuleLayout>

      <HrPersonDialog
        open={personOpen}
        person={personEditing}
        readOnly={!canManagePeople}
        saving={personSaving}
        error={personError}
        onOpenChange={(open) => {
          if (!open && !personSaving) {
            setPersonOpen(false)
            setPersonEditing(null)
            setPersonError(null)
          }
        }}
        onSubmit={handleSavePerson}
      />

      <HrChangeRoleDialog
        open={roleMember !== null}
        personName={roleMember ? memberDisplayName(roleMember) : ""}
        roles={assignableRoles}
        currentRoleId={roleMember?.roleId ?? ""}
        saving={roleSaving}
        error={roleError}
        onOpenChange={(open) => {
          if (!open && !roleSaving) {
            setRoleMember(null)
            setRoleError(null)
          }
        }}
        onSubmit={handleChangeRole}
      />

      <HrInviteDialog
        open={inviteOpen}
        roles={assignableRoles}
        personName={invitePerson?.name ?? ""}
        email={inviteEmail}
        saving={inviting}
        error={inviteError}
        result={inviteResult}
        onOpenChange={(open) => {
          if (!open && !inviting) {
            setInviteOpen(false)
            setInvitePerson(null)
            setInviteError(null)
            setInviteResult(null)
          }
        }}
        onSubmit={handleInvite}
        onCreateRole={() => {
          setInviteOpen(false)
          setInvitePerson(null)
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
        sections={hrSections}
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
        destructive={confirmCopy.destructive}
        onConfirm={() => void runConfirmAction()}
      />
    </>
  )
}

