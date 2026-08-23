"use client"

import { ChatChannelImageUploadField } from "@/app/[siteId]/[popId]/chat/ChatChannelImageUploadField"
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
import {
  RootsFormCheckboxChoiceRow,
  RootsFormTextField,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { useEffect, useMemo, useState, type FormEvent } from "react"

const OWNER_ROLE_ID = "__owner__"

type Props = {
  open: boolean
  mode: "create" | "edit"
  isEquipo: boolean
  saving: boolean
  banner: string | null
  popId: string
  currentUserId: string
  members: ChatEligibleUser[]
  roles: ChatRoleOption[]
  initialTitle?: string
  initialSubtitle?: string
  initialImageUrl?: string | null
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
  popId,
  currentUserId,
  members,
  roles,
  initialTitle,
  initialSubtitle,
  initialImageUrl,
  initialUserIds,
  onOpenChange,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setTitle(mode === "edit" ? (initialTitle ?? "") : "")
    setSubtitle(mode === "edit" ? (initialSubtitle ?? "") : "")
    setImageUrl(mode === "edit" ? (initialImageUrl ?? "").trim() : "")
    const start = new Set(initialUserIds ?? [])
    start.add(currentUserId)
    setSelected([...start])
  }, [
    open,
    mode,
    initialTitle,
    initialSubtitle,
    initialImageUrl,
    initialUserIds,
    currentUserId,
  ])

  const selectedSet = useMemo(() => new Set(selected), [selected])

  const roleOptions = useMemo(() => {
    const rows = [...roles]
    if (members.some((member) => !member.roleId)) {
      rows.unshift({ id: OWNER_ROLE_ID, displayName: "Propietario" })
    }
    return rows
  }, [members, roles])

  const membersOfRole = (roleId: string) =>
    members.filter((member) =>
      roleId === OWNER_ROLE_ID ? !member.roleId : member.roleId === roleId,
    )

  const roleCheckState = (roleId: string): CheckedState => {
    const inRole = membersOfRole(roleId)
    if (inRole.length === 0) return false
    const selectedCount = inRole.filter((member) =>
      selectedSet.has(member.userId),
    ).length
    if (selectedCount === 0) return false
    if (selectedCount === inRole.length) return true
    return "indeterminate"
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

  const toggleRole = (roleId: string) => {
    const inRole = membersOfRole(roleId)
    const fullySelected = roleCheckState(roleId) === true
    setSelected((prev) => {
      const next = new Set(prev)
      if (fullySelected) {
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
      imageUrl: imageUrl.trim(),
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
            <ChatChannelImageUploadField
              id="chat-channel-image"
              popId={popId}
              value={imageUrl}
              onChange={setImageUrl}
              disabled={saving}
            />
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
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {roleOptions.map((role) => {
                  const inRole = membersOfRole(role.id)
                  if (inRole.length === 0) return null
                  return (
                    <div key={role.id}>
                      <RootsFormCheckboxChoiceRow
                        label={role.displayName}
                        checked={roleCheckState(role.id)}
                        emphasized
                        className="min-h-10"
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <div className="pl-6">
                        {inRole.map((member) => {
                          const isSelf = member.userId === currentUserId
                          return (
                            <RootsFormCheckboxChoiceRow
                              key={member.userId}
                              label={
                                isSelf
                                  ? `${chatPersonName(member.firstName, member.lastName)} (vos)`
                                  : chatPersonName(member.firstName, member.lastName)
                              }
                              checked={selectedSet.has(member.userId)}
                              disabled={isSelf}
                              className="min-h-9"
                              onCheckedChange={(checked) =>
                                toggleUser(member.userId, checked)
                              }
                            />
                          )
                        })}
                      </div>
                    </div>
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
