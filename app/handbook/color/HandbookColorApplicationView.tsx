"use client"

import { handbookColorHex } from "@/app/handbook/color/handbookColorPalettes"
import {
  applicationAtmosphereHex,
  functionalInkHex,
  functionalRecipeHex,
  HANDBOOK_FUNCTIONAL_RECIPES,
} from "@/app/handbook/color/handbookColorSpec"
import {
  handbookDocChapterClass,
  handbookDocIntroAfterClass,
  libraryDocBodyClass,
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
} from "@/app/library/libraryColorTheme"
import {
  RootsDangerButton,
  RootsDefaultButton,
  RootsIconButton,
  RootsLinkButton,
  RootsPrimaryButton,
  RootsSubtleButton,
  RootsButtonAtmosphereProvider,
} from "@/components/rootsy-button"
import { RootsDropdownSpecAnatomy } from "@/components/rootsy-dropdown"
import {
  RootsFormCheckboxField,
  RootsFormMoneyField,
  RootsFormSearchField,
  RootsFormSegmentField,
  RootsFormTextareaField,
  RootsFormTextField,
  RootsFormToneProvider,
} from "@/components/rootsy-form"
import { RootsNaturePill } from "@/components/rootsy-pill/RootsNaturePill"
import { cn } from "@/lib/utils"
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  Copy,
  Info,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useState, type CSSProperties, type ReactNode } from "react"

const SOTOBOSQUE = [
  { id: "sombra" as const, name: "Sotobosque · Sombra" },
  { id: "bruma" as const, name: "Sotobosque · Luz filtrada" },
]

type SotobosqueId = (typeof SOTOBOSQUE)[number]["id"]

function isDark(atmosphere: SotobosqueId) {
  return atmosphere === "sombra"
}

function themeClass(atmosphere: SotobosqueId) {
  return atmosphere === "sombra" ? "rootsy-theme-pos" : "rootsy-theme-workspace"
}

function frameVars(atmosphere: SotobosqueId): CSSProperties {
  return {
    "--color-fondo": applicationAtmosphereHex("fondo", atmosphere),
    "--color-superficie": applicationAtmosphereHex("superficie", atmosphere),
    "--color-elevada": applicationAtmosphereHex("elevada", atmosphere),
    "--color-borde": applicationAtmosphereHex("borde", atmosphere),
    "--color-texto": applicationAtmosphereHex("texto", atmosphere),
    "--color-texto-muted": applicationAtmosphereHex("texto-muted", atmosphere),
    backgroundColor: "var(--color-fondo)",
    color: "var(--color-texto)",
    boxShadow: "inset 0 0 0 1px var(--color-borde)",
  } as CSSProperties
}

function AtmosphereFrame({
  atmosphere,
  children,
  className,
}: {
  atmosphere: SotobosqueId
  children: ReactNode
  className?: string
}) {
  const name = SOTOBOSQUE.find((item) => item.id === atmosphere)?.name ?? atmosphere

  return (
    <RootsButtonAtmosphereProvider atmosphere={atmosphere}>
      <RootsFormToneProvider tone={atmosphere}>
        <div
          className={cn(
            "min-h-80 overflow-hidden rounded-2xl p-5 sm:p-6",
            themeClass(atmosphere),
            className,
          )}
          style={frameVars(atmosphere)}
          data-rootsy-atmosphere={atmosphere}
        >
          <p
            className="font-canopy text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--color-texto-muted)" }}
          >
            {name}
          </p>
          <div className="mt-5">{children}</div>
        </div>
      </RootsFormToneProvider>
    </RootsButtonAtmosphereProvider>
  )
}

function ExamplePair({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead: string
  children: (atmosphere: SotobosqueId) => ReactNode
}) {
  return (
    <section id={id} className={handbookDocChapterClass}>
      <h2 className={libraryDocSectionTitleClass}>{title}</h2>
      <p className={cn(libraryDocBodyClass, "mt-3 max-w-3xl")}>{lead}</p>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {SOTOBOSQUE.map((atmosphere) => (
          <AtmosphereFrame key={atmosphere.id} atmosphere={atmosphere.id}>
            {children(atmosphere.id)}
          </AtmosphereFrame>
        ))}
      </div>
    </section>
  )
}

