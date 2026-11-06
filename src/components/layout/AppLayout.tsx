import { ChartNoAxesCombined, Clock3, House, LogOut, ShieldCheck, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import logoFinza from '../../assets/Logo.png'
import { useApp } from '../../context/AppContext'
import styles from './AppLayout.module.scss'

export type Screen = 'login' | 'register' | 'home' | 'dashboard' | 'history' | 'goals'

interface AppLayoutProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  onLogout: () => void
  children?: ReactNode
}

const navigationItems: { label: string; screen: Screen; icon: typeof House }[] = [
  { label: 'Inicio', screen: 'home', icon: House },
  { label: 'Dashboard', screen: 'dashboard', icon: ChartNoAxesCombined },
  { label: 'Historial', screen: 'history', icon: Clock3 },
  { label: 'Metas', screen: 'goals', icon: Target },
]

const financialTips = [
  'Tu dinero, bajo tu control.',
  'Pequeños ahorros, grandes metas.',
  'Revisa tus gastos semanalmente.',
  'Invertir en tus metas es invertir en ti.',
]

export function AppLayout({ currentScreen, onNavigate, onLogout, children }: AppLayoutProps) {
  const { user } = useApp()
  const [tipIndex, setTipIndex] = useState(0)
  const userName = user?.name || 'Usuario'
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'U'

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((currentIndex) => (currentIndex + 1) % financialTips.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <img className={styles.logo} src={logoFinza} alt="Finza" />
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.avatar} aria-label={`Avatar de ${userName}`}>{userInitial}</span>
        </div>
      </header>
      <div className={styles.bodyLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div className={styles.sectionLabel}>MI ESPACIO</div>
            <nav className={styles.navigation} aria-label="Navegación principal">
              {navigationItems.map(({ label, screen, icon: Icon }) => (
                <button
                  className={`${styles.navItem} ${currentScreen === screen ? styles.active : ''}`}
                  key={screen}
                  type="button"
                  aria-current={currentScreen === screen ? 'page' : undefined}
                  onClick={() => onNavigate(screen)}
                >
                  <Icon size={18} aria-hidden="true" /> <span>{label}</span>
                  {currentScreen === screen && <span className={styles.activeDot} aria-hidden="true" />}
                </button>
              ))}
            </nav>
          </div>
          <div className={styles.sidebarBottom}>
            <div className={styles.tipCard}>
              <ShieldCheck className={styles.tipIcon} size={18} aria-hidden="true" />
              <span className={styles.tipText} key={tipIndex}>{financialTips[tipIndex]}</span>
            </div>
            <Button className={styles.logout} variant="secondary" onClick={onLogout}><LogOut size={18} />Cerrar sesión</Button>
          </div>
        </aside>
        <main className={styles.mainContent}>
          <section aria-live="polite">{children}</section>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
