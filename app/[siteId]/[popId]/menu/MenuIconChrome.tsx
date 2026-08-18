/** Capas internas — cristal físico + marco HUD (sin blur pesado). */
export function MenuIconChrome() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1.5px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(0,0,0,0.14),inset_1.5px_0_0_rgba(255,255,255,0.14),inset_-1px_0_0_rgba(255,255,255,0.05)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[8%] top-0 h-[48%] rounded-b-[40%] bg-gradient-to-b from-white/32 via-white/10 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[22%] top-[-8%] h-[118%] w-[58%] rotate-[16deg] bg-gradient-to-r from-white/18 via-white/5 to-transparent opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[10%] bottom-[-6%] h-[55%] w-[42%] rotate-[-24deg] bg-gradient-to-tl from-[rgba(160,225,255,0.12)] to-transparent opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[12%] bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(195,245,255,0.7)] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[18%] rounded-[inherit] bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_68%)]"
        aria-hidden
      />
    </>
  )
}
