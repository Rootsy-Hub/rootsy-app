export function MensajePortraitSlotDemo() {
  return (
    <span className="rootsy-mensaje__portrait-slot" aria-hidden>
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
        <path
          d="M12 3.5 13.2 8h4.6L14.4 10.7 15.6 15 12 12.6 8.4 15l1.2-4.3L6.2 8h4.6L12 3.5Z"
          fill="#047857"
        />
        <path
          d="M12 17.5c2.4 0 4.4 1.1 5.2 2.5H6.8c.8-1.4 2.8-2.5 5.2-2.5Z"
          fill="rgb(4 120 87 / 0.55)"
        />
      </svg>
    </span>
  )
}

export function MensajePortraitProgressDemo({ value = 64 }: { value?: number }) {
  const radius = 10
  const circumference = 2 * Math.PI * radius
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circumference

  return (
    <span className="rootsy-mensaje__portrait-slot" aria-hidden>
      <svg viewBox="0 0 28 28" width="100%" height="100%">
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          stroke="rgb(4 120 87 / 0.18)"
          strokeWidth="2.4"
        />
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          stroke="#047857"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 14 14)"
        />
      </svg>
    </span>
  )
}
