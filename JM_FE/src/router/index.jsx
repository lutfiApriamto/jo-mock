import { createBrowserRouter } from 'react-router-dom'

import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import AdminRoute from '@/shared/components/AdminRoute'

import LandingPage from '@/pages/LandingPage'
import NotFoundPage from '@/pages/NotFoundPage'

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

const router = createBrowserRouter([
  // Public
  { path: '/', element: <LandingPage /> },
  { path: '/invitations/:token', element: <InvitationPage /> },

  // Auth (guest only)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Dashboard (protected)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <ProjectsPage /> },
          { path: '/dashboard/projects/:projectId', element: <ProjectDetailPage /> },
          { path: '/dashboard/projects/:projectId/endpoints/:endpointId', element: <EndpointDetailPage /> },
          { path: '/dashboard/profile', element: <ProfilePage /> },
          { path: '/dashboard/invitations', element: <InvitationsPage /> },
        ],
      },
    ],
  },

  // Admin (superadmin only)
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/projects', element: <AdminProjectsPage /> },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
])

export default router
