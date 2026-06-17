import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAdminSidebarStore = create(
  persist(
    (set, get) => ({
      collapsed: false,
      toggle: () => set({ collapsed: !get().collapsed }),
    }),
    { name: 'admin-sidebar-collapsed' },
  )
)

export default useAdminSidebarStore
