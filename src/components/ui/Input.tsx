import type { ChangeEvent, InputHTMLAttributes } from 'react'
import styles from './Input.module.scss'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string
  value: string | number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: string
}

export function Input({ label, type = 'text', placeholder, value, onChange, error, id, className, ...props }: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <input
        {...props}
        id={inputId}
        className={[styles.input, error && styles.error, className].filter(Boolean).join(' ')}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && <span className={styles.errorMessage} id={`${inputId}-error`} role="alert">{error}</span>}
    </div>
  )
}

export default Input
