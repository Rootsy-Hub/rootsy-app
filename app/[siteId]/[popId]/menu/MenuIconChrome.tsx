/** Detalle interior — canto doble sin emisión. */
export function MenuIconChrome() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_50%_20%,rgba(103,232,249,0.07)_0%,transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-px rounded-[inherit] border border-[rgba(103,232,249,0.16)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[14%] top-px h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.14)] to-transparent"
        aria-hidden
      />
    </>
  )
}