function Surface({
  children,
  className,
  elevated = false,
}: {
  children: ReactNode
  className?: string
  elevated?: boolean
}) {
  return (
    <div
      className={cn("rounded-2xl p-4", className)}
      style={{
        backgroundColor: elevated ? "var(--color-elevada)" : "var(--color-superficie)",
        boxShadow: "inset 0 0 0 1px var(--color-borde)",
      }}
    >
      {children}
    </div>
  )
}

function Mute({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={className} style={{ color: "var(--color-texto-muted)" }}>
      {children}
    </span>
  )
}

function recipe(id: (typeof HANDBOOK_FUNCTIONAL_RECIPES)[number]["id"]) {
  return HANDBOOK_FUNCTIONAL_RECIPES.find((item) => item.id === id)!
}

function StatusBanner({
  atmosphere,
  recipeId,
  title,
  body,
}: {
  atmosphere: SotobosqueId
  recipeId: "exito" | "informacion" | "atencion" | "peligro"
  title: string
  body: string
}) {
  const item = recipe(recipeId)
  const dark = isDark(atmosphere)
  const Icon =
    recipeId === "peligro"
      ? AlertOctagon
      : recipeId === "atencion"
        ? AlertTriangle
        : recipeId === "exito"
          ? Check
          : Info

  return (
    <div
      className="flex gap-3 rounded-xl px-3 py-3"
      style={{
        backgroundColor: dark
          ? applicationAtmosphereHex("superficie", atmosphere)
          : functionalRecipeHex(item, "tintFill"),
        color: dark ? functionalInkHex(item.familyId, true) : functionalRecipeHex(item, "tintText"),
        boxShadow: `inset 0 0 0 1px ${
          dark ? functionalRecipeHex(item, "signal") : functionalRecipeHex(item, "tintBorder")
        }`,
      }}
    >
      <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <div className="min-w-0">
        <p className="font-canopy text-sm font-semibold">{title}</p>
        <p
          className="mt-0.5 font-stream text-xs leading-relaxed"
          style={{ color: dark ? "var(--color-texto-muted)" : undefined }}
        >
          {body}
        </p>
      </div>
    </div>
  )
}

function ActionsExample() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-canopy text-lg font-semibold">Pedido #4821</p>
          <Mute className="mt-1 block font-stream text-sm">Mesa 4 · hace 6 min</Mute>
        </div>
        <RootsNaturePill variant="savia">En curso</RootsNaturePill>
      </div>
      <div className="flex flex-wrap gap-2">
        <RootsPrimaryButton icon={Check}>Cobrar</RootsPrimaryButton>
        <RootsDefaultButton>Imprimir</RootsDefaultButton>
        <RootsSubtleButton>Más tarde</RootsSubtleButton>
        <RootsDangerButton icon={Trash2}>Anular</RootsDangerButton>
        <RootsLinkButton>Ver detalle</RootsLinkButton>
      </div>
      <div className="flex flex-wrap gap-2">
        <RootsIconButton label="Agregar" size="compact">
          <Plus />
        </RootsIconButton>
        <RootsIconButton label="Editar" size="compact" tone="action" intent="edit">
          <Pencil />
        </RootsIconButton>
        <RootsIconButton label="Duplicar" size="compact" tone="action" intent="neutral">
          <Copy />
        </RootsIconButton>
        <RootsIconButton label="Eliminar" size="compact" tone="action" intent="destructive">
          <Trash2 />
        </RootsIconButton>
      </div>
    </div>
  )
}

const CARDS = [
  { name: "Yerba mate orgánica", meta: "Almacén · 1 kg", amount: "$ 4.250", status: "activo" as const },
  { name: "Miel de monte", meta: "Almacén · 500 g", amount: "$ 2.800", status: "pendiente" as const },
  { name: "Aceite de oliva", meta: "Almacén · 750 ml", amount: "$ 8.640", status: "alerta" as const },
]

