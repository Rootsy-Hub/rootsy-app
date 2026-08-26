import { RootsyThinkingHalo } from "@/components/rootsy-thinking/RootsyThinkingHalo"

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
    <RootsyThinkingHalo
      id={planner ? "planner-thinking-footer" : "rootsy-thinking-footer"}
      label={planner ? "El Planificador está pensando" : "Rootsy está pensando"}
      exiting={exiting}
    />
  )
}
