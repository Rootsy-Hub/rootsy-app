/**
 * Pie del hilo mientras Rootsy piensa.
 * Cuerpo lento + mente en vivo + cristal de Herramientas (cáustica + membrana).
 */
export function ChatRootsyThinkingHalo() {
  return (
    <div className="chat-rootsy-thinking" role="status" aria-live="polite">
      <span className="sr-only">Rootsy está pensando</span>
      <div aria-hidden className="chat-rootsy-thinking__depth" />
      <div aria-hidden className="chat-rootsy-thinking__body" />
      <div aria-hidden className="chat-rootsy-thinking__caustic" />
      <div aria-hidden className="chat-rootsy-thinking__membrane" />
      <div aria-hidden className="chat-rootsy-thinking__mind" />
      <div aria-hidden className="chat-rootsy-thinking__veil" />
    </div>
  )
}