function CardsExample({ atmosphere }: { atmosphere: SotobosqueId }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CARDS.map((card, index) => (
        <Surface key={card.name} elevated className="flex flex-col">
          <div
            className="mb-3 h-20 rounded-xl"
            style={{
              background: `linear-gradient(160deg, ${handbookColorHex(
                atmosphere,
                index === 0 ? "700" : index === 1 ? "800" : "600",
              )} 0%, ${handbookColorHex(atmosphere, "900")} 100%)`,
            }}
          />
          <p className="font-canopy text-sm font-semibold leading-snug">{card.name}</p>
          <Mute className="mt-1 block font-stream text-xs">{card.meta}</Mute>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="font-numeric text-sm font-semibold tabular-nums">{card.amount}</p>
            <RootsNaturePill
              variant={
                card.status === "activo" ? "savia" : card.status === "pendiente" ? "warning" : "danger"
              }
            >
              {card.status === "activo" ? "Activo" : card.status === "pendiente" ? "Pendiente" : "Bajo"}
            </RootsNaturePill>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <RootsLinkButton size="compact">Ver</RootsLinkButton>
            <RootsIconButton label="Editar" size="compact" tone="action" intent="edit">
              <Pencil />
            </RootsIconButton>
          </div>
        </Surface>
      ))}
    </div>
  )
}

const TABLE_ROWS = [
  { name: "Yerba mate orgánica", status: "activo" as const, amount: "$ 4.250" },
  { name: "Miel de monte", status: "pendiente" as const, amount: "$ 2.800" },
  { name: "Aceite de oliva", status: "alerta" as const, amount: "$ 8.640" },
  { name: "Café de especialidad", status: "activo" as const, amount: "$ 6.100" },
]

function TableExample() {
  return (
    <Surface elevated className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-canopy text-sm font-semibold">Artículos</p>
          <Mute className="block font-stream text-xs">4 en esta página</Mute>
        </div>
        <RootsPrimaryButton size="compact" icon={Plus}>
          Nuevo
        </RootsPrimaryButton>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderTop: "1px solid var(--color-borde)" }}>
            {["Artículo", "Estado", "Monto", ""].map((head) => (
              <th
                key={head || "acciones"}
                className="px-4 py-2.5 font-canopy text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--color-texto-muted)" }}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row) => (
            <tr key={row.name} style={{ borderTop: "1px solid var(--color-borde)" }}>
              <td className="px-4 py-3 font-canopy text-sm font-medium">{row.name}</td>
              <td className="px-4 py-3">
                <RootsNaturePill
                  variant={
                    row.status === "activo" ? "savia" : row.status === "pendiente" ? "warning" : "danger"
                  }
                >
                  {row.status === "activo" ? "Activo" : row.status === "pendiente" ? "Pendiente" : "Bajo"}
                </RootsNaturePill>
              </td>
              <td className="px-4 py-3 font-numeric text-sm tabular-nums">{row.amount}</td>
              <td className="px-4 py-3 text-right">
                <RootsIconButton label="Editar" size="compact" tone="action" intent="edit">
                  <Pencil />
                </RootsIconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  )
}

function DropdownExample({ atmosphere }: { atmosphere: SotobosqueId }) {
  const theme = isDark(atmosphere) ? "dark" : "light"

  return (
    <div className="space-y-4">
      <div>
        <p className="font-canopy text-sm font-semibold">Artículo seleccionado</p>
        <Mute className="mt-1 block max-w-sm font-stream text-sm leading-relaxed">
          El menú se abre sobre la hoja. Savia solo en el ítem de oficio; lava en lo que no se deshace.
        </Mute>
      </div>
      <RootsDropdownSpecAnatomy
        theme={theme}
        trigger={
          <RootsDefaultButton icon={MoreHorizontal} iconPosition="right">
            Acciones
          </RootsDefaultButton>
        }
      />
    </div>
  )
}

