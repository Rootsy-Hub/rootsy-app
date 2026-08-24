/**
 * Pie del hilo mientras Rootsy piensa.
 * Cuerpo lento (respiración) + mente más rápida (pensamiento en vivo).
 */
export function ChatRootsyThinkingHalo() {
  return (
    <div className="chat-rootsy-thinking" role="status" aria-live="polite">
      <span className="sr-only">Rootsy está pensando</span>
      <div aria-hidden className="chat-rootsy-thinking__depth" />
      <div aria-hidden className="chat-rootsy-thinking__body" />
      <div aria-hidden className="chat-rootsy-thinking__mind" />
      <div aria-hidden className="chat-rootsy-thinking__veil" />
    </div>
  )
}
