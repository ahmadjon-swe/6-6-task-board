import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import './BoardDetail.css'

const STATUSES = ['Pending', 'In Progress', 'Partial', 'Completed']

const STATUS_META = {
  'Pending':     { color: '#6b7280', glow: '#6b728040', label: 'Pending' },
  'In Progress': { color: '#3b82f6', glow: '#3b82f640', label: 'In Progress' },
  'Partial':     { color: '#f59e0b', glow: '#f59e0b40', label: 'Partial' },
  'Completed':   { color: '#10b981', glow: '#10b98140', label: 'Completed' },
}

export default function BoardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [board, setBoard] = useState(null)
  const [tasks, setTasks] = useState({ Pending: [], 'In Progress': [], Partial: [], Completed: [] })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', desc: '', assigned_to: '', due_date: '' })
  const [creating, setCreating] = useState(false)
  const [dragTask, setDragTask] = useState(null)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [boardRes, taskRes] = await Promise.all([
        api.get(`/boards/${id}`),
        api.get(`/tasks?board_id=${id}`),
      ])
      setBoard(boardRes.data.board)
      setTasks(taskRes.data.tasks)
    } catch {
      navigate('/boards')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchData() }, [fetchData])

  const totalTasks = STATUSES.reduce((s, st) => s + (tasks[st]?.length || 0), 0)

  const getPercent = (status) => {
    if (totalTasks === 0) return 0
    return Math.round(((tasks[status]?.length || 0) / totalTasks) * 100)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/tasks', {
        board_id: id,
        title: form.title,
        desc: form.desc || undefined,
        assigned_to: form.assigned_to || undefined,
        due_date: form.due_date || undefined,
      })
      setForm({ title: '', desc: '', assigned_to: '', due_date: '' })
      setShowModal(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Taskni o\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Xato')
    }
  }

  const handleDragStart = (task) => setDragTask(task)

  const handleDrop = async (status) => {
    if (!dragTask || dragTask.task_status === status) return
    try {
      await api.put(`/tasks/${dragTask.id}`, { status })
      fetchData()
    } catch {
      setError('Statusni o\'zgartirishda xato')
    }
    setDragTask(null)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'short'
  }) : null

  if (loading) return (
    <div className="bd-page">
      <Navbar />
      <div className="bd-loading">Yuklanmoqda...</div>
    </div>
  )

  return (
    <div className="bd-page">
      <Navbar />

      <div className="bd-header">
        <div className="bd-header__left">
          <button className="btn btn-ghost bd-back" onClick={() => navigate('/boards')}>
            ← Orqaga
          </button>
          <div>
            <h1 className="bd-title">{board?.board_title}</h1>
            {board?.board_desc && <p className="bd-sub">{board.board_desc}</p>}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Task qo&apos;shish
        </button>
      </div>

      {/* Progress bar */}
      <div className="bd-progress-wrap">
        <div className="bd-progress-bar">
          {STATUSES.map(st => (
            <div
              key={st}
              className="bd-progress-bar__seg"
              style={{
                width: `${getPercent(st)}%`,
                background: STATUS_META[st].color,
              }}
              title={`${STATUS_META[st].label}: ${getPercent(st)}%`}
            />
          ))}
        </div>
        <div className="bd-progress-labels">
          {STATUSES.map(st => (
            <span key={st} className="bd-progress-label" style={{ color: STATUS_META[st].color }}>
              <span className="bd-progress-label__dot" style={{ background: STATUS_META[st].color }} />
              {STATUS_META[st].label} {getPercent(st)}%
            </span>
          ))}
        </div>
      </div>

      {error && <p className="bd-error">{error}</p>}

      {/* Kolonkalar */}
      <div className="bd-columns">
        {STATUSES.map(status => {
          const meta = STATUS_META[status]
          const columnTasks = tasks[status] || []
          return (
            <div
              key={status}
              className="bd-column"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(status)}
            >
              <div className="bd-column__header" style={{ borderColor: meta.color }}>
                <div className="bd-column__title-row">
                  <span className="bd-column__dot" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glow}` }} />
                  <span className="bd-column__title">{meta.label}</span>
                  <span className="bd-column__count">{columnTasks.length}</span>
                </div>
                <span className="bd-column__pct" style={{ color: meta.color }}>
                  {getPercent(status)}%
                </span>
              </div>

              <div className="bd-column__tasks">
                {columnTasks.length === 0 && (
                  <div className="bd-column__empty">Bo&apos;sh</div>
                )}
                {columnTasks.map((task, i) => (
                  <div
                    key={task.id}
                    className="task-card card"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    style={{ animationDelay: `${i * 0.05}s`, '--st-color': meta.color }}
                  >
                    <div className="task-card__top">
                      <h4 className="task-card__title">{task.task_title}</h4>
                      {(task.task_created_by === user.id || user.role === 'admin') && (
                        <button
                          className="task-card__del"
                          onClick={() => handleDeleteTask(task.id)}
                          title="O'chirish"
                        >✕</button>
                      )}
                    </div>
                    {task.task_desc && (
                      <p className="task-card__desc">{task.task_desc}</p>
                    )}
                    <div className="task-card__footer">
                      {task.assigned_to_username && (
                        <span className="task-card__assign">@{task.assigned_to_username}</span>
                      )}
                      {task.task_due_date && (
                        <span className="task-card__due">{formatDate(task.task_due_date)}</span>
                      )}
                      {task.task_completed_at && (
                        <span className="task-card__done">✓ Done</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Yangi task</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="modal__form">
              <div className="auth-field">
                <label className="auth-label">Sarlavha *</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Task nomi"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Tavsif</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ixtiyoriy tavsif"
                  value={form.desc}
                  onChange={e => setForm({ ...form, desc: e.target.value })}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Muddati</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <div className="modal__actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Bekor
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}