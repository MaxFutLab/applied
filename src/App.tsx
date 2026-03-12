import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RouteErrorBoundary } from './components/RouteErrorBoundary'
import { AdminPage } from './pages/AdminPage'
import { AttendanceListPage } from './pages/AttendanceListPage'
import { CheckInPage } from './pages/CheckInPage'
import { CheckOutPage } from './pages/CheckOutPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <RouteErrorBoundary>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/check-out" element={<CheckOutPage />} />
          <Route path="/attendances" element={<AttendanceListPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </RouteErrorBoundary>
  )
}

export default App
