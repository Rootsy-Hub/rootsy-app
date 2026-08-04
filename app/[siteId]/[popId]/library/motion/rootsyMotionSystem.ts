/**
 * Sistema de motion Rootsy — fuente de verdad del design system.
 * Alineado a Atlassian Motion con capa nature: orgánico, claro, accesible, ágil.
 */

export type MotionDuration = {
  id: string
  token: string
  natureName: string
  ms: number
  tier: "interaction" | "transition" | "expressive"
  usage: string
}

export type MotionEasing = {
  id: string
  token: string
  natureName: string
  cubicBezier: string
  usage: string
  bestFor: string
}

export type MotionProperty = {
  id: string
  title: string
  description: string
  natureMetaphor: string
  gpuSafe: boolean
}

export type MotionSemanticToken = {
  token: string
  component: string
  durationToken: string
  easingToken: string
  properties: string[]
  notes?: string
}

export const ROOTSY_MOTION_MANIFESTO =
  "El movimiento en Rootsy respira como el bosque: una brisa en el hover, una ráfaga cuando abre un modal, viento de salida cuando algo se va. Nunca decoración vacía — siempre clarifica qué cambió y qué sigue. Orgánico pero ágil; accesible con prefers-reduced-motion; performante solo con transform y opacity."

export const ROOTSY_MOTION_PRINCIPLES = [
  {
    title: "Orgánico",
    detail: "Movimiento humano — sutil, rítmico, cálido. No mecánico ni elástico exagerado.",
  },
  {
    title: "Claro",
    detail: "Guía la atención — el usuario entiende qué cambió y por qué.",
  },
  {
    title: "Accesible",
    detail: "Respeta reduced-motion — instant o sin animación. Sin flash ni oscilación rápida.",
  },
  {
    title: "Ágil",
    detail: "Salidas más rápidas que entradas. Interacciones frecuentes bajo 150ms.",
  },
] as const

export const ROOTSY_MOTION_DURATIONS: MotionDuration[] = [
  { id: "instant", token: "motion.duration.instant", natureName: "—", ms: 0, tier: "interaction", usage: "Focus instantáneo, reduced-motion fallback." },
  { id: "xxshort", token: "motion.duration.xxshort", natureName: "Rocío", ms: 50, tier: "interaction", usage: "Hover en list items, micro-feedback." },
  { id: "xshort", token: "motion.duration.xshort", natureName: "Hoja", ms: 100, tier: "interaction", usage: "Pressed states, salidas rápidas de popup." },
  { id: "short", token: "motion.duration.short", natureName: "Brisa", ms: 150, tier: "interaction", usage: "Hover enfatizado, entrada de dropdown." },
  { id: "medium", token: "motion.duration.medium", natureName: "Corriente", ms: 200, tier: "transition", usage: "Salida de modal, salida de flag." },
  { id: "long", token: "motion.duration.long", natureName: "Ráfaga", ms: 250, tier: "transition", usage: "Entrada de modal, entrada de flag." },
  { id: "xlong", token: "motion.duration.xlong", natureName: "Viento", ms: 400, tier: "transition", usage: "Transiciones de página, paneles grandes." },
  { id: "xxlong", token: "motion.duration.xxlong", natureName: "Estación", ms: 600, tier: "expressive", usage: "Onboarding, overlays full-screen — usar poco." },
]

export const ROOTSY_MOTION_EASINGS: MotionEasing[] = [
  {
    id: "out-bold",
    token: "motion.easing.out.bold",
    natureName: "Aterrizaje",
    cubicBezier: "cubic-bezier(0, 0.4, 0, 1)",
    usage: "Entradas que captan atención — llegada rápida, frenado suave.",
    bestFor: "Panel, Flag enter, Modal enter",
  },
  {
    id: "inout-bold",
    token: "motion.easing.inout.bold",
    natureName: "Balance",
    cubicBezier: "cubic-bezier(0.4, 0, 0, 1)",
    usage: "Scale y reposicionamiento — energía intencional.",
    bestFor: "Modal scale, Spotlight reposition",
  },
  {
    id: "in-practical",
    token: "motion.easing.in.practical",
    natureName: "Despegue",
    cubicBezier: "cubic-bezier(0.6, 0, 0.8, 0.6)",
    usage: "Salidas — acelera y libera el camino.",
    bestFor: "Exit transitions, dismiss",
  },
  {
    id: "out-practical",
    token: "motion.easing.out.practical",
    natureName: "Brisa suave",
    cubicBezier: "cubic-bezier(0.4, 1, 0.6, 1)",
    usage: "Entradas cotidianas — popup, hover fade.",
    bestFor: "Popup enter, background hover",
  },
]

