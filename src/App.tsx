import { useEffect, useState } from 'react'
import AppLayout, { type Screen } from './components/layout/AppLayout'
import { AppProvider } from './context/AppContext'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import History from './pages/History/History'
import Goals from './pages/Goals/Goals'
import NewTransaction from './pages/NewTransaction/NewTransaction'
import { useApp } from './context/AppContext'

function AppContent() {
  const { user, dispatch } = useApp()
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)

  useEffect(() => {
    if (!user && currentScreen !== 'login' && currentScreen !== 'register') {
      setCurrentScreen('login')
    } else if (user && (currentScreen === 'login' || currentScreen === 'register')) {
      setCurrentScreen('home')
    }
  }, [currentScreen, user])

  function handleLogout() {
    dispatch({ type: 'LOGOUT' })
    setIsTransactionModalOpen(false)
    setCurrentScreen('login')
  }

  if (currentScreen === 'login') {
    return <Login onNavigate={setCurrentScreen} />
  }

  if (currentScreen === 'register') {
    return <Register onNavigate={setCurrentScreen} />
  }

  if (!user) {
    return <Login onNavigate={setCurrentScreen} />
  }

  return (
    <>
      <AppLayout
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onLogout={handleLogout}
      >
        {currentScreen === 'home' ? <Home onNavigate={setCurrentScreen} onNewTransaction={() => setIsTransactionModalOpen(true)} /> : null}
        {currentScreen === 'dashboard' ? <Dashboard onNewTransaction={() => setIsTransactionModalOpen(true)} /> : null}
        {currentScreen === 'history' ? <History onNewTransaction={() => setIsTransactionModalOpen(true)} /> : null}
        {currentScreen === 'goals' ? <Goals /> : null}
      </AppLayout>
      {isTransactionModalOpen && <NewTransaction onClose={() => setIsTransactionModalOpen(false)} />}
    </>
  )
}

function App() {
  return <AppProvider><AppContent /></AppProvider>
}

export default App
