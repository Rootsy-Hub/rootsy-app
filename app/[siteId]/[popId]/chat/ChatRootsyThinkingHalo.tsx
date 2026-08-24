import { cn } from "@/lib/utils"

type Props = {
  variant?: "rootsy" | "planner"
  exiting?: boolean
}

/**
 * Pie del hilo mientras piensa Rootsy o el Planificador.
 * Tres elipses + tres puntos, igual que el prototipo HTML.
 */
export function ChatRootsyThinkingHalo({
  variant = "rootsy",
  exiting = false,
}: Props) {
  const planner = variant === "planner"
  return (
    <div
      id={planner ? "planner-thinking-footer" : "rootsy-thinking-footer"}
      className={cn(
        "chat-rootsy-thinking",
        planner && "chat-rootsy-thinking--planner",
        exiting && "chat-rootsy-thinking--exit",
      )}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">
        {planner ? "El Planificador está pensando" : "Rootsy está pensando"}
      </span>
      <span
        className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--signal"
        aria-hidden
      />
      <span
        className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--wash"
        aria-hidden
      />
      <span
        className="chat-rootsy-thinking__glow chat-rootsy-thinking__glow--core"
        aria-hidden
      />
      <span
        className="chat-rootsy-thinking__dot chat-rootsy-thinking__dot--mid"
        aria-hidden
      />
      <span
        className="chat-rootsy-thinking__dot chat-rootsy-thinking__dot--right"
        aria-hidden
      />
      <span
        className="chat-rootsy-thinking__dot chat-rootsy-thinking__dot--left"
        aria-hidden
      />
    </div>
  )
}
