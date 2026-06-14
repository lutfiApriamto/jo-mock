import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'superadmin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default AdminRoute
