"use client"

import {
  LibraryDemoRow,
  LibraryFootnote,
  LibrarySection,
  SpecCard,
} from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import {
  RootsProgressButton,
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Plus, Save, Trash2 } from "lucide-react"
import { useState } from "react"

export function LayoutButtonLibrarySection() {
  const [progressBusy, setProgressBusy] = useState(false)

  const simulateProgress = () => {
    setProgressBusy(true)
    window.setTimeout(() => setProgressBusy(false), 1800)
  }

  return (
    <LibrarySection
      id="buttons"
      title="Botones"
      description="Una acción primaria por vista o footer. Secundaria para cancelar. Terciaria para bajo peso. Progress: disabled + spinner + label alternativo."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <SpecCard
          title="Jerarquía · primary / secondary / tertiary"
          source="components/ui/button · rootsButtonStyles"
          tokens={["default", "outline", "ghost-neutral"]}
        >
          <div className="space-y-4">
            <LibraryDemoRow title="Primary — confirmar, crear, guardar">
              <Button
                type="button"
                variant={rootsButtonVariant.primary}
                className={rootsButtonClassForVariant("primary")}
              >
                Guardar
              </Button>
              <Button
                type="button"
                variant={rootsButtonVariant.primary}
                className={rootsButtonClassForVariant("primary")}
                disabled
              >
                Deshabilitado
              </Button>
            </LibraryDemoRow>
            <LibraryDemoRow title="Secondary — cancelar, volver">
              <Button
                type="button"
                variant={rootsButtonVariant.secondary}
                className={rootsButtonClassForVariant("secondary")}
              >
                Cancelar
              </Button>
            </LibraryDemoRow>
            <LibraryDemoRow title="Tertiary — acciones suaves">
              <Button
                type="button"
                variant={rootsButtonVariant.tertiary}
                className={rootsButtonClassForVariant("tertiary")}
              >
                Quitar descuento
              </Button>
              <Button type="button" variant={rootsButtonVariant.link}>
                Ver detalle
              </Button>
            </LibraryDemoRow>
            <LibraryDemoRow title="Destructive">
              <Button type="button" variant={rootsButtonVariant.destructive}>
                Eliminar
              </Button>
            </LibraryDemoRow>
          </div>
        </SpecCard>

        <SpecCard
          title="Tamaños"
          source="Button size: sm · default · lg · icon"
          tokens={["h-8", "h-9", "h-10", "icon"]}
        >
          <div className="space-y-4">
            <LibraryDemoRow title="Con texto">
              <Button type="button" size="sm" variant="outline">
                Pequeño
              </Button>
              <Button
                type="button"
                variant={rootsButtonVariant.primary}
                className={rootsButtonClassForVariant("primary", "h-9")}
              >
                Default
              </Button>
              <Button
                type="button"
                size="lg"
                variant={rootsButtonVariant.primary}
                className={rootsButtonClassForVariant("primary")}
              >
                Grande
              </Button>
            </LibraryDemoRow>
            <LibraryDemoRow title="Solo icono">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Agregar"
              >
                <Plus className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Agregar"
              >
                <Plus className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                aria-label="Agregar"
              >
                <Plus className="size-4" aria-hidden />
              </Button>
            </LibraryDemoRow>
          </div>
        </SpecCard>

        <SpecCard
          title="Icono + texto"
          source="gap-2 · lucide size-4"
          tokens={["leading", "trailing"]}
        >
          <div className="space-y-4">
            <LibraryDemoRow title="Icono a la izquierda">
              <Button
                type="button"
                variant={rootsButtonVariant.primary}
                className={rootsButtonClassForVariant("primary")}
              >
                <Save className="size-4" aria-hidden />
                Guardar cambios
              </Button>
              <Button type="button" variant="outline">
                <Plus className="size-4" aria-hidden />
                Nuevo artículo
              </Button>
            </LibraryDemoRow>
            <LibraryDemoRow title="Icono a la derecha">
              <Button
                type="button"
                variant={rootsButtonVariant.primary}
                className={rootsButtonClassForVariant("primary")}
              >
                Continuar
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </LibraryDemoRow>
            <LibraryDemoRow title="Destructive con icono">
              <Button type="button" variant="destructive">
                <Trash2 className="size-4" aria-hidden />
                Eliminar definitivamente
              </Button>
            </LibraryDemoRow>
          </div>
        </SpecCard>

        <SpecCard
          title="RootsProgressButton"
          source="components/rootsy-button/RootsProgressButton.tsx"
          tokens={["loading", "loadingLabel"]}
        >
          <div className="space-y-4">
            <LibraryDemoRow title="Estado en progreso">
              <RootsProgressButton
                type="button"
                variant={rootsButtonVariant.primary}
                className={rootsButtonClassForVariant("primary")}
                loading
                loadingLabel="Guardando…"
              >
                Guardar
              </RootsProgressButton>
              <RootsProgressButton
                type="button"
                variant="outline"
                className={rootsButtonClassForVariant("secondary")}
                loading
                loadingLabel="Creando…"
              >
                Crear
              </RootsProgressButton>
            </LibraryDemoRow>
            <LibraryDemoRow title="Interactivo">
              <RootsProgressButton
                type="button"
                variant={rootsButtonVariant.primary}
                className={cn(
                  rootsButtonClassForVariant("primary"),
                  "min-w-[9.5rem]",
                )}
                loading={progressBusy}
                loadingLabel="Guardando…"
                icon={Save}
                onClick={simulateProgress}
              >
                Guardar
              </RootsProgressButton>
            </LibraryDemoRow>
          </div>
        </SpecCard>
      </div>

      <LibraryFootnote>
        Modal footer: primary derecha · secondary/tertiary izquierda ·
        RootsProgressButton en submit async
      </LibraryFootnote>
    </LibrarySection>
  )
}
