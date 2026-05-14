import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Landing } from './pages/Landing';
import { Portal } from './pages/Portal';
import { CourseViewer } from './pages/CourseViewer';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white font-sans selection:bg-golive/10 selection:text-golive">
          <Navigation />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/course/:courseId" element={<CourseViewer />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
