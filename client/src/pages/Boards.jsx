import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import './Boards.css'

export default function Boards() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', desc: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchBoards = useCallback(async () => {
    try {
      const { data } = await api.get('/boards')
      setBoards(data.boards)
    } catch {
      setError('Boardlarni yuklashda xato')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    try {
      await api.post('/boards', form)
      setForm({ title: '', desc: '' })
      setShowModal(false)
      fetchBoards()
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Boardni o\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/boards/${id}`)
      setBoards(boards.filter(b => b.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi')
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="boards-page">
      <Navbar />

      <div className="boards-container">
        <div className="boards-header">
          <div>
            <h1 className="boards-title">Boardlar</h1>
            <p className="boards-sub">
              {user.role === 'admin' ? 'Barcha boardlar' : 'Sizning boardlaringiz'}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Yangi board
          </button>
        </div>

        {error && <p className="boards-error">{error}</p>}

        {loading ? (
          <div className="boards-loader">
            {[1,2,3].map(i => <div key={i} className="board-skeleton" />)}
          </div>
        ) : boards.length === 0 ? (
          <div className="boards-empty">
            <span className="boards-empty__icon">⬡</span>
            <p>Hali board yo&apos;q. Birinchisini yarating!</p>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board, i) => (
              <div
                key={board.id}
                className="board-card card"
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => navigate(`/boards/${board.id}`)}
              >
                <div className="board-card__accent" />
                <div className="board-card__body">
                  <h3 className="board-card__title">{board.board_title}</h3>
                  {board.board_desc && (
                    <p className="board-card__desc">{board.board_desc}</p>
                  )}
                </div>
                <div className="board-card__footer">
                  <span className="board-card__meta">
                    @{board.created_by_username} · {formatDate(board.board_created_at)}
                  </span>
                  {(board.board_created_by === user.id || user.role === 'admin') && (
                    <button
                      className="btn btn-danger board-card__del"
                      onClick={(e) => handleDelete(e, board.id)}
                    >
                      O&apos;chir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Yangi board</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="modal__form">
              <div className="auth-field">
                <label className="auth-label">Nomi *</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Board nomi"
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