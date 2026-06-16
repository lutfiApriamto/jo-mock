import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes, FaSearch, FaUserPlus, FaLock } from 'react-icons/fa'
import useAuthStore from '@/stores/authStore'
import { searchUsers } from '@/features/user/services/userService'
import { inviteMember } from '@/features/member/services/memberService'
import { useProjectCtx } from '../context'
import { projectKeys } from '../queryKeys'

// Definisi role — keterangan desc berubah jika PM quota penuh
const ROLE_DEFS = [
  {
    value: 'PM',
    label: 'Project Manager (PM)',
    desc:  'Manage endpoints, approve change requests, invite & manage members',
  },
  {
    value: 'FE',
    label: 'Frontend (FE)',
    desc:  'View endpoints, toggle responses, submit change requests',
  },
  {
    value: 'BE',
    label: 'Backend (BE)',
    desc:  'View endpoints, toggle responses, submit change requests',
  },
]

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'

export default function InviteMemberModal({ onClose }) {
  const { project, membersQuery, invitationsQuery } = useProjectCtx()
  const queryClient = useQueryClient()
  const authUser    = useAuthStore(s => s.user)
  const inputRef    = useRef(null)
  const debounceRef = useRef(null)

  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [selected,  setSelected]  = useState(null)
  const [role,      setRole]      = useState('FE')

  // Hitung apakah kuota PM sudah terisi (member aktif atau undangan pending)
  const members            = membersQuery.data ?? []
  const pendingInvitations = invitationsQuery.data?.invitations ?? []
  const pmQuotaFull = members.some(m => m.role === 'PM' && !m.isOwner)
                   || pendingInvitations.some(inv => inv.role === 'PM')

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Debounced search — filter diri sendiri dari hasil
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); return }
    clearTimeout(debounceRef.current)
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchUsers(q)
        const all = res.data.data.data ?? []
        // Exclude diri sendiri dari hasil pencarian
        setResults(all.filter(u => u._id !== authUser?._id))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, authUser?._id])

  const mutation = useMutation({
    mutationFn: () => inviteMember(project._id, selected._id, role),
    onMutate:  () => toast.loading('Sending invite…'),
    onSuccess: (data, vars, tid) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.invitations(project._id) })
      toast.success(`Invite sent to ${selected.name}.`, { id: tid })
      onClose()
    },
    onError: (err, vars, tid) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to send invite.', { id: tid })
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-2xl border border-border/50 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-[17px] text-foreground">Invite Member</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              <FaTimes size={12} />
            </button>
          </div>

          <div className="space-y-4">
            {/* User search */}
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Search by name or email
              </label>
              {selected ? (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                  border border-brand-primary/40 bg-brand-primary/5">
                  <div className="w-7 h-7 rounded-full bg-brand-primary/15 flex items-center justify-center
                    text-[11px] font-semibold text-brand-primary shrink-0">
                    {getInitials(selected.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">{selected.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{selected.email}</div>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setQuery('') }}
                    className="text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    <FaTimes size={11} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <FaSearch size={11} className="absolute left-3.5 top-1/2 -translate-y-1/2
                    text-muted-foreground/40 pointer-events-none" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type name or email…"
                    className="w-full pl-9 pr-3.5 py-[10px] rounded-xl text-sm text-foreground
                      bg-background border border-border/60 placeholder:text-muted-foreground/30
                      focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                      transition-all duration-150"
                  />

                  {/* Dropdown results */}
                  {query.trim().length >= 2 && (
                    <div className="absolute z-10 w-full top-full mt-1 rounded-xl border border-border
                      bg-background shadow-lg overflow-hidden">
                      {searching ? (
                        <div className="px-4 py-3 text-[12px] text-muted-foreground">Searching…</div>
                      ) : results.length === 0 ? (
                        <div className="px-4 py-3 text-[12px] text-muted-foreground">No users found.</div>
                      ) : (
                        results.map(u => (
                          <button
                            key={u._id}
                            onClick={() => { setSelected(u); setQuery('') }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5
                              hover:bg-bg-surface transition-colors duration-100 text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center
                              text-[11px] font-semibold text-brand-primary shrink-0">
                              {getInitials(u.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-foreground truncate">{u.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Role
              </label>
              <div className="space-y-2">
                {ROLE_DEFS.map(r => {
                  const isPmDisabled = r.value === 'PM' && pmQuotaFull
                  return (
                    <label
                      key={r.value}
                      className={[
                        'flex items-start gap-3 p-3 rounded-xl border transition-all duration-150',
                        isPmDisabled
                          ? 'border-border/30 opacity-50 cursor-not-allowed bg-bg-surface/30'
                          : role === r.value
                            ? 'border-brand-primary/40 bg-brand-primary/5 cursor-pointer'
                            : 'border-border/60 hover:border-border hover:bg-bg-surface cursor-pointer',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={() => !isPmDisabled && setRole(r.value)}
                        disabled={isPmDisabled}
                        className="mt-0.5 accent-brand-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-foreground">{r.label}</span>
                          {isPmDisabled && <FaLock size={9} className="text-muted-foreground/40" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {isPmDisabled
                            ? 'PM quota full — change or cancel the existing PM invitation first'
                            : r.desc
                          }
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                  text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
                Cancel
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !selected}
                className="flex-1 flex items-center justify-center gap-2 py-[10px] rounded-xl
                  bg-brand-primary text-white text-sm font-semibold
                  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
                <FaUserPlus size={11} />
                {mutation.isPending ? 'Sending…' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