const GALLERY = [
  { name: "Cafetería", count: "18" },
  { name: "Almacén", count: "42" },
  { name: "Panadería", count: "9" },
  { name: "Rotisería", count: "14" },
  { name: "Bebidas", count: "27" },
  { name: "Kiosco", count: "31" },
]

function GalleryExample({ atmosphere }: { atmosphere: SotobosqueId }) {
  const steps = isDark(atmosphere)
    ? (["800", "700", "900", "600", "800", "700"] as const)
    : (["200", "100", "300", "50", "200", "100"] as const)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {GALLERY.map((tile, index) => (
        <button
          key={tile.name}
          type="button"
          className="overflow-hidden rounded-2xl text-left"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-borde)" }}
        >
          <div
            className="h-24"
            style={{
              background:
                index === 0
                  ? handbookColorHex("savia", isDark(atmosphere) ? "700" : "200")
                  : handbookColorHex(atmosphere, steps[index] ?? "700"),
            }}
          />
          <div
            className="flex items-center justify-between gap-2 px-3 py-3"
            style={{ backgroundColor: "var(--color-elevada)" }}
          >
            <p className="font-canopy text-sm font-semibold">{tile.name}</p>
            <Mute className="font-numeric text-xs tabular-nums">{tile.count}</Mute>
          </div>
        </button>
      ))}
    </div>
  )
}

function FormExample() {
  const [kind, setKind] = useState("producto")
  const [amount, setAmount] = useState("4250")
  const [listed, setListed] = useState(true)

  return (
    <div className="space-y-4">
      <div>
        <p className="font-canopy text-base font-semibold">Nuevo artículo</p>
        <Mute className="mt-1 block font-stream text-sm">Los campos viven en la hoja. Savia confirma.</Mute>
      </div>
      <RootsFormTextField label="Nombre" defaultValue="Yerba mate orgánica" />
      <RootsFormSegmentField
        label="Tipo"
        value={kind}
        onValueChange={setKind}
        options={[
          { value: "producto", label: "Producto" },
          { value: "insumo", label: "Insumo" },
          { value: "receta", label: "Receta" },
        ]}
      />
      <RootsFormMoneyField label="Precio de venta" value={amount} onChange={setAmount} />
      <RootsFormTextareaField
        label="Notas"
        defaultValue="Proveedor de Misiones. Pedido semanal."
        rows={3}
      />
      <RootsFormCheckboxField
        label="Mostrar en el catálogo"
        description="Aparece en el mostrador y en la carta."
        checked={listed}
        onCheckedChange={setListed}
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <RootsPrimaryButton>Guardar</RootsPrimaryButton>
        <RootsSubtleButton>Cancelar</RootsSubtleButton>
      </div>
    </div>
  )
}

const TICKET_LINES = [
  { name: "Café doble", qty: "2", amount: "$ 3.200" },
  { name: "Medialuna", qty: "3", amount: "$ 2.400" },
  { name: "Jugo de naranja", qty: "1", amount: "$ 1.800" },
]

function TicketExample() {
  return (
    <Surface elevated className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-canopy text-base font-semibold">Ticket 108</p>
          <Mute className="mt-1 block font-stream text-sm">Mostrador · efectivo</Mute>
        </div>
        <RootsNaturePill variant="info">Abierto</RootsNaturePill>
      </div>
      <ul className="space-y-0">
        {TICKET_LINES.map((line) => (
          <li
            key={line.name}
            className="flex items-baseline justify-between gap-3 py-2.5"
            style={{ borderTop: "1px solid var(--color-borde)" }}
          >
            <div>
              <p className="font-canopy text-sm font-medium">{line.name}</p>
              <Mute className="font-numeric text-xs tabular-nums">× {line.qty}</Mute>
            </div>
            <p className="font-numeric text-sm tabular-nums">{line.amount}</p>
          </li>
        ))}
      </ul>
      <div
        className="flex items-center justify-between gap-3 pt-3"
        style={{ borderTop: "1px solid var(--color-borde)" }}
      >
        <Mute className="font-canopy text-sm font-semibold">Total</Mute>
        <p className="font-numeric text-xl font-semibold tabular-nums">$ 7.400</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <RootsPrimaryButton className="flex-1">Cobrar</RootsPrimaryButton>
        <RootsDefaultButton>Más</RootsDefaultButton>
      </div>
    </Surface>
  )
}

