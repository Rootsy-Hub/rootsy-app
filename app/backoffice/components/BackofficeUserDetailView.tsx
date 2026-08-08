"use client"

import type {
  BackofficeUserDetail,
  BackofficeUserMembershipPop,
  BackofficeUserPopSummary,
} from "@/app/backoffice/actions"
import {
  BackofficeEmptyState,
  BackofficeStatusBadge,
  formatBackofficeDate,
  formatBackofficeMoney,
} from "@/app/backoffice/components/BackofficeSection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Store, Users } from "lucide-react"
import type { ReactNode } from "react"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground sm:text-right">{children}</dd>
    </div>
  )
}

function PopNameCell({ pop }: { pop: BackofficeUserPopSummary }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9 rounded-lg border border-border/70">
        <AvatarImage src={pop.imageUrl ?? undefined} alt="" />
        <AvatarFallback className="rounded-lg text-xs">
          {initials(pop.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{pop.name}</div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {pop.id}
        </div>
      </div>
    </div>
  )
}

function formatLastPayment(pop: BackofficeUserPopSummary): string {
  if (!pop.lastPaymentAt) return "—"
  const amount =
    pop.lastPaymentAmount != null
      ? `${formatBackofficeMoney(pop.lastPaymentAmount)} · `
      : ""
  return `${amount}${formatBackofficeDate(pop.lastPaymentAt)}`
}

function OwnedPopsTable({ pops }: { pops: BackofficeUserPopSummary[] }) {
  if (pops.length === 0) {
    return (
      <BackofficeEmptyState message="Este usuario no es titular de ningún POP." />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>POP</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Último pago</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pops.map((pop) => (
          <TableRow key={pop.id}>
            <TableCell>
              <PopNameCell pop={pop} />
            </TableCell>
            <TableCell>
              <BackofficeStatusBadge active={pop.isActive} />
            </TableCell>
            <TableCell>
              {pop.businessTypeDisplayName ?? pop.businessTypeName ?? "—"}
            </TableCell>
            <TableCell>{pop.planDisplayName ?? pop.planName ?? "—"}</TableCell>
            <TableCell>{formatLastPayment(pop)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MemberPopsTable({ pops }: { pops: BackofficeUserMembershipPop[] }) {
  if (pops.length === 0) {
    return (
      <BackofficeEmptyState message="No pertenece a otros POPs como miembro." />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>POP</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Membresía</TableHead>
          <TableHead>Estado POP</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pops.map((pop) => (
          <TableRow key={`${pop.id}-${pop.roleName}`}>
            <TableCell>
              <PopNameCell pop={pop} />
            </TableCell>
            <TableCell>{pop.roleDisplayName || pop.roleName || "—"}</TableCell>
            <TableCell>
              <BackofficeStatusBadge
                active={pop.membershipActive}
                activeLabel="Activa"
                inactiveLabel="Inactiva"
              />
            </TableCell>
            <TableCell>
              <BackofficeStatusBadge active={pop.isActive} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function BackofficeUserDetailView({
  detail,
  onBack,
}: {
  detail: BackofficeUserDetail
  onBack: () => void
}) {
  return (
    <div className="space-y-8">
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-4 gap-2 px-0 hover:bg-transparent"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a la lista
        </Button>

        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="size-16 border border-border/80">
            <AvatarImage src={detail.imageUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initials(detail.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {detail.fullName}
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {detail.id}
            </p>
          </div>
        </div>
      </div>

      <article className="space-y-4 rounded-2xl border border-border/80 bg-card/40 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4 text-primary" aria-hidden />
          Datos del usuario
        </div>
        <dl className="space-y-3">
          <InfoRow label="Email">{detail.email ?? "—"}</InfoRow>
          <InfoRow label="Nombre">{detail.firstName || "—"}</InfoRow>
          <InfoRow label="Apellido">{detail.lastName || "—"}</InfoRow>
          <InfoRow label="País">{detail.country ?? "—"}</InfoRow>
          <InfoRow label="Idioma">{detail.language ?? "—"}</InfoRow>
          <InfoRow label="Registro">
            {formatBackofficeDate(detail.createdAt)}
          </InfoRow>
        </dl>
      </article>

      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="size-4 text-primary" aria-hidden />
            <h3 className="text-lg font-semibold">POPs como titular</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Puntos de venta donde es owner, con subscripción y último pago.
          </p>
        </div>
        <OwnedPopsTable pops={detail.ownedPops} />
      </section>

      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" aria-hidden />
            <h3 className="text-lg font-semibold">POPs donde participa</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Accesos como miembro del equipo y rol asignado.
          </p>
        </div>
        <MemberPopsTable pops={detail.memberPops} />
      </section>
    </div>
  )
}
