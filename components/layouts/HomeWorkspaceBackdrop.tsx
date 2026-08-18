import { cn } from "@/lib/utils"

export const homeWorkspaceSurfaceClass = "bg-[#070a09]"

type HomeWorkspaceBackdropProps = {
  className?: string
}

/** Ambiente de /home — glows + grilla. Para shells sin foto de POP. */
export function HomeWorkspaceBackdrop({ className }: HomeWorkspaceBackdropProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_35%),radial-gradient(circle_at_82%_46%,rgba(99,102,241,0.12),transparent_34%),radial-gradient(circle_at_45%_88%,rgba(34,211,238,0.1),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[42px_42px] opacity-25" />
      <div className="absolute -top-28 left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl motion-safe:animate-pulse" />
      <div className="absolute right-2 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl motion-safe:animate-pulse [animation-delay:900ms]" />
      <div className="absolute bottom-0 left-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl motion-safe:animate-pulse [animation-delay:1700ms]" />
      <div className="absolute -top-40 -right-24 h-136 w-136 rounded-full bg-[conic-gradient(from_0deg,rgba(16,185,129,0.14),rgba(99,102,241,0.1),rgba(16,185,129,0.14))] blur-3xl motion-safe:animate-[spin_42s_linear_infinite]" />
      <div className="absolute -bottom-44 -left-28 h-136 w-136 rounded-full bg-[conic-gradient(from_0deg,rgba(34,211,238,0.12),rgba(52,211,153,0.08),rgba(34,211,238,0.12))] blur-3xl motion-safe:animate-[spin_50s_linear_infinite_reverse]" />
    </div>
  )
}
