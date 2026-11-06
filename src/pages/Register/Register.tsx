import { useState, type FormEvent } from 'react'
import { Calendar, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import type { Screen } from '../../components/layout/AppLayout'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import logoFinza from '../../assets/Logo.png'
import styles from './Register.module.scss'

interface RegisterProps {
  onNavigate: (screen: Screen) => void
}

interface RegisterErrors {
  name: string
  email: string
  password: string
  age: string
}

export function Register({ onNavigate }: RegisterProps) {
  const { dispatch } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({ name: '', email: '', password: '', age: '' })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: RegisterErrors = { name: '', email: '', password: '', age: '' }

    if (!name.trim()) nextErrors.name = 'El nombre es obligatorio'

    if (!email.trim()) nextErrors.email = 'El correo electrónico es obligatorio'
    else {
      const atIndex = email.indexOf('@')
      if (atIndex < 1 || !email.slice(atIndex + 1).includes('.')) {
        nextErrors.email = 'Ingresa un correo electrónico válido'
      }
    }

    if (!password) nextErrors.password = 'La contraseña es obligatoria'
    else if (password.length < 6) nextErrors.password = 'La contraseña debe tener al menos 6 caracteres'

    const numericAge = Number(age)
    if (!age.trim()) nextErrors.age = 'La edad es obligatoria'
    else if (!Number.isFinite(numericAge) || numericAge <= 0 || numericAge > 120) {
      nextErrors.age = 'Ingresa una edad válida'
    }

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    dispatch({
      type: 'LOGIN',
      payload: { id: `user-${Date.now()}`, name: name.trim(), email: email.trim(), age: numericAge },
    })
    onNavigate('home')
  }

  return (
    <main className={styles.container}>
      <Card className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo}><img src={logoFinza} alt="Finza" /></div>
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Regístrate para empezar</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputWithIcon}>
            <User className={styles.fieldIcon} size={18} aria-hidden="true" />
            <Input
              className={styles.iconInput}
              label="Nombre"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              autoComplete="name"
            />
          </div>

          <div className={styles.inputWithIcon}>
            <Mail className={styles.fieldIcon} size={18} aria-hidden="true" />
            <Input
              className={styles.iconInput}
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
              autoComplete="new-password"
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

          <div className={styles.inputWithIcon}>
            <Calendar className={styles.fieldIcon} size={18} aria-hidden="true" />
            <Input
              className={styles.iconInput}
              label="Edad"
              type="number"
              placeholder="25"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              error={errors.age}
              min={1}
              max={120}
              inputMode="numeric"
            />
          </div>

          <Button className={styles.submit} variant="primary" type="submit">Registrarse</Button>
        </form>

        <p className={styles.loginPrompt}>
          ¿Ya tienes cuenta?{' '}
          <a href="#login" onClick={(event) => { event.preventDefault(); onNavigate('login') }}>
            Inicia sesión
          </a>
        </p>
      </Card>
    </main>
  )
}

export default Register