export const ROOTSY_MOTION_PROPERTIES: MotionProperty[] = [
  {
    id: "scale",
    title: "Scale",
    description: "Crecer o encoger — énfasis o dismiss.",
    natureMetaphor: "Brotes que emergen",
    gpuSafe: true,
  },
  {
    id: "fade",
    title: "Fade",
    description: "Opacidad 0↔100 — aparecer/desaparecer sin desplazamiento.",
    natureMetaphor: "Neblina que se disipa",
    gpuSafe: true,
  },
  {
    id: "slide",
    title: "Slide",
    description: "Traslación en X o Y — relación espacial con el trigger.",
    natureMetaphor: "Hojas al viento",
    gpuSafe: true,
  },
  {
    id: "color",
    title: "Color",
    description: "Background, border, text color — feedback de estado.",
    natureMetaphor: "Estación que cambia",
    gpuSafe: true,
  },
]

export const ROOTSY_MOTION_SEMANTIC: MotionSemanticToken[] = [
  {
    token: "motion.interaction.hover",
    component: "List item, Button, Nav",
    durationToken: "motion.duration.xxshort",
    easingToken: "motion.easing.out.practical",
    properties: ["color", "fade"],
    notes: "Alta frecuencia — casi instantáneo.",
  },
  {
    token: "motion.interaction.pressed",
    component: "Button, Segment, Switch",
    durationToken: "motion.duration.xshort",
    easingToken: "motion.easing.out.practical",
    properties: ["scale", "color"],
  },
  {
    token: "motion.popup.enter.bottom",
    component: "Dropdown, Popover, Select",
    durationToken: "motion.duration.short",
    easingToken: "motion.easing.out.bold",
    properties: ["fade", "slide"],
    notes: "Entrar desde el trigger — no desde el vacío.",
  },
  {
    token: "motion.popup.exit.bottom",
    component: "Dropdown, Popover",
    durationToken: "motion.duration.xshort",
    easingToken: "motion.easing.in.practical",
    properties: ["fade", "slide"],
    notes: "Salida 50ms más rápida que entrada.",
  },
  {
    token: "motion.modal.enter",
    component: "Dialog, Sheet",
    durationToken: "motion.duration.long",
    easingToken: "motion.easing.inout.bold",
    properties: ["fade", "scale"],
    notes: "scale 95%→100% + backdrop fade.",
  },
  {
    token: "motion.modal.exit",
    component: "Dialog, Sheet",
    durationToken: "motion.duration.medium",
    easingToken: "motion.easing.in.practical",
    properties: ["fade", "scale"],
  },
  {
    token: "motion.blanket.enter",
    component: "Overlay / backdrop",
    durationToken: "motion.duration.short",
    easingToken: "motion.easing.out.practical",
    properties: ["fade"],
  },
  {
    token: "motion.flag.enter",
    component: "Banner, Toast",
    durationToken: "motion.duration.long",
    easingToken: "motion.easing.out.bold",
    properties: ["fade", "slide"],
  },
  {
    token: "motion.flag.exit",
    component: "Banner, Toast",
    durationToken: "motion.duration.medium",
    easingToken: "motion.easing.in.practical",
    properties: ["fade", "slide"],
  },
]

export const MOTION_DURATION_RANGES = {
  interaction: { label: "Interacciones · 0–150ms", description: "Hover, press, focus — respuesta inmediata." },
  transition: { label: "Transiciones · 150–400ms", description: "Entradas, salidas, modales, paneles." },
  expressive: { label: "Expresivo · 600ms", description: "Onboarding y momentos de marca — raros." },
} as const

export const MOTION_APPLYING_GUIDELINES = [
  {
    id: "semantic-first",
    title: "Tokens semánticos primero",
    doText: "motion.modal.enter antes de armar duration+easing sueltos.",
    dontText: "300ms ease-in-out genérico en cada componente.",
  },
  {
    id: "asymmetric",
    title: "Entrada ≠ salida",
    doText: "Salida más corta y ease-in — libera el flujo.",
    dontText: "Misma duración y curva en enter y exit.",
  },
  {
    id: "origin",
    title: "Origen espacial",
    doText: "Dropdown abre desde su trigger — continuidad espacial.",
    dontText: "Elementos que aparecen desde el centro sin relación.",
  },
  {
    id: "frequency",
    title: "Frecuencia",
    doText: "Hover 50ms — onboarding 600ms una vez por sesión.",
    dontText: "Animación larga en acciones que se repiten 100 veces al día.",
  },
  {
    id: "properties",
    title: "Propiedades GPU",
    doText: "transform + opacity — suave en hardware modesto.",
    dontText: "Animar width, height, top, left — layout thrashing.",
  },
  {
    id: "a11y",
    title: "Reduced motion",
    doText: "@media (prefers-reduced-motion: reduce) → instant o none.",
    dontText: "Ignorar preferencias del sistema operativo.",
  },
] as const

export const MOTION_KEYFRAMES = [
  { token: "motion.keyframe.fade.in", value: "0% → 100% opacity", usage: "Tooltips, blanket, contenido." },
  { token: "motion.keyframe.fade.out", value: "100% → 0% opacity", usage: "Dismiss messages." },
  { token: "motion.keyframe.scale.in.small", value: "95% → 100%", usage: "Modal, Spotlight enter." },
  { token: "motion.keyframe.scale.out.small", value: "100% → 95%", usage: "Modal exit." },
] as const
