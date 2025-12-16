import { Navigate, Route, Routes } from 'react-router-dom'
import { isAuthed } from './auth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
