import './StarRating.css'

interface StarRatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  interactive?: boolean
  onChange?: (value: number) => void
}

export default function StarRating({ value, max = 5, size = 'md', interactive, onChange }: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <span className={`stars stars-${size} ${interactive ? 'stars-interactive' : ''}`} role={interactive ? 'group' : 'img'} aria-label={`${value} out of ${max} stars`}>
      {stars.map((s) => (
        <span
          key={s}
          className={`star ${s <= value ? 'filled' : ''}`}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={interactive ? () => onChange?.(s) : undefined}
          onKeyDown={interactive ? (e) => e.key === 'Enter' && onChange?.(s) : undefined}
        >
          ★
        </span>
      ))}
    </span>
  )
}
