import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  buildChatRootsyApiDocumentationPrompt,
  buildChatRootsyPlannerPrompt,
} from "@/lib/chat/apiDocumentacion"

const dir = dirname(fileURLToPath(import.meta.url))

writeFileSync(join(dir, "planificador-ai-prompt.txt"), `${buildChatRootsyPlannerPrompt()}\n`)
writeFileSync(
  join(dir, "api-documentacion.txt"),
  `${buildChatRootsyApiDocumentationPrompt()}\n`,
)
