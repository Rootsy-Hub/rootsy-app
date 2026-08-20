"use client"

const BRIGHT_STARS = ["md", "sm", "md", "sm", "md", "sm"] as const

/** Noche viva detrás del terminal — mismo cielo que el header. */
export function SaleFinalizeDialogAtmosphere() {
  return (
    <div className="sale-finalize-dialog-atmosphere" aria-hidden>
      <div className="sale-finalize-dialog-atmosphere-stars" />
      <div className="sale-finalize-dialog-atmosphere-stars-bright">
        {BRIGHT_STARS.map((size, index) => (
          <span
            key={index}
            className={`sale-finalize-dialog-atmosphere-star sale-finalize-dialog-atmosphere-star--${size}`}
          />
        ))}
      </div>
      <div className="sale-finalize-dialog-atmosphere-well" />
      <div className="sale-finalize-dialog-atmosphere-mist" />
      <div className="sale-finalize-dialog-atmosphere-horizon" />
    </div>
  )
}
