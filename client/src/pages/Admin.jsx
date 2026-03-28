import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import './Admin.css'

export default function Admin() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user.role !== 'admin') navigate('/boards')
  }, [user.role, navigate])

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.users)
    } catch {
      setError('Foydalanuvchilarni yuklashda xato')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleEdit = (u) => {
    setEditUser(u)
    setEditForm({ username: u.user_username, email: u.user_email, role: u.user_role })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/admin/users/${editUser.id}`, editForm)
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi? Uning barcha board va tasklari ham o\'chadi!')) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Xato')
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin panel</h1>
            <p className="admin-sub">Foydalanuvchilarni boshqarish</p>
          </div>
          <span className="admin-badge">
            {users.length} ta foydalanuvchi
          </span>
        </div>

        {error && <p className="admin-error">{error}</p>}

        {loading ? (
          <div className="admin-loading">Yuklanmoqda...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Yaratilgan</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <td>
                      <span className="admin-username">@{u.user_username}</span>
                      {u.id === user.id && <span className="admin-me">siz</span>}
                    </td>
                    <td className="admin-email">{u.user_email}</td>
                    <td>
                      <span className={`admin-role admin-role--${u.user_role}`}>
                        {u.user_role}
                      </span>
                    </td>
                    <td className="admin-date">{formatDate(u.user_created_at)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn-ghost admin-btn" onClick={() => handleEdit(u)}>
                          Tahrir
                        </button>
                        {u.id !== user.id && (
                          <button className="btn btn-danger admin-btn" onClick={() => handleDelete(u.id)}>
                            O&apos;chir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Tahrirlash — @{editUser.user_username}</h2>
              <button className="modal__close" onClick={() => setEditUser(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal__form">
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <input
                  className="input"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Role</label>
                <select
                  className="input"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditUser(null)}>
                  Bekor
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}