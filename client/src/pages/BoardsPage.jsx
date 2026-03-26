import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function BoardsPage() {
  const [boards, setBoards]       = useState([])
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [limit]                   = useState(6)
  const [showModal, setShowModal] = useState(false)
  const [editBoard, setEditBoard] = useState(null)
  const [form, setForm]           = useState({ title: '', desc: '' })
  const navigate = useNavigate()

  const fetchBoards = async () => {
    try {
      const res = await api.get('/get_all_boards', {
        params: { page, limit, search }
      })
      setBoards(res.data.boards)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchBoards() }, [page, search])

  const openAdd = () => {
    setEditBoard(null)
    setForm({ title: '', desc: '' })
    setShowModal(true)
  }

  const openEdit = (e, board) => {
    e.stopPropagation()
    setEditBoard(board)
    setForm({ title: board.board_title, desc: board.board_desc })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (editBoard) {
        await api.put(`/update_board/${editBoard.id}`, form)
      } else {
        await api.post('/add_board', form)
      }
      setShowModal(false)
      fetchBoards()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Boardni o\'chirish?')) return
    await api.delete(`/delete_board/${id}`)
    fetchBoards()
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Task Boards</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Board qo'shish</button>
      </div>

      <input
        className="search-input"
        placeholder="Qidirish..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
      />

      <div className="grid">
        {boards.map(board => (
          <div key={board.id} className="card" onClick={() => navigate(`/board/${board.id}`)}>
            <h2>{board.board_title}</h2>
            <p>{board.board_desc}</p>
            <div className="card-actions">
              <button className="btn btn-edit" onClick={e => openEdit(e, board)}>Tahrirlash</button>
              <button className="btn btn-delete" onClick={e => handleDelete(e, board.id)}>O'chirish</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
        <span>Sahifa {page}</span>
        <button disabled={boards.length < limit} onClick={() => setPage(p => p + 1)}>→</button>
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editBoard ? 'Boardni tahrirlash' : 'Yangi board'}</h2>
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