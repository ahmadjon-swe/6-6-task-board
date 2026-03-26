import { Routes, Route, Navigate } from 'react-router-dom'
import BoardsPage from './pages/BoardsPage'
import TasksPage from './pages/TasksPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardsPage />} />
      <Route path="/board/:id" element={<TasksPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App