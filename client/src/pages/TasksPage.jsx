import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const STATUSES = ['Pending', 'In Progress', 'Partial', 'Completed']

const statusColor = {
  'Pending':     '#f0ad4e',
  'In Progress': '#5bc0de',
  'Partial':     '#9b59b6',
  'Completed':   '#5cb85c',
}

export default function TasksPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks]         = useState([])
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const limit                     = 8
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask]   = useState(null)
  const [form, setForm]           = useState({ title: '', desc: '', status: 'Pending' })

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`/get_all_tasks/${id}`, {
        params: { page, limit, search }
      })
      setTasks(res.data.tasks)
    } catch (err) {
      console.error(err)
    }
  }, [page, search, id, limit])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const openAdd = () => {
    setEditTask(null)
    setForm({ title: '', desc: '', status: 'Pending' })
    setShowModal(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({ title: task.task_title, desc: task.task_desc, status: task.task_status })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (editTask) {
        await api.put(`/update_task/${editTask.id}`, form)
      } else {
        await api.post(`/add_task/${id}`, { title: form.title, desc: form.desc })
      }
      setShowModal(false)
      fetchTasks()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Taskni o\'chirish?')) return
    await api.delete(`/delete_task/${taskId}`)
    fetchTasks()
  }

  return (
    <div className="container">
      <div className="header">
        <button className="btn" onClick={() => navigate('/')}>← Orqaga</button>
        <h1>Tasklar</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Task qo'shish</button>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="Qidirish..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="">Barcha statuslar</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid">
        {tasks.map(task => (
          <div key={task.id} className="card">
            <span className="badge" style={{ background: statusColor[task.task_status] }}>
              {task.task_status}
            </span>
            <h2>{task.task_title}</h2>
            <p>{task.task_desc}</p>
            <div className="card-actions">
              <button className="btn btn-edit" onClick={() => openEdit(task)}>Tahrirlash</button>
              <button className="btn btn-delete" onClick={() => handleDelete(task.id)}>O'chirish</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
        <span>Sahifa {page}</span>
        <button disabled={tasks.length < limit} onClick={() => setPage(p => p + 1)}>→</button>
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editTask ? 'Taskni tahrirlash' : 'Yangi task'}</h2>
            <input
              placeholder="Sarlavha"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Tavsif"
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
            />
            {editTask && (
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>Saqlash</button>
              <button className="btn" onClick={() => setShowModal(false)}>Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}