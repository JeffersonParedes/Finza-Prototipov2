import { Award, Calendar, Coins, Gift, Monitor, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import type { Goal } from '../../types'
import Button from './Button'
import Card from './Card'
import styles from './GoalCard.module.scss'

interface GoalCardProps {
  goal: Goal
  onMon: () => void
  onAportar: () => void
  onEditar: () => void
  onEliminar: () => void
}

function formatAmount(amount: number) {
  return amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString('es-PE')
}

function getGoalIcon(name: string) {
  const normalizedName = name.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (normalizedName.includes('regalo') || normalizedName.includes('novia')) return Gift
  if (normalizedName.includes('pc') || normalizedName.includes('grafica') || normalizedName.includes('tarjeta')) return Monitor
  return Target
}

export function GoalCard({ goal, onMon, onAportar, onEditar, onEliminar }: GoalCardProps) {
  const isCompleted = goal.currentAmount >= goal.targetAmount
  const progress = goal.targetAmount > 0
    ? Math.min(100, Math.max(0, Math.round((goal.currentAmount / goal.targetAmount) * 100)))
    : 0
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
  const GoalIcon = getGoalIcon(goal.name)

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span className={styles.goalIcon}><GoalIcon size={22} aria-hidden="true" /></span>
        <span className={`${styles.status} ${isCompleted ? styles.completed : ''}`}>
          {isCompleted ? 'Completada' : 'En progreso'}
        </span>
      </div>

      <h2 className={styles.name}>{goal.name}</h2>
      <p className={styles.amounts}>S/ {formatAmount(goal.currentAmount)} <span>/</span> S/ {formatAmount(goal.targetAmount)}</p>

      <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de ${goal.name}`}>
        <span className={`${styles.progressFill} ${isCompleted ? styles.progressCompleted : ''}`} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.progressText}>
        <span>{isCompleted ? 'Meta alcanzada' : `Te falta S/ ${formatAmount(remaining)}`}</span>
        <span>{progress}%</span>
      </div>

      <div className={styles.meta}>
        <span><Calendar size={15} aria-hidden="true" />{formatDate(goal.deadline)}</span>
        <span><Award size={15} aria-hidden="true" />{goal.level || 'BRONCE'}</span>
      </div>

      <footer className={styles.actions}>
        <Button className={`${styles.actionButton} ${styles.secondaryAction}`} variant="secondary" onClick={onMon}>
          <Coins size={16} aria-hidden="true" />Mon
        </Button>
        <Button className={styles.actionButton} variant="primary" onClick={onAportar}>
          <Plus size={16} aria-hidden="true" />Aportar
        </Button>
        <Button className={`${styles.actionButton} ${styles.secondaryAction}`} variant="secondary" onClick={onEditar}>
          <Pencil size={16} aria-hidden="true" />Editar
        </Button>
        <Button className={styles.actionButton} variant="danger" onClick={onEliminar}>
          <Trash2 size={16} aria-hidden="true" />Eliminar
        </Button>
      </footer>
    </Card>
  )
}

export default GoalCard
