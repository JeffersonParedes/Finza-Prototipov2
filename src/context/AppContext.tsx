import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import type { Goal, Transaction, User } from '../types'

export interface AppState {
  user: User | null
  transactions: Transaction[]
  goals: Goal[]
}

export type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'EDIT_GOAL'; payload: { goalId: string; updates: Partial<Pick<Goal, 'name' | 'targetAmount' | 'deadline'>> } }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_FUNDS'; payload: { goalId: string; amount: number } }

export interface AppContextValue extends AppState {
  totalIncome: number
  totalExpense: number
  balance: number
  dispatch: Dispatch<AppAction>
}

const initialState: AppState = { user: null, transactions: [], goals: [] }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] }
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] }
    case 'EDIT_GOAL':
      return {
        ...state,
        goals: state.goals.map((goal) => {
          if (goal.id !== action.payload.goalId) return goal
          const updatedGoal = { ...goal, ...action.payload.updates }
          return { ...updatedGoal, status: updatedGoal.currentAmount >= updatedGoal.targetAmount ? 'completed' : 'in-progress' }
        }),
      }
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.payload) }
    case 'ADD_FUNDS':
      return {
        ...state,
        goals: state.goals.map((goal) => {
          if (goal.id !== action.payload.goalId) return goal
          const currentAmount = goal.currentAmount + action.payload.amount
          return { ...goal, currentAmount, status: currentAmount >= goal.targetAmount ? 'completed' : 'in-progress' }
        }),
      }
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const value = useMemo<AppContextValue>(() => {
    const totalIncome = state.transactions.reduce((sum, transaction) => transaction.type === 'income' ? sum + transaction.amount : sum, 0)
    const totalExpense = state.transactions.reduce((sum, transaction) => transaction.type === 'expense' ? sum + transaction.amount : sum, 0)
    return { ...state, dispatch, totalIncome, totalExpense, balance: totalIncome - totalExpense }
  }, [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider')
  return context
}
