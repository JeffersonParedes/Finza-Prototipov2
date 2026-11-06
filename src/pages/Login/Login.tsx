import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import type { Screen } from '../../components/layout/AppLayout'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import logoFinza from '../../assets/Logo.png'
import styles from './Login.module.scss'

interface LoginProps {
  onNavigate: (screen: Screen) => void
}

export function Login({ onNavigate }: LoginProps) {
  const { dispatch } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email: string; password: string }>({ email: '', password: '' })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = { email: '', password: '' }

    if (!email.trim()) nextErrors.email = 'El correo electrónico es obligatorio'
    else {
      const atIndex = email.indexOf('@')
      if (atIndex < 1 || !email.slice(atIndex + 1).includes('.')) {
        nextErrors.email = 'Ingresa un correo electrónico válido'
      }
    }

    if (!password) nextErrors.password = 'La contraseña es obligatoria'
    setErrors(nextErrors)

    if (nextErrors.email || nextErrors.password) return

    dispatch({
      type: 'LOGIN',
      payload: { id: 'demo-user', name: 'Jefferson', email: 'demo@finza.com', age: 30 },
    })
    onNavigate('home')
  }

  return (
    <main className={styles.container}>
      <Card className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo}><img src={logoFinza} alt="Finza" /></div>
          <p className={styles.subtitle}>Inicia sesión para continuar</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputWithIcon}>
            <Mail className={styles.fieldIcon} size={18} aria-hidden="true" />
            <Input
              className={styles.emailInput}
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              autoComplete="email"
            />
          </div>

          <div className={styles.inputWithIcon}>
            <Lock className={styles.fieldIcon} size={18} aria-hidden="true" />
            <Input
              className={styles.passwordInput}
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />
            <button
              className={styles.passwordToggle}
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button className={styles.submit} variant="primary" type="submit">Ingresar</Button>
        </form>

        <p className={styles.registerPrompt}>
          ¿No tienes cuenta?{' '}
          <a href="#register" onClick={(event) => { event.preventDefault(); onNavigate('register') }}>
            Regístrate aquí
          </a>
        </p>
      </Card>
    </main>
  )
}

export default Login
