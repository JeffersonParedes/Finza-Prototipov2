import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { CheckCircle, Upload, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import styles from './NewTransaction.module.scss'

type TransactionType = 'income' | 'expense'

interface TransactionErrors {
  description: string
  amount: string
  category: string
  date: string
}

interface NewTransactionProps {
  onClose: () => void
}

const categories: Record<TransactionType, string[]> = {
  income: ['Trabajo', 'Freelance', 'Inversiones', 'Otros'],
  expense: ['Alimentación', 'Transporte', 'Entretenimiento', 'Trabajo', 'Compras', 'Otros'],
}

function getTodayDate() {
  const today = new Date()
  const localOffset = today.getTimezoneOffset() * 60_000
  return new Date(today.getTime() - localOffset).toISOString().slice(0, 10)
}

function formatAmount(amount: number) {
  return amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function NewTransaction({ onClose }: NewTransactionProps) {
  const { dispatch, totalIncome, totalExpense } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<TransactionType>('income')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(getTodayDate)
  const [receipt, setReceipt] = useState('')
  const [errors, setErrors] = useState<TransactionErrors>({ description: '', amount: '', category: '', date: '' })
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedType, setSavedType] = useState<TransactionType>('income')

  function handleReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    setReceipt(event.target.files?.[0]?.name ?? '')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const numericAmount = Number(amount)
    const nextErrors: TransactionErrors = {
      description: description.trim() ? '' : 'La descripción es obligatoria',
      amount: !amount.trim() ? 'El monto es obligatorio' : !Number.isFinite(numericAmount) || numericAmount <= 0 ? 'El monto debe ser mayor que 0' : '',
      category: category ? '' : 'Selecciona una categoría',
      date: date ? '' : 'Selecciona una fecha',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: `transaction-${Date.now()}`,
        type,
        description: description.trim(),
        amount: numericAmount,
        category,
        date,
        ...(receipt ? { receipt } : {}),
      },
    })
    setSavedType(type)
    setShowSuccess(true)
  }

  function changeType(nextType: TransactionType) {
    setType(nextType)
    setCategory('')
    setErrors((current) => ({ ...current, category: '' }))
  }

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      {showSuccess ? (
        <Card className={`${styles.modal} ${styles.successModal}`} role="dialog" aria-modal="true" aria-labelledby="transaction-success-title">
          <CheckCircle className={styles.successIcon} size={48} aria-hidden="true" />
          <h2 id="transaction-success-title">Operación exitosa</h2>
          <p>{savedType === 'income' ? 'Ingreso' : 'Gasto'} registrado exitosamente.</p>
          {savedType === 'income' ? (
            <div className={styles.analysis}>
              <h3>Buen progreso financiero</h3>
              <p>Este ingreso mejora tu salud financiera. Tus ingresos del mes suman S/ {formatAmount(totalIncome)}.</p>
              <span>SUGERENCIAS:</span>
              <p>Considera destinar parte de este ingreso a tus metas de ahorro. Llevar un control de gastos te ayudará a mantener este buen hábito.</p>
            </div>
          ) : (
            <div className={styles.analysis}>
              <h3>Gasto registrado</h3>
              <p>Tus gastos del mes suman S/ {formatAmount(totalExpense)}. Recuerda mantener un balance saludable.</p>
            </div>
          )}
          <Button variant="primary" onClick={onClose}>Aceptar</Button>
        </Card>
      ) : (
        <Card className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="new-transaction-title">
          <div className={styles.header}>
            <div>
              <h2 id="new-transaction-title">Nueva Transacción</h2>
              <p>Registra un movimiento en tus finanzas.</p>
            </div>
            <button className={styles.closeButton} type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
          </div>

          <div className={styles.typeToggle} role="group" aria-label="Tipo de transacción">
            <button type="button" aria-pressed={type === 'income'} className={`${styles.typeButton} ${type === 'income' ? styles.incomeActive : ''}`} onClick={() => changeType('income')}>Ingreso</button>
            <button type="button" aria-pressed={type === 'expense'} className={`${styles.typeButton} ${type === 'expense' ? styles.expenseActive : ''}`} onClick={() => changeType('expense')}>Gasto</button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input label="Descripción" placeholder="Ej. Pago de mi sueldo" value={description} onChange={(event) => setDescription(event.target.value)} error={errors.description} autoFocus />
            <Input label="Monto" type="number" min="0.01" step="0.01" placeholder="0" value={amount} onChange={(event) => setAmount(event.target.value)} error={errors.amount} />
            <label className={styles.selectField} htmlFor="transaction-category">Categoría
              <select id="transaction-category" value={category} onChange={(event) => setCategory(event.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'transaction-category-error' : undefined}>
                <option value="">Selecciona una categoría</option>
                {categories[type].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {errors.category && <span className={styles.errorMessage} id="transaction-category-error" role="alert">{errors.category}</span>}
            </label>
            <Input label="Fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} error={errors.date} />
            <div className={styles.fileField}>
              <span>Comprobante <small>(opcional)</small></span>
              <input ref={fileInputRef} className={styles.fileInput} type="file" onChange={handleReceiptChange} aria-label="Seleccionar comprobante" />
              <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}><Upload size={16} aria-hidden="true" />Seleccionar archivo</Button>
              {receipt && <span className={styles.fileName}>{receipt}</span>}
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
              <Button variant={type} type="submit">Guardar {type === 'income' ? 'Ingreso' : 'Gasto'}</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

export default NewTransaction