const METRICS = [
  { label: "Ventas de hoy", value: "$ 184.200", hint: "+12% vs ayer", recipeId: "exito" as const },
  { label: "Tickets abiertos", value: "7", hint: "Mesa 4 espera", recipeId: "informacion" as const },
  { label: "Stock bajo", value: "3", hint: "Aceite, harina, café", recipeId: "atencion" as const },
  { label: "Caja descuadrada", value: "$ 420", hint: "Revisar turno", recipeId: "peligro" as const },
]

function MetricsExample({ atmosphere }: { atmosphere: SotobosqueId }) {
  const dark = isDark(atmosphere)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {METRICS.map((metric) => {
        const item = recipe(metric.recipeId)
        return (
          <Surface key={metric.label} elevated>
            <Mute className="block font-canopy text-[11px] font-semibold uppercase tracking-[0.12em]">
              {metric.label}
            </Mute>
            <p className="mt-2 font-numeric text-2xl font-semibold tabular-nums">{metric.value}</p>
            <p
              className="mt-2 font-canopy text-xs font-semibold"
              style={{
                color: dark
                  ? functionalInkHex(item.familyId, true)
                  : functionalRecipeHex(item, "tintText"),
              }}
            >
              {metric.hint}
            </p>
          </Surface>
        )
      })}
    </div>
  )
}

function FiltersExample() {
  const [query, setQuery] = useState("yerba")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-canopy text-base font-semibold">Catálogo</p>
          <Mute className="mt-1 block font-stream text-sm">12 resultados con estos filtros</Mute>
        </div>
        <RootsSubtleButton size="compact" icon={Search}>
          Filtros
        </RootsSubtleButton>
      </div>
      <RootsFormSearchField
        hideLabel
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        placeholder="Buscar artículo…"
      />
      <div className="flex flex-wrap gap-2">
        <RootsNaturePill variant="savia">Almacén</RootsNaturePill>
        <RootsNaturePill variant="bruma">Activos</RootsNaturePill>
        <RootsNaturePill variant="bruma">Con stock</RootsNaturePill>
        <RootsNaturePill variant="warning">Precio · $1.000+</RootsNaturePill>
      </div>
      <Surface>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-canopy text-sm font-semibold">Yerba mate orgánica</p>
            <Mute className="block font-stream text-xs">Coincide con la búsqueda</Mute>
          </div>
          <p className="font-numeric text-sm font-semibold tabular-nums">$ 4.250</p>
        </div>
      </Surface>
    </div>
  )
}

function StatesExample({ atmosphere }: { atmosphere: SotobosqueId }) {
  return (
    <div className="space-y-3">
      <StatusBanner
        atmosphere={atmosphere}
        recipeId="exito"
        title="Pago confirmado"
        body="El ticket 108 quedó cobrado. El vivo no pinta el mundo: solo el estado."
      />
      <StatusBanner
        atmosphere={atmosphere}
        recipeId="informacion"
        title="Turno abierto"
        body="Caja de la mañana. Cielo orienta; no es atmósfera de pantalla."
      />
      <StatusBanner
        atmosphere={atmosphere}
        recipeId="atencion"
        title="Stock bajo"
        body="Aceite de oliva está por debajo del mínimo."
      />
      <StatusBanner
        atmosphere={atmosphere}
        recipeId="peligro"
        title="No se pudo anular"
        body="El ticket ya está cerrado. Lava marca lo que no se deshace."
      />
      <Surface elevated className="mt-4 text-center">
        <p className="font-canopy text-sm font-semibold">No hay artículos en esta categoría</p>
        <Mute className="mx-auto mt-1 block max-w-sm font-stream text-sm leading-relaxed">
          El vacío usa el aire de la atmósfera. La acción sigue siendo savia.
        </Mute>
        <div className="mt-4 flex justify-center">
          <RootsPrimaryButton size="compact" icon={Plus}>
            Crear artículo
          </RootsPrimaryButton>
        </div>
      </Surface>
    </div>
  )
}

