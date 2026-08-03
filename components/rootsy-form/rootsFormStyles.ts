export const rootsFormFieldStackClass =
  "flex w-full min-w-0 flex-col gap-2"

const rootsFormControlBaseClass =
  "w-full min-w-0 rounded-lg border border-zinc-200 bg-white text-base text-zinc-900 shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-zinc-400 hover:border-zinc-300 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 dark:border-zinc-200 dark:bg-white dark:text-zinc-900 dark:placeholder:text-zinc-400 focus-visible:!border-emerald-700 focus-visible:!ring-2 focus-visible:!ring-emerald-700/45 focus-visible:ring-offset-0"

/** Texto una línea — light form con radio más contenido y foco verde Roots. */
export const rootsFormTextFieldClass = `${rootsFormControlBaseClass} h-11 px-3`

/** Multilínea — misma familia visual que rootsFormTextFieldClass. */
export const rootsFormTextareaFieldClass = `${rootsFormControlBaseClass} min-h-[5.25rem] resize-y px-3 py-2.5 leading-relaxed`

/** Shell para montos, cantidades y números con prefijo a la izquierda. */
export const rootsFormAffixFieldShellClass =
  "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs transition-[color,box-shadow,border-color] hover:border-zinc-300 focus-within:!border-emerald-700 focus-within:!ring-2 focus-within:!ring-emerald-700/45 focus-within:ring-offset-0 dark:border-zinc-200 dark:bg-white"

export const rootsFormAffixPrefixClass =
  "inline-flex shrink-0 items-center self-stretch border-r border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold tabular-nums text-zinc-600 dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-600"

export const rootsFormAffixInputClass =
  "min-w-0 flex-1 bg-transparent px-3 text-base font-numeric tabular-nums text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed dark:text-zinc-900 dark:placeholder:text-zinc-400"

