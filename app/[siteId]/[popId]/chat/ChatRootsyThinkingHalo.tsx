/**
 * Pie del hilo mientras Rootsy piensa.
 * Tres elipses: barrido de señal, lavado cónico y núcleo screen.
 */
export function ChatRootsyThinkingHalo({ exiting = false }: { exiting?: boolean }) {
  return (
    <div
      id="rootsy-thinking-footer"
      className={
        exiting ? "chat-rootsy-thinking chat-rootsy-thinking--exit" : "chat-rootsy-thinking"
      }
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Rootsy está pensando</span>
      <span className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--signal" aria-hidden />
      <span className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--wash" aria-hidden />
      <span className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--core" aria-hidden />
    </div>
  )
}
