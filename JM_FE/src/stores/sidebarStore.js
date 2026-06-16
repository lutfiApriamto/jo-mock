import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSidebarStore = create(
  persist(
    (set, get) => ({
      collapsed: false,
      toggle: () => set({ collapsed: !get().collapsed }),
    }),
    { name: 'sidebar-collapsed' },
  )
)

export default useSidebarStore
