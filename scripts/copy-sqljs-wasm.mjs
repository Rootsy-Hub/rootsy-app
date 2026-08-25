import { copyFileSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const distDir = dirname(require.resolve("sql.js"))
const destDir = join(dirname(fileURLToPath(import.meta.url)), "../public/sql-js")

mkdirSync(destDir, { recursive: true })
for (const file of ["sql-wasm.wasm", "sql-wasm-browser.wasm"]) {
  copyFileSync(join(distDir, file), join(destDir, file))
}
