import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RecruiterLogin from './pages/RecruiterLogin'
import RecruiterSignup from './pages/RecruiterSignup'
import RecruiterAnalyze from './pages/RecruiterAnalyze'
import RecruiterResults from './pages/RecruiterResults'
import Onboarding from './pages/Onboarding'
import OAuthCallback from './pages/OAuthCallback'
import Profile from './pages/Profile'
import AnalysisHistory from './pages/AnalysisHistory'
import SkillGaps from './pages/SkillGaps'
import LearningRoadmapHub from './pages/LearningRoadmapHub'
import InterviewPrepHub from './pages/InterviewPrepHub'
import Analyze from './pages/Analyze'
import Results from './pages/Results'
import Syllabus from './pages/Syllabus'
import Interview from './pages/Interview'

function RequireAuth({ children }) {
  const token = localStorage.getItem('hiresense_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/signup" element={<RecruiterSignup />} />
          <Route path="/recruiter/analyze" element={<RequireAuth><RecruiterAnalyze /></RequireAuth>} />
          <Route path="/recruiter/dashboard" element={<RequireAuth><RecruiterAnalyze /></RequireAuth>} />
          <Route path="/recruiter/results/:jobId" element={<RequireAuth><RecruiterResults /></RequireAuth>} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><AnalysisHistory /></RequireAuth>} />
          <Route path="/skill-gaps" element={<RequireAuth><SkillGaps /></RequireAuth>} />
          <Route path="/learning-roadmap" element={<RequireAuth><LearningRoadmapHub /></RequireAuth>} />
          <Route path="/interview-prep" element={<RequireAuth><InterviewPrepHub /></RequireAuth>} />
          <Route path="/analyze" element={<RequireAuth><Analyze /></RequireAuth>} />
          <Route path="/results" element={<RequireAuth><Results /></RequireAuth>} />
          <Route path="/syllabus/:skill" element={<RequireAuth><Syllabus /></RequireAuth>} />
          <Route path="/interview/:skill" element={<RequireAuth><Interview /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
