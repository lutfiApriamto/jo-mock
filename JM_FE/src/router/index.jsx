import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import ScrollToTop from '@/shared/components/ScrollToTop'
import PublicLayout from '@/layouts/PublicLayout'
import DocsLayout from '@/layouts/DocsLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import AdminRoute from '@/shared/components/AdminRoute'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

import ProjectsPage from '@/pages/dashboard/ProjectsPage'
import ProjectDetailPage from '@/pages/dashboard/ProjectDetailPage'
import EndpointDetailPage from '@/pages/dashboard/EndpointDetailPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import InvitationsPage from '@/pages/dashboard/InvitationsPage'

import InvitationPage from '@/pages/invitation/InvitationPage'

import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminProjectsPage from '@/pages/admin/AdminProjectsPage'

import { DOCS_TOC } from '@/shared/constants/docsConfig'

// ── Lazy: public pages ──────────────────────────────────────────────
const LandingPage   = lazy(() => import('@/pages/LandingPage'))
const PricingPage   = lazy(() => import('@/pages/PricingPage'))
const ChangelogPage = lazy(() => import('@/pages/ChangelogPage'))
const NotFoundPage  = lazy(() => import('@/pages/NotFoundPage'))

// ── Lazy: docs pages ────────────────────────────────────────────────
const IntroductionPage   = lazy(() => import('@/pages/docs/IntroductionPage'))
const QuickStartPage     = lazy(() => import('@/pages/docs/QuickStartPage'))
const ProjectsGuidePage  = lazy(() => import('@/pages/docs/ProjectsGuidePage'))
const EndpointsGuidePage = lazy(() => import('@/pages/docs/EndpointsGuidePage'))
const MockServerPage     = lazy(() => import('@/pages/docs/MockServerPage'))
const ChangeRequestsPage = lazy(() => import('@/pages/docs/ChangeRequestsPage'))
const CodeGeneratorPage  = lazy(() => import('@/pages/docs/CodeGeneratorPage'))
const PrivacyPolicyPage  = lazy(() => import('@/pages/docs/PrivacyPolicyPage'))
const TermsPage          = lazy(() => import('@/pages/docs/TermsPage'))

const router = createBrowserRouter([
  {
    // Root wrapper: scroll to top on every navigation + Lenis integration
    element: <ScrollToTop />,
    children: [

      // ── Public pages (Navbar + Footer via PublicLayout) ──────────
      {
        element: <PublicLayout />,
        children: [
          { path: '/',          element: <LandingPage /> },
          { path: '/pricing',   element: <PricingPage /> },
          { path: '/changelog', element: <ChangelogPage /> },
        ],
      },

      // ── Docs (DocsLayout — own navbar, 3-column) ─────────────────
      {
        element: <DocsLayout />,
        children: [
          { path: '/docs', element: <Navigate to="/docs/introduction" replace /> },
          { path: '/docs/introduction',    element: <IntroductionPage />,   handle: { toc: DOCS_TOC.introduction } },
          { path: '/docs/quick-start',     element: <QuickStartPage />,     handle: { toc: DOCS_TOC.quickStart } },
          { path: '/docs/projects',        element: <ProjectsGuidePage />,  handle: { toc: DOCS_TOC.projects } },
          { path: '/docs/endpoints',       element: <EndpointsGuidePage />, handle: { toc: DOCS_TOC.endpoints } },
          { path: '/docs/mock-server',     element: <MockServerPage />,     handle: { toc: DOCS_TOC.mockServer } },
          { path: '/docs/change-requests', element: <ChangeRequestsPage />, handle: { toc: DOCS_TOC.changeRequests } },
          { path: '/docs/code-generator',  element: <CodeGeneratorPage />,  handle: { toc: DOCS_TOC.codeGenerator } },
          { path: '/docs/privacy-policy',  element: <PrivacyPolicyPage />,  handle: { toc: DOCS_TOC.privacyPolicy } },
          { path: '/docs/terms',           element: <TermsPage />,          handle: { toc: DOCS_TOC.terms } },
        ],
      },

      { path: '/invitations/:token', element: <InvitationPage /> },

      // ── Auth (guest only) ────────────────────────────────────────
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',           element: <LoginPage /> },
          { path: '/register',        element: <RegisterPage /> },
          { path: '/forgot-password',        element: <ForgotPasswordPage /> },
          { path: '/reset-password/:token', element: <ResetPasswordPage /> },
        ],
      },

      // ── Dashboard (protected) ────────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: '/dashboard',                                                    element: <ProjectsPage /> },
              { path: '/dashboard/projects/:projectId',                               element: <ProjectDetailPage /> },
              { path: '/dashboard/projects/:projectId/endpoints/:endpointId',         element: <EndpointDetailPage /> },
              { path: '/dashboard/profile',                                           element: <ProfilePage /> },
              { path: '/dashboard/invitations',                                       element: <InvitationsPage /> },
            ],
          },
        ],
      },

      // ── Admin (superadmin only) ──────────────────────────────────
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/admin',          element: <AdminDashboardPage /> },
              { path: '/admin/users',    element: <AdminUsersPage /> },
              { path: '/admin/projects', element: <AdminProjectsPage /> },
            ],
          },
        ],
      },

      // ── 404 ──────────────────────────────────────────────────────
      {
        path: '*',
        element: (
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <NotFoundPage />
          </Suspense>
        ),
      },

    ],
  },
])

export default router
