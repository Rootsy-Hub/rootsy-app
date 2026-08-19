import {
  layoutsOperarCatalogScrollFadeClass,
  layoutsOperarCatalogScrollFadeTopClass,
} from "@/app/library/layouts/layoutsOperarStyles"

export function CatalogScrollFades({
  atCeiling,
  atFloor,
}: {
  atCeiling: boolean
  atFloor: boolean
}) {
  return (
    <>
      <div
        className={layoutsOperarCatalogScrollFadeTopClass}
        data-at-ceiling={atCeiling ? "true" : undefined}
        aria-hidden
      />
      <div
        className={layoutsOperarCatalogScrollFadeClass}
        data-at-floor={atFloor ? "true" : undefined}
        aria-hidden
      />
    </>
  )
}
