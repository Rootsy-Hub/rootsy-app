/**
 * Pie del hilo mientras Rootsy piensa.
 * Dos elipses de glow que derivan; el hilo de arriba cede el lugar.
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
      <span className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--near" aria-hidden />
      <span className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--far" aria-hidden />
    </div>
  )
}
