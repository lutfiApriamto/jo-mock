# JO-MOCK Frontend

React single-page application for the JO-MOCK platform. Built with Vite, React 19, Tailwind CSS v4, and modern state management.

---

## Tech Stack

| Category | Library |
|----------|---------|
| Build | Vite 8 |
| UI | React 19 (JavaScript, no TypeScript) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Routing | react-router-dom v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 (with persist middleware) |
| HTTP | Axios (centralized instance at `src/lib/axios.js`) |
| Animation | Framer Motion (UI), GSAP (landing page) |
| Forms | React Hook Form + Zod validation |
| Toast | react-hot-toast |
| Icons | react-icons (FontAwesome), lucide-react |
| Code editor | CodeMirror via @uiw/react-codemirror |
| Diff viewer | react-diff-viewer-continued |
| Syntax highlight | Shiki |

---

## Getting Started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173` by default. Proxies `/mock` requests to `http://localhost:3000` (dev server).

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── context/            # React context (ThemeContext)
├── features/           # Feature-based modules
│   ├── admin/
│   │   └── services/       # Admin API service layer
│   └── auth/
│       └── hooks/          # useLogout, etc.
├── layouts/            # Page layouts
│   ├── AdminLayout/        # Admin panel layout (sidebar + topbar)
│   │   ├── index.jsx       # Orchestrator
│   │   ├── constants.js    # Sidebar widths
│   │   ├── utils.js        # getInitials helper
│   │   └── components/     # Sidebar, Topbar, Breadcrumb, etc.
│   ├── DashboardLayout/    # User dashboard layout (same pattern)
│   ├── AuthLayout.jsx
│   ├── DocsLayout.jsx
│   └── PublicLayout.jsx
├── lib/                # Axios instance, shared utils
├── pages/              # Route page components
│   ├── admin/              # AdminDashboardPage, AdminUsersPage, AdminProjectsPage
│   ├── auth/               # Login, Register, ForgotPassword, ResetPassword
│   ├── dashboard/          # Projects, ProjectDetail, EndpointDetail, Profile
│   ├── docs/               # Documentation pages
│   └── ...                 # Landing, Pricing, Changelog, NotFound
├── router/             # Route definitions (react-router)
├── shared/             # Shared/reusable code
│   ├── components/         # ProtectedRoute, AdminRoute, DigitalClock, etc.
│   ├── constants/          # docsConfig, etc.
│   └── hooks/              # Shared custom hooks
└── stores/             # Zustand stores
    ├── authStore.js            # Auth state (user, token) with persist
    ├── sidebarStore.js         # Dashboard sidebar state with persist
    └── adminSidebarStore.js    # Admin sidebar state with persist
```

---

## Architecture Patterns

### State Management

- **Server state** (API data): TanStack Query with query keys like `['admin', 'users', { page, q }]`
- **Client state** (UI): Zustand stores with `persist` middleware for localStorage
- **Auth**: Zustand store → JWT stored in memory, auto-attached via Axios interceptor

### Data Fetching

```js
// Standard pattern for paginated queries
const { data, isPending } = useQuery({
  queryKey: ['admin', 'projects', { page, q }],
  queryFn: () => listAllProjects({ page, limit: 10, q }).then(r => ({
    projects: r.data.data.data,
    meta: r.data.data.meta,
  })),
  staleTime: 15_000,
  placeholderData: (prev) => prev,
})
```

### Mutations with Toast Loading

```js
const mutation = useMutation({
  mutationFn: () => someApiCall(args),
  onMutate: () => toast.loading('Processing...', { id: 'my-toast' }),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['...'] })
    toast.success('Done!', { id: 'my-toast' })
  },
  onError: (err) => {
    toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed', { id: 'my-toast' })
  },
})
```

### Lazy Loading

All page components use `React.lazy` + `Suspense` for code splitting:

```js
const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminProjectsPage'))
```

### Responsive Design

- Desktop: grid tables with full columns
- Mobile: card-based layouts
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)

---

## Theme System

CSS-first theming with CSS variables defined in `src/index.css`. Supports light and dark mode via `ThemeContext`.

Key token categories:
- `--color-background`, `--color-foreground` — base colors
- `--color-brand-primary` — accent color
- `--color-bg-surface` — elevated surfaces
- `--color-border` — borders
- `--color-muted-foreground` — secondary text
- `--color-status-{success,warning,danger}` — semantic colors

---

## Deployment (Vercel)

```bash
npm run build
vercel --prod
```

See `vercel.json` for SPA rewrite configuration. All routes redirect to `index.html` for client-side routing.

---

## Backend API

The frontend communicates with the backend at the URL configured in the Axios instance (`src/lib/axios.js`). The backend response envelope format:

```
res.data.data.data   → payload
res.data.data.meta   → pagination metadata
```

Pagination meta shape: `{ total, page, limit, totalPages, hasNextPage, hasPrevPage }`
