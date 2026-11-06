import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, Briefcase, CheckCircle, Download, FileText, Plus, ShoppingBag } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import type { Transaction } from '../../types'
import styles from './History.module.scss'

type FilterType = 'all' | 'income' | 'expense'

interface HistoryProps {
  onNewTransaction: () => void
}

function formatAmount(amount: number) {
  return amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date: string) {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date
  return parsedDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income'
  const Icon = isIncome ? Briefcase : ShoppingBag

  return (
    <tr>
      <td>
        <div className={styles.descriptionCell}>
          <span className={styles.rowIcon}><Icon size={18} aria-hidden="true" /></span>
          <span>{transaction.description}</span>
        </div>
      </td>
      <td className={isIncome ? styles.incomeAmount : styles.expenseAmount}>
        {isIncome ? '+' : '-'}S/ {formatAmount(transaction.amount)}
      </td>
      <td><span className={styles.category}>{transaction.category}</span></td>
      <td>
        <span className={`${styles.typeBadge} ${isIncome ? styles.incomeBadge : styles.expenseBadge}`}>
          {isIncome ? <ArrowDownLeft size={14} aria-hidden="true" /> : <ArrowUpRight size={14} aria-hidden="true" />}{isIncome ? 'Ingreso' : 'Gasto'}
        </span>
      </td>
      <td>{formatDate(transaction.date)}</td>
    </tr>
  )
}

export function History({ onNewTransaction }: HistoryProps) {
  const { transactions, totalIncome, totalExpense, balance } = useApp()
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  const filteredTransactions = useMemo(
    () => filterType === 'all' ? transactions : transactions.filter((transaction) => transaction.type === filterType),
    [filterType, transactions],
  )

  return (
    <main className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>HISTORIAL</span>
          <h2 className={styles.pageTitle}>Transacciones</h2>
          <p className={styles.subtitle}>Todos tus movimientos, en un solo lugar.</p>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setIsPdfModalOpen(true)}><Download size={16} />PDF</Button>
          <Button variant="primary" onClick={onNewTransaction}><Plus size={16} />Nueva</Button>
        </div>
      </header>

      <section className={styles.overviewRow}>
        <div className={styles.filterRow}>
          <label htmlFor="transaction-filter">Tipo</label>
          <select id="transaction-filter" value={filterType} onChange={(event) => setFilterType(event.target.value as FilterType)}>
            <option value="all">Todas</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>

      <Card className={styles.summaryCard}>
        <div className={styles.summaryHeading}><h2>Resumen del historial</h2><span className={styles.transactionCount}>{transactions.length} transacciones</span></div>
        <div className={styles.summaryColumns}>
          <div><span>Ingresos</span><strong className={styles.incomeAmount}>S/ {formatAmount(totalIncome)}</strong></div>
          <div><span>Gastos</span><strong className={styles.expenseAmount}>S/ {formatAmount(totalExpense)}</strong></div>
          <div><span>Balance</span><strong>S/ {formatAmount(balance)}</strong></div>
        </div>
        <p>Mostrando todos los movimientos registrados.</p>
      </Card>
      </section>

      <Card className={styles.tableCard}>
        <header className={styles.tableHeading}><h2>Tus movimientos</h2><span>Más recientes primero</span></header>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr><th>Descripción</th><th>Monto</th><th>Categoría</th><th>Tipo</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              )) : (
                <tr><td colSpan={5} className={styles.emptyState}>No hay transacciones que coincidan con el filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className={styles.tableFooter}><span>Mostrando 1–{filteredTransactions.length} de {transactions.length} transacciones</span><nav className={styles.pagination} aria-label="Paginación"><button type="button" aria-label="Página anterior" disabled><ArrowLeft size={16} /></button><span className={styles.currentPage}>1</span><button type="button" aria-label="Página siguiente" disabled><ArrowRight size={16} /></button></nav></footer>
      </Card>

      <aside className={styles.infoBanner}><FileText size={20} aria-hidden="true" /><p>Lleva tus cuentas contigo. Exporta tu historial en PDF para revisarlo cuando lo necesites.</p></aside>

      {isPdfModalOpen && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsPdfModalOpen(false) }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="pdf-modal-title">
            <CheckCircle className={styles.successIcon} size={48} aria-hidden="true" />
            <h2 id="pdf-modal-title">Reporte generado</h2>
            <p>El reporte PDF de tus transacciones ha sido generado correctamente.</p>
            <Button variant="primary" onClick={() => setIsPdfModalOpen(false)}>Aceptar</Button>
          </section>
        </div>
      )}

    </main>
  )
}

export default History
