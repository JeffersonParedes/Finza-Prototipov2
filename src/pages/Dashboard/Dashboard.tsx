import { Plus, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import styles from './Dashboard.module.scss'

const categoryColors = ['var(--finza-expense)', 'var(--finza-primary)', '#AB9EFF', 'var(--finza-income)']
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const monthlyPattern = [0.62, 0.78, 0.91, 0.72, 1.08, 0.86, 1.12, 0.94, 0.81, 1.17, 0.98, 1.01]

function formatAmount(amount: number) {
  return amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildMonthlySeries(totalIncome: number, totalExpense: number) {
  const patternTotal = monthlyPattern.reduce((sum, factor) => sum + factor, 0)
  return months.map((month, index) => ({
    month,
    income: Math.round((totalIncome * monthlyPattern[index]) / patternTotal),
    expense: Math.round((totalExpense * monthlyPattern[11 - index]) / patternTotal),
  }))
}

function getTrend(monthlyData: { expense: number }[]) {
  const previous = monthlyData.slice(0, 6).reduce((sum, month) => sum + month.expense, 0)
  const recent = monthlyData.slice(6).reduce((sum, month) => sum + month.expense, 0)
  if (previous === recent || previous === 0 && recent === 0) return 'Todo estable'
  return recent > previous ? 'Al alza' : 'A la baja'
}

interface DashboardProps {
  onNewTransaction: () => void
}

export function Dashboard({ onNewTransaction }: DashboardProps) {
  const { transactions, totalIncome, totalExpense, balance } = useApp()
  const forecast = totalExpense > 0 ? totalExpense * 0.9 : 0
  const expensesByCategory = transactions.reduce<Record<string, number>>((groups, transaction) => {
    if (transaction.type === 'expense') {
      groups[transaction.category] = (groups[transaction.category] ?? 0) + transaction.amount
    }
    return groups
  }, {})
  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))
  const monthlyData = buildMonthlySeries(totalIncome, totalExpense)
  const trend = getTrend(monthlyData)

  const summaries = [
    { title: 'Ingresos', value: `+S/ ${formatAmount(totalIncome)}`, icon: TrendingUp, kind: 'income' },
    { title: 'Gastos', value: `-S/ ${formatAmount(totalExpense)}`, icon: TrendingDown, kind: 'expense' },
    { title: 'Balance', value: `S/ ${formatAmount(balance)}`, icon: Wallet, kind: 'balance' },
    { title: 'Pronóstico próximo mes', value: `S/ ${formatAmount(forecast)}`, icon: Sparkles, kind: 'forecast' },
  ] as const

  return (
    <main className={styles.container}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>RESUMEN</span>
        <h1 className={styles.pageTitle}>Dashboard Financiero</h1>
        <p className={styles.subtitle}>Tus finanzas, de un vistazo.</p>
      </header>

      <section className={styles.summaryGrid} aria-label="Resumen financiero">
        {summaries.map(({ title, value, icon: Icon, kind }) => (
          <Card className={styles.summaryCard} key={title}>
            <div className={styles.summaryHeader}>
              <h2>{title}</h2>
              <Icon className={styles[kind]} size={22} aria-hidden="true" />
            </div>
            <p className={styles.summaryValue}>{value}</p>
          </Card>
        ))}
      </section>

      <section className={styles.chartGrid} aria-label="Análisis por categoría">
        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Gastos por Categoría</h2>
          {categoryData.length === 0 ? (
            <p className={styles.emptyState}>Aún no hay gastos para mostrar por categoría.</p>
          ) : (
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label stroke="none" isAnimationActive animationDuration={1500}>
                    {categoryData.map((category, index) => (
                      <Cell key={category.name} fill={categoryColors[index % categoryColors.length]} fillOpacity={index >= categoryColors.length ? Math.max(0.55, 1 - (Math.floor(index / categoryColors.length) * 0.12)) : 1} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--finza-surface)', border: '1px solid rgba(vars.$color-text-primary, 0.2)', borderRadius: 12, color: 'var(--finza-text-primary)' }} />
                  <Legend formatter={(value) => <span style={{ color: 'var(--finza-text-secondary)' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Comparación por Categoría</h2>
          {categoryData.length === 0 ? (
            <p className={styles.emptyState}>Registra gastos para comparar tus categorías.</p>
          ) : (
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--finza-text-primary-rgb), 0.15)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--finza-text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--finza-text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--finza-surface)', border: '1px solid rgba(vars.$color-text-primary, 0.2)', borderRadius: 12, color: 'var(--finza-text-primary)' }} />
                  <Bar dataKey="value" name="Gastos" fill="var(--finza-primary)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>

      <section aria-labelledby="monthly-title">
        <Card className={styles.chartCard}>
          <h2 className={styles.chartTitle} id="monthly-title">Evolución Mensual</h2>
          <div className={`${styles.chart} ${styles.monthlyChart}`}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--finza-text-primary-rgb), 0.15)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--finza-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--finza-text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--finza-surface)', border: '1px solid rgba(vars.$color-text-primary, 0.2)', borderRadius: 12, color: 'var(--finza-text-primary)' }} />
                <Legend formatter={(value) => <span style={{ color: 'var(--finza-text-secondary)' }}>{value}</span>} />
                <Line type="monotone" dataKey="income" name="Ingresos" stroke="var(--finza-income)" strokeWidth={3} dot={false} isAnimationActive animationDuration={1500} />
                <Line type="monotone" dataKey="expense" name="Gastos" stroke="var(--finza-expense)" strokeWidth={3} dot={false} isAnimationActive animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className={styles.predictiveSection}>
        <h2 className={styles.predictiveTitle}>Análisis Predictivo</h2>
        <div className={styles.predictiveGrid}>
          <Card className={styles.predictiveCard}>
            <h3>Gastado este mes</h3>
            <p>S/ {formatAmount(totalExpense)}</p>
          </Card>
          <Card className={styles.predictiveCard}>
            <h3>Pronóstico próximo mes</h3>
            <p>S/ {formatAmount(forecast)}</p>
          </Card>
          <Card className={styles.predictiveCard}>
            <h3>Tendencia</h3>
            <p>{trend}</p>
          </Card>
        </div>
      </section>
      <button className={styles.fab} type="button" onClick={onNewTransaction}>
        <Plus size={20} aria-hidden="true" />Nueva Transacción
      </button>
    </main>
  )
}

export default Dashboard
