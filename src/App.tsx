import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ProtectedRoute from '@/routes/ProtectedRoute'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout'

// Lazy loaded pages
const HeroPage = lazy(() => import('@/pages/HeroPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const Unauthorized = lazy(() => import('@/pages/Unauthorized'))

// Dashboard
const StudentDashboard = lazy(() => import('@/pages/dashboard/StudentDashboard'))

// Career
const InternshipsPage = lazy(() => import('@/pages/career/InternshipsPage'))
const FreelancePage = lazy(() => import('@/pages/career/FreelancePage'))
const MicroTasksPage = lazy(() => import('@/pages/career/MicroTasksPage'))
const ApplicationHistory = lazy(() => import('@/pages/career/ApplicationHistory'))

// Alumni
const AlumniDirectory = lazy(() => import('@/pages/alumni/AlumniDirectory'))
const AlumniMentorship = lazy(() => import('@/pages/alumni/AlumniMentorship'))
const AlumniEvents = lazy(() => import('@/pages/alumni/AlumniEvents'))
const AlumniDonations = lazy(() => import('@/pages/alumni/AlumniDonations'))
const AlumniSuccessStories = lazy(() => import('@/pages/alumni/AlumniSuccessStories'))
const AlumniJobReferrals = lazy(() => import('@/pages/alumni/AlumniJobReferrals'))

// Study
const PdfLibrary = lazy(() => import('@/pages/study/PdfLibrary'))
const FlashcardsPage = lazy(() => import('@/pages/study/FlashcardsPage'))
const StudyProgress = lazy(() => import('@/pages/study/StudyProgress'))
const NotesManager = lazy(() => import('@/pages/study/NotesManager'))

// Social
const SocialFeed = lazy(() => import('@/pages/social/SocialFeed'))

// Academics
const AcademicsPage = lazy(() => import('@/pages/academics/AcademicsPage'))
const NoticeBoard = lazy(() => import('@/pages/academics/NoticeBoard'))

// Admin
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HeroPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<StudentDashboard />} />

          {/* Academics */}
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/academics/attendance" element={<AcademicsPage />} />
          <Route path="/academics/results" element={<AcademicsPage />} />
          <Route path="/academics/assignments" element={<AcademicsPage />} />
          <Route path="/academics/fees" element={<AcademicsPage />} />

          {/* Career Hub */}
          <Route path="/career/internships" element={<InternshipsPage />} />
          <Route path="/career/freelance" element={<FreelancePage />} />
          <Route path="/career/microtasks" element={<MicroTasksPage />} />
          <Route path="/career/applications" element={<ApplicationHistory />} />

          {/* Study Tools */}
          <Route path="/study/pdf" element={<PdfLibrary />} />
          <Route path="/study/flashcards" element={<FlashcardsPage />} />
          <Route path="/study/progress" element={<StudyProgress />} />
          <Route path="/study/notes" element={<NotesManager />} />

          {/* Alumni */}
          <Route path="/alumni" element={<AlumniDirectory />} />
          <Route path="/alumni/mentorship" element={<AlumniMentorship />} />
          <Route path="/alumni/events" element={<AlumniEvents />} />
          <Route path="/alumni/donations" element={<AlumniDonations />} />
          <Route path="/alumni/stories" element={<AlumniSuccessStories />} />
          <Route path="/alumni/referrals" element={<AlumniJobReferrals />} />

          {/* Social */}
          <Route path="/social" element={<SocialFeed />} />

          {/* Notices */}
          <Route path="/notices" element={<NoticeBoard />} />

          {/* Admin - restricted to admin role */}
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/verify" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />

          {/* Faculty */}
          <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={['faculty']}><AdminPanel /></ProtectedRoute>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