export function HandbookColorApplicationView() {
  return (
    <article className="max-w-none">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Aplicación colores</h1>
      <p className={cn(libraryDocBodyClass, "mt-4 max-w-3xl")}>
        El aire cambia. El verbo no. Acá se ve cómo las mismas piezas viven en las dos luces
        del sotobosque: Sombra para operar, Luz filtrada para leer. Se elige una atmósfera por
        contexto. Savia, cielo, sol y lava marcan acción y estado — no pintan el mundo.
      </p>
      <p className={cn(libraryDocPageDescriptionClass, "mt-3 max-w-3xl", handbookDocIntroAfterClass)}>
        El rayo de acción es el mismo en cada luz: Savia 500 con texto 950. En Sombra el tope
        es negro, el 950 es aire y la hoja es 800. En Luz filtrada el papel es blanco.
      </p>

      <ExamplePair
        id="acciones"
        title="Acciones"
        lead="El CTA es savia en las dos luces. El resto de botones toma el ink de la atmósfera: profundo 700 en claro, vivo sobre el dosel."
      >
        {() => <ActionsExample />}
      </ExamplePair>

      <ExamplePair
        id="cards"
        title="Cards"
        lead="La card es hoja. Precio y nombre van en tinta de atmósfera. Savia solo en el estado que pide oficio o en el link."
      >
        {(atmosphere) => <CardsExample atmosphere={atmosphere} />}
      </ExamplePair>

      <ExamplePair
        id="tabla"
        title="Tabla"
        lead="Un listado lee sobre el claro y opera sobre el dosel. Los pills de estado son funcionales; el monto no se pinta de savia."
      >
        {() => <TableExample />}
      </ExamplePair>

      <ExamplePair
        id="dropdown"
        title="Dropdown"
        lead="El menú se sienta sobre la elevada. Hover y destructivo cambian de receta; el panel no inventa un gris suelto."
      >
        {(atmosphere) => <DropdownExample atmosphere={atmosphere} />}
      </ExamplePair>

      <ExamplePair
        id="galeria"
        title="Galería"
        lead="Las losetas son superficie. Un acento savia alcanza para decir cuál está viva. El resto es rampa de la atmósfera."
      >
        {(atmosphere) => <GalleryExample atmosphere={atmosphere} />}
      </ExamplePair>

      <ExamplePair
        id="formulario"
        title="Formulario"
        lead="Campos, segmento y checkbox heredan la luz. Guardar sigue siendo el mismo rayo."
      >
        {() => <FormExample />}
      </ExamplePair>

      <ExamplePair
        id="ticket"
        title="Ticket"
        lead="Líneas, total y cobro. En Sombra es mostrador; en Luz filtrada, lectura de un comprobante. Cambia el bosque, no el verbo."
      >
        {() => <TicketExample />}
      </ExamplePair>

      <ExamplePair
        id="metricas"
        title="Métricas"
        lead="Los KPIs viven en elevada. El número es texto de atmósfera. La pista usa el funcional: savia, cielo, sol o lava."
      >
        {(atmosphere) => <MetricsExample atmosphere={atmosphere} />}
      </ExamplePair>

      <ExamplePair
        id="filtros"
        title="Filtros"
        lead="Búsqueda, chips y un resultado. El chip activo es savia; los demás, aire de la atmósfera."
      >
        {() => <FiltersExample />}
      </ExamplePair>

      <ExamplePair
        id="estados"
        title="Estados"
        lead="Avisos fuera de las atmósferas. En Luz filtrada el tint es 50 / 200 / 700. En Sombra, hoja más vivo."
      >
        {(atmosphere) => <StatesExample atmosphere={atmosphere} />}
      </ExamplePair>
    </article>
  )
}
