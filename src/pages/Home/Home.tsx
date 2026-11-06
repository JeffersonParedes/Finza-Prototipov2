import { Briefcase, Plus, ShoppingBag, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import type { Screen } from '../../components/layout/AppLayout'
import { useApp } from '../../context/AppContext'
import type { Transaction } from '../../types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import styles from './Home.module.scss'

interface HomeProps {
  onNavigate: (screen: Screen) => void
  onNewTransaction: () => void
}

function formatAmount(amount: number) {
  return amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date: string) {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date
  return parsedDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function RecentTransaction({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income'
  const Icon = isIncome ? Briefcase : ShoppingBag

  return (
    <li className={styles.transactionItem}>
      <span className={`${styles.transactionIcon} ${isIncome ? styles.incomeIcon : styles.expenseIcon}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className={styles.transactionDetails}>
        <span className={styles.transactionDescription}>{transaction.description}</span>
        <span className={styles.transactionMeta}>{transaction.category} · {formatDate(transaction.date)}</span>
      </div>
      <span className={`${styles.transactionAmount} ${isIncome ? styles.incomeAmount : styles.expenseAmount}`}>
        {isIncome ? '+' : '-'}S/ {formatAmount(transaction.amount)}
      </span>
    </li>
  )
}

export function Home({ onNavigate, onNewTransaction }: HomeProps) {
  const { user, transactions, totalIncome, totalExpense, balance } = useApp()
  const recentTransactions = [...transactions].slice(-5).reverse()
  const name = user?.name || 'Usuario'

  const summaries = [
    { title: 'Ingresos', value: `+ S/ ${formatAmount(totalIncome)}`, icon: TrendingUp, kind: 'income' },
    { title: 'Gastos', value: `- S/ ${formatAmount(totalExpense)}`, icon: TrendingDown, kind: 'expense' },
    { title: 'Balance Total', value: `S/ ${formatAmount(balance)}`, icon: Wallet, kind: 'balance' },
  ] as const

  return (
    <div className={styles.container}>
      <header className={styles.welcome}>
        <span className={styles.eyebrow}>TU DÍA A DÍA</span>
        <h1 className={styles.title}>Hola, {name}</h1>
        <p className={styles.subtitle}>Cada decisión cuenta. Aquí ves tus finanzas.</p>
      </header>

      <section className={styles.summaryGrid} aria-label="Resumen financiero">
        {summaries.map(({ title, value, icon: Icon, kind }) => (
          <Card className={styles.summaryCard} key={title}>
            <div className={styles.summaryTop}>
              <h2 className={styles.summaryTitle}>{title}</h2>
              <Icon className={styles[kind]} size={22} aria-hidden="true" />
            </div>
            <p className={styles.summaryValue}>{value}</p>
          </Card>
        ))}
      </section>

      <section className={styles.recentSection}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>Transacciones Recientes</h2>
          <Button variant="secondary" onClick={() => onNavigate('history')}>Ver historial</Button>
        </div>

        {recentTransactions.length === 0 ? (
          <p className={styles.emptyState}>No hay transacciones aún. ¡Registra tu primer ingreso!</p>
        ) : (
          <ul className={styles.transactionList}>
            {recentTransactions.map((transaction) => (
              <RecentTransaction key={transaction.id} transaction={transaction} />
            ))}
          </ul>
        )}
      </section>

      <p className={styles.note}>Tus cifras se actualizan con cada transacción registrada.</p>
      <button className={styles.fab} type="button" onClick={onNewTransaction}>
        <Plus size={20} aria-hidden="true" />Nueva Transacción
      </button>
    </div>
  )
}

export default Home
