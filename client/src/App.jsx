import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Boards from './pages/Boards'
import BoardDetail from './pages/BoardDetail'
import Admin from './pages/Admin'

const isAuth = () => !!localStorage.getItem('token')

function PrivateRoute({ children }) {
  return isAuth() ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  return !isAuth() ? children : <Navigate to="/boards" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/boards"   element={<PrivateRoute><Boards /></PrivateRoute>} />
        <Route path="/boards/:id" element={<PrivateRoute><BoardDetail /></PrivateRoute>} />
        <Route path="/admin"    element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to={isAuth() ? '/boards' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}