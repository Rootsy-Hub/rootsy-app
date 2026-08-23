"use client"

import {
  chatPersonName,
  type ChatEligibleUser,
  type ChatRoleOption,
  type UpsertChatChannelInput,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsFormCheckboxChoiceRow,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useMemo, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  mode: "create" | "edit"
  isEquipo: boolean
  saving: boolean
  banner: string | null
  currentUserId: string
  members: ChatEligibleUser[]
  roles: ChatRoleOption[]
  initialTitle?: string
  initialSubtitle?: string
  initialUserIds?: string[]
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpsertChatChannelInput) => void | Promise<void>
}

export function ChatChannelDialog({
  open,
  mode,
  isEquipo,
  saving,
  banner,
  currentUserId,
  members,
  roles,
  initialTitle,
  initialSubtitle,
  initialUserIds,
  onOpenChange,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setTitle(mode === "edit" ? (initialTitle ?? "") : "")
    setSubtitle(mode === "edit" ? (initialSubtitle ?? "") : "")
    const start = new Set(initialUserIds ?? [])
    start.add(currentUserId)
    setSelected([...start])
  }, [open, mode, initialTitle, initialSubtitle, initialUserIds, currentUserId])

  const selectedSet = useMemo(() => new Set(selected), [selected])

  const allSelected =
    members.length > 0 && members.every((member) => selectedSet.has(member.userId))

  const roleFullySelected = (roleId: string) => {
    const inRole = members.filter((member) => member.roleId === roleId)
    return (
      inRole.length > 0 &&
      inRole.every((member) => selectedSet.has(member.userId))
    )
  }

  const keepSelf = (ids: Iterable<string>) => {
    const next = new Set(ids)
    next.add(currentUserId)
    return [...next]
  }

  const toggleUser = (userId: string, checked: boolean) => {
    if (userId === currentUserId) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(userId)
      else next.delete(userId)
      return keepSelf(next)
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelected([currentUserId])
      return
    }
    setSelected(keepSelf(members.map((member) => member.userId)))
  }

  const toggleRole = (roleId: string) => {
    const inRole = members.filter((member) => member.roleId === roleId)
    setSelected((prev) => {
      const next = new Set(prev)
      if (roleFullySelected(roleId)) {
        for (const member of inRole) {
          if (member.userId !== currentUserId) next.delete(member.userId)
        }
      } else {
        for (const member of inRole) next.add(member.userId)
      }
      return keepSelf(next)
    })
  }

  const canSubmit =
    (isEquipo || title.trim().length > 0) && selected.length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    void onSubmit({
      title: isEquipo ? "Equipo" : title.trim(),
      subtitle: subtitle.trim(),
      userIds: selected,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent showCloseButton={!saving}>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title={mode === "create" ? "Nuevo canal" : "Participantes"}
            description={
              mode === "create"
                ? "Nombre del canal y quiénes lo ven. Hasta 8 canales por local."
                : "Quiénes participan en este canal."
            }
          />
          <RootsDialogBody className="space-y-4">
            {isEquipo ? null : (
              <RootsFormTextField
                label="Nombre"
                id="chat-channel-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={48}
                autoComplete="off"
              />
            )}
            <RootsFormTextField
              label="Descripción"
              id="chat-channel-subtitle"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              maxLength={80}
              autoComplete="off"
            />
            <div className="space-y-2">
              <p className="font-canopy text-sm font-medium text-[var(--rootsy-bruma-800)]">
                Participantes
              </p>
              <div className="flex flex-wrap gap-1.5">
                <RootsSubtleButton
                  type="button"
                  size="compact"
                  aria-pressed={allSelected}
                  className={
                    allSelected
                      ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_12%,white)] text-[var(--rootsy-savia-800)]"
                      : undefined
                  }
                  onClick={toggleAll}
                >
                  Todos
                </RootsSubtleButton>
                {roles.map((role) => {
                  const pressed = roleFullySelected(role.id)
                  return (
                    <RootsSubtleButton
                      key={role.id}
                      type="button"
                      size="compact"
                      aria-pressed={pressed}
                      className={
                        pressed
                          ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_12%,white)] text-[var(--rootsy-savia-800)]"
                          : undefined
                      }
                      onClick={() => toggleRole(role.id)}
                    >
                      {role.displayName}
                    </RootsSubtleButton>
                  )
                })}
              </div>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--rootsy-bruma-200)] px-2 py-1">
                {members.map((member) => {
                  const isSelf = member.userId === currentUserId
                  return (
                    <RootsFormCheckboxChoiceRow
                      key={member.userId}
                      label={
                        isSelf
                          ? `${chatPersonName(member.firstName, member.lastName)} (vos)`
                          : chatPersonName(member.firstName, member.lastName)
                      }
                      description={member.roleDisplayName}
                      checked={selectedSet.has(member.userId)}
                      disabled={isSelf}
                      onCheckedChange={(checked) =>
                        toggleUser(member.userId, checked)
                      }
                    />
                  )
                })}
              </div>
            </div>
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={mode === "create" ? "Crear canal" : "Guardar"}
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
