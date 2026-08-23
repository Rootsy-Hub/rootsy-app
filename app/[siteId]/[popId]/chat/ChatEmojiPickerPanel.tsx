"use client"

import EmojiPicker, {
  Categories,
  EmojiStyle,
  Theme,
} from "emoji-picker-react"

type Props = {
  onPick: (emoji: string) => void
}

export default function ChatEmojiPickerPanel({ onPick }: Props) {
  return (
    <EmojiPicker
      onEmojiClick={(emoji) => onPick(emoji.emoji)}
      theme={Theme.LIGHT}
      emojiStyle={EmojiStyle.NATIVE}
      lazyLoadEmojis
      searchPlaceHolder="Buscar"
      searchPlaceholder="Buscar"
      previewConfig={{ showPreview: false }}
      width={320}
      height={380}
      className="chat-emoji-picker"
      style={{
        backgroundColor: "#fff",
        ["--epr-highlight-color" as string]: "var(--rootsy-savia-600)",
        ["--epr-category-icon-active-color" as string]:
          "var(--rootsy-savia-600)",
        ["--epr-hover-bg-color" as string]: "var(--rootsy-savia-50)",
        ["--epr-focus-bg-color" as string]: "var(--rootsy-savia-50)",
        ["--epr-text-color" as string]: "var(--rootsy-bruma-600)",
        ["--epr-search-input-bg-color" as string]: "var(--rootsy-bruma-50)",
        ["--epr-search-border-color" as string]: "var(--rootsy-bruma-200)",
        ["--epr-search-border-color-active" as string]:
          "var(--rootsy-savia-600)",
        ["--epr-bg-color" as string]: "#fff",
        ["--epr-category-label-bg-color" as string]: "#fff",
      }}
      categories={[
        { category: Categories.SUGGESTED, name: "Recientes" },
        { category: Categories.SMILEYS_PEOPLE, name: "Personas" },
        { category: Categories.ANIMALS_NATURE, name: "Naturaleza" },
        { category: Categories.FOOD_DRINK, name: "Comida" },
        { category: Categories.TRAVEL_PLACES, name: "Viajes" },
        { category: Categories.ACTIVITIES, name: "Actividades" },
        { category: Categories.OBJECTS, name: "Objetos" },
        { category: Categories.SYMBOLS, name: "Símbolos" },
        { category: Categories.FLAGS, name: "Banderas" },
      ]}
    />
  )
}
