export interface User {
  id: string
  name: string
  email: string
  age: number
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  date: string
  receipt?: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  status: 'in-progress' | 'completed'
  level: string
}
