import { useState, type FormEvent } from 'react'
import { AlertTriangle, Award, CheckCircle, Plus, Target, Trash2, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Goal } from '../../types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import GoalCard from '../../components/ui/GoalCard'
import styles from './Goals.module.scss'

type GoalTab = 'in-progress' | 'completed'
type GoalModalType = 'aportar' | 'editar' | 'eliminar' | 'mon' | null

interface GoalErrors {
  name: string
  targetAmount: string
  deadline: string
}

export function Goals() {
  const { goals, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState<GoalTab>('in-progress')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [errors, setErrors] = useState<GoalErrors>({ name: '', targetAmount: '', deadline: '' })
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [modalType, setModalType] = useState<GoalModalType>(null)
  const [contribution, setContribution] = useState('')
  const [contributionError, setContributionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const inProgressGoals = goals.filter((goal) => goal.status === 'in-progress')
  const completedGoals = goals.filter((goal) => goal.status === 'completed')
  const visibleGoals = activeTab === 'in-progress' ? inProgressGoals : completedGoals
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const progress = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0

  function openCreateModal() {
    setErrors({ name: '', targetAmount: '', deadline: '' })
    setName('')
    setTargetAmount('')
    setDeadline('')
    setIsCreateModalOpen(true)
  }

  function openGoalModal(goal: Goal, type: Exclude<GoalModalType, null>) {
    setSelectedGoal(goal)
    setModalType(type)
    setContribution('')
    setContributionError('')
    setErrors({ name: '', targetAmount: '', deadline: '' })
    if (type === 'editar') {
      setName(goal.name)
      setTargetAmount(String(goal.targetAmount))
      setDeadline(goal.deadline)
    }
  }

  function showSuccess(message: string) {
    setModalType(null)
    setSuccessMessage(message)
    setIsSuccessModalOpen(true)
  }

  function handleContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedGoal) return
    const numericAmount = Number(contribution)
    let error = ''
    if (!contribution.trim()) error = 'Ingresa el monto del aporte'
    else if (!Number.isFinite(numericAmount) || numericAmount <= 0) error = 'El monto debe ser mayor que 0'
    else if (numericAmount > selectedGoal.targetAmount - selectedGoal.currentAmount) error = 'El aporte no puede superar el monto objetivo'
    setContributionError(error)
    if (error) return

    dispatch({ type: 'ADD_FUNDS', payload: { goalId: selectedGoal.id, amount: numericAmount } })
    showSuccess('Aporte registrado exitosamente.')
  }

  function handleEditGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedGoal) return
    const numericTarget = Number(targetAmount)
    const nextErrors: GoalErrors = {
      name: name.trim() ? '' : 'Ingresa el nombre de la meta',
      targetAmount: !targetAmount.trim() || !Number.isFinite(numericTarget) || numericTarget <= 0 ? 'El monto debe ser mayor que 0' : '',
      deadline: deadline ? '' : 'Selecciona una fecha límite',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    dispatch({
      type: 'EDIT_GOAL',
      payload: { goalId: selectedGoal.id, updates: { name: name.trim(), targetAmount: numericTarget, deadline } },
    })
    showSuccess('Meta actualizada exitosamente.')
  }

  function handleDeleteGoal() {
    if (!selectedGoal) return
    dispatch({ type: 'DELETE_GOAL', payload: selectedGoal.id })
    showSuccess('Meta eliminada exitosamente.')
  }

  function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const numericTarget = Number(targetAmount)
    const nextErrors: GoalErrors = {
      name: name.trim() ? '' : 'Ingresa el nombre de la meta',
      targetAmount: !targetAmount.trim() || !Number.isFinite(numericTarget) || numericTarget <= 0 ? 'El monto debe ser mayor que 0' : '',
      deadline: deadline ? '' : 'Selecciona una fecha límite',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    dispatch({
      type: 'ADD_GOAL',
      payload: {
        id: `goal-${Date.now()}`,
        name: name.trim(),
        targetAmount: numericTarget,
        currentAmount: 0,
        deadline,
        status: 'in-progress',
        level: 'BRONCE',
      },
    })
    setName('')
    setTargetAmount('')
    setDeadline('')
    setIsCreateModalOpen(false)
    setActiveTab('in-progress')
    setSuccessMessage('Meta creada exitosamente')
    setIsSuccessModalOpen(true)
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AHORRO</span>
          <h1 className={styles.pageTitle}>Metas de Ahorro</h1>
          <p className={styles.subtitle}>Dale un propósito a cada sol que ahorras.</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}><Plus size={18} aria-hidden="true" />Nueva Meta</Button>
      </header>

      <Card className={styles.levelPanel}>
        <Award className={styles.awardIcon} size={36} aria-hidden="true" />
        <div className={styles.levelContent}>
          <div className={styles.levelHeading}>
            <h2>Nivel BRONCE</h2>
            <span>Progreso global: {progress}%</span>
          </div>
          <div className={styles.globalProgressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso global de metas">
            <span className={styles.globalProgressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.completedCount}>{completedGoals.length} de {goals.length} completadas</p>
        </div>
      </Card>

      <section className={styles.goalsSection}>
        <div className={styles.tabs} role="tablist" aria-label="Filtrar metas">
          <button type="button" role="tab" aria-selected={activeTab === 'in-progress'} className={activeTab === 'in-progress' ? styles.activeTab : ''} onClick={() => setActiveTab('in-progress')}>
            En progreso ({inProgressGoals.length})
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'completed'} className={activeTab === 'completed' ? styles.activeTab : ''} onClick={() => setActiveTab('completed')}>
            Completadas ({completedGoals.length})
          </button>
        </div>

        {visibleGoals.length > 0 ? (
          <div className={styles.goalList} role="tabpanel">
            {visibleGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onMon={() => openGoalModal(goal, 'mon')}
                onAportar={() => openGoalModal(goal, 'aportar')}
                onEditar={() => openGoalModal(goal, 'editar')}
                onEliminar={() => openGoalModal(goal, 'eliminar')}
              />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className={styles.emptyState} role="tabpanel">
            <Target size={56} aria-hidden="true" />
            <p>No hay metas activas. Crea una nueva meta para empezar.</p>
            <Button variant="primary" onClick={openCreateModal}>Crear mi primera meta</Button>
          </div>
        ) : (
          <p className={styles.emptyTabState} role="tabpanel">
            {activeTab === 'completed' ? 'Aún no hay metas completadas.' : 'No hay metas en progreso.'}
          </p>
        )}
      </section>

      {isCreateModalOpen && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateModalOpen(false) }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-goal-title">
            <div className={styles.modalHeader}>
              <h2 id="create-goal-title">Nueva Meta</h2>
              <button className={styles.closeButton} type="button" aria-label="Cerrar" onClick={() => setIsCreateModalOpen(false)}><X size={20} /></button>
            </div>
            <form className={styles.form} onSubmit={handleCreateGoal} noValidate>
              <Input label="Nombre de la meta" placeholder="Nombre de la meta" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} autoFocus />
              <Input label="Monto objetivo" type="number" min="0.01" step="0.01" placeholder="0" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} error={errors.targetAmount} />
              <Input label="Fecha límite" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} error={errors.deadline} />
              <div className={styles.modalActions}>
                <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                <Button variant="primary" type="submit">Guardar Meta</Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modalType && selectedGoal && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalType(null) }}>
          {modalType === 'aportar' && (
            <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="contribute-title">
              <div className={styles.modalHeader}>
                <h2 id="contribute-title">Aportar a {selectedGoal.name}</h2>
                <button className={styles.closeButton} type="button" aria-label="Cerrar" onClick={() => setModalType(null)}><X size={20} /></button>
              </div>
              <form className={styles.form} onSubmit={handleContribution} noValidate>
                <Input label="Monto del aporte" type="number" min="0.01" step="0.01" placeholder="0" value={contribution} onChange={(event) => setContribution(event.target.value)} error={contributionError} autoFocus />
                <div className={styles.modalActions}>
                  <Button variant="secondary" type="button" onClick={() => setModalType(null)}>Cancelar</Button>
                  <Button variant="primary" type="submit">Registrar aporte</Button>
                </div>
              </form>
            </section>
          )}

          {modalType === 'editar' && (
            <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-goal-title">
              <div className={styles.modalHeader}>
                <h2 id="edit-goal-title">Editar Meta</h2>
                <button className={styles.closeButton} type="button" aria-label="Cerrar" onClick={() => setModalType(null)}><X size={20} /></button>
              </div>
              <form className={styles.form} onSubmit={handleEditGoal} noValidate>
                <Input label="Nombre" placeholder="Nombre de la meta" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} autoFocus />
                <Input label="Monto objetivo" type="number" min="0.01" step="0.01" placeholder="0" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} error={errors.targetAmount} />
                <Input label="Fecha límite" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} error={errors.deadline} />
                <div className={styles.modalActions}>
                  <Button variant="secondary" type="button" onClick={() => setModalType(null)}>Cancelar</Button>
                  <Button variant="primary" type="submit">Guardar cambios</Button>
                </div>
              </form>
            </section>
          )}

          {modalType === 'eliminar' && (
            <section className={`${styles.modal} ${styles.deleteModal}`} role="dialog" aria-modal="true" aria-labelledby="delete-goal-title">
              <AlertTriangle className={styles.warningIcon} size={44} aria-hidden="true" />
              <h2 id="delete-goal-title">¿Estás seguro de que deseas eliminar esta meta?</h2>
              <p>Vas a eliminar '{selectedGoal.name}'. Esta acción no se puede deshacer.</p>
              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setModalType(null)}>Cancelar</Button>
                <Button className={styles.deleteButton} variant="danger" onClick={handleDeleteGoal}><Trash2 size={16} aria-hidden="true" />Eliminar</Button>
              </div>
            </section>
          )}

          {modalType === 'mon' && (() => {
            const currentProgress = selectedGoal.targetAmount > 0
              ? Math.min(100, Math.max(0, Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)))
              : 0
            const completed = selectedGoal.currentAmount >= selectedGoal.targetAmount
            return (
              <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="tracking-title">
                <div className={styles.modalHeader}>
                  <h2 id="tracking-title">Seguimiento de la meta</h2>
                  <button className={styles.closeButton} type="button" aria-label="Cerrar" onClick={() => setModalType(null)}><X size={20} /></button>
                </div>
                <div className={styles.trackingContent}>
                  <h3>{selectedGoal.name}</h3>
                  <p className={styles.trackingAmounts}>S/ {selectedGoal.currentAmount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / S/ {selectedGoal.targetAmount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p>Progreso: {currentProgress}%</p>
                  <div className={styles.trackingProgress} role="progressbar" aria-valuenow={currentProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de ${selectedGoal.name}`}>
                    <span className={completed ? styles.trackingComplete : ''} style={{ width: `${currentProgress}%` }} />
                  </div>
                  <p className={styles.trackingMeta}>Fecha límite: {new Date(`${selectedGoal.deadline}T00:00:00`).toLocaleDateString('es-PE')}</p>
                  <p className={styles.trackingStatus}>{completed ? 'Completada' : 'En progreso'}</p>
                </div>
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={() => setModalType(null)}>Cerrar</Button>
                </div>
              </section>
            )
          })()}
        </div>
      )}

      {isSuccessModalOpen && (
        <div className={styles.modalOverlay} role="presentation">
          <section className={`${styles.modal} ${styles.successModal}`} role="dialog" aria-modal="true" aria-labelledby="success-goal-title">
            <CheckCircle className={styles.awardIcon} size={48} aria-hidden="true" />
            <h2 id="success-goal-title">Operación exitosa</h2>
            <p>{successMessage || 'Meta creada exitosamente'}</p>
            <Button variant="primary" onClick={() => { setIsSuccessModalOpen(false); setSelectedGoal(null) }}>Aceptar</Button>
          </section>
        </div>
      )}
    </main>
  )
}

export default Goals
