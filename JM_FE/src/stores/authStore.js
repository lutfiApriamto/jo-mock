import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth',
      // Hanya user yang di-persist ke localStorage, BUKAN accessToken (keamanan)
      // accessToken hilang saat refresh → auto-renew via /api/auth/refresh (cookie)
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useAuthStore
