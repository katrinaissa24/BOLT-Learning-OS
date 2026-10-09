import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { DataProvider } from './lib/data'
import AppShell from './components/layout/AppShell'
import Landing from './pages/Landing'
import AuthPage from './pages/Auth'
import { Spinner } from './components/ui'

import StudentHome from './pages/student/Home'
import StudentCourses from './pages/student/Courses'
import StudentJourney from './pages/student/Journey'
import StudentLesson from './pages/student/Lesson'
import StudentLeaderboard from './pages/student/Leaderboard'
import StudentPassport from './pages/student/Passport'
import StudentSchedule from './pages/student/Schedule'
import StudentLab from './pages/student/Lab'
import StudentProjects from './pages/student/Projects'

import TeacherHome from './pages/teacher/Home'
import TeacherTracker from './pages/teacher/Tracker'
import TeacherInsights from './pages/teacher/Insights'
import TeacherReview from './pages/teacher/Review'
import TeacherPractice from './pages/teacher/Practice'
import TeacherRecognition from './pages/teacher/Recognition'
import TeacherProjects from './pages/teacher/Projects'

import ParentLens from './pages/parent/Lens'
import ParentAlerts from './pages/parent/Alerts'
import ParentJourney from './pages/parent/Journey'
import ParentSchedule from './pages/parent/Schedule'
import ParentIdeas from './pages/parent/Ideas'

function RequireRole({ role, children }) {
  const { loading, profile } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-8 h-8" /></div>
  if (!profile) return <Navigate to="/auth" state={{ from: loc.pathname }} replace />
  if (profile.role !== role) return <Navigate to={`/${profile.role}`} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/student" element={<RequireRole role="student"><AppShell role="student" /></RequireRole>}>
            <Route index element={<StudentHome />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:courseId" element={<StudentJourney />} />
            <Route path="courses/:courseId/lessons/:lessonId" element={<StudentLesson />} />
            <Route path="leaderboard" element={<StudentLeaderboard />} />
            <Route path="passport" element={<StudentPassport />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="lab" element={<StudentLab />} />
            <Route path="lab/:activity" element={<StudentLab />} />
            <Route path="projects" element={<StudentProjects />} />
          </Route>

          <Route path="/teacher" element={<RequireRole role="teacher"><AppShell role="teacher" /></RequireRole>}>
            <Route index element={<TeacherHome />} />
            <Route path="tracker" element={<TeacherTracker />} />
            <Route path="tracker/:studentId" element={<TeacherTracker />} />
            <Route path="insights" element={<TeacherInsights />} />
            <Route path="insights/:lessonId" element={<TeacherInsights />} />
            <Route path="review" element={<TeacherReview />} />
            <Route path="review/:submissionId" element={<TeacherReview />} />
            <Route path="practice" element={<TeacherPractice />} />
            <Route path="practice/:studentId" element={<TeacherPractice />} />
            <Route path="recognition" element={<TeacherRecognition />} />
            <Route path="projects" element={<TeacherProjects />} />
          </Route>

          <Route path="/parent" element={<RequireRole role="parent"><AppShell role="parent" /></RequireRole>}>
            <Route index element={<ParentLens />} />
            <Route path="alerts" element={<ParentAlerts />} />
            <Route path="journey" element={<ParentJourney />} />
            <Route path="schedule" element={<ParentSchedule />} />
            <Route path="ideas" element={<ParentIdeas />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  )
}
