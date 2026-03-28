import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__dot" />
        <Link to="/boards" className="navbar__title">TaskBoard</Link>
      </div>

      <div className="navbar__right">
        {user.role === 'admin' && (
          <Link to="/admin" className="navbar__admin-badge">
            admin
          </Link>
        )}
        <span className="navbar__user">@{user.username}</span>
        <button className="btn btn-ghost navbar__logout" onClick={handleLogout}>
          Chiqish
        </button>
      </div>
    </nav>
  )
}