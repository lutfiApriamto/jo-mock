import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '@/stores/authStore'
import { logout as apiLogout } from '@/features/auth/services/authService'

export function useLogout() {
  const navigate  = useNavigate()
  const clearAuth = useAuthStore(s => s.clearAuth)

  return useCallback(async () => {
    const tid = toast.loading('Signing out…')
    try {
      await apiLogout()
    } catch {
      // ignore — clear local state regardless
    } finally {
      clearAuth()
      toast.success('Signed out.', { id: tid })
      navigate('/login')
    }
  }, [navigate, clearAuth])
}
