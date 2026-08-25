import { ROOTSY_MENSAJE_SOUND_SRC } from "@/components/rootsy-mensaje/rootsyMensaje"

let current: HTMLAudioElement | null = null

/** Canto del Mensaje de Rootsy. Llamar en el mismo click que dispara el toast. */
export function playRootsyMensajeSound() {
  if (typeof window === "undefined") return

  try {
    current?.pause()
    const audio = new Audio(ROOTSY_MENSAJE_SOUND_SRC)
    audio.preload = "auto"
    audio.volume = 0.72
    current = audio
    void audio.play().catch(() => {
      if (current === audio) current = null
    })
  } catch {
    current = null
  }
}
