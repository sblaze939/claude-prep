import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { MockExams } from './pages/MockExams';
import { Simulator } from './pages/Simulator';
import { Practice } from './pages/Practice';
import { Dashboard } from './pages/Dashboard';
import { Resources } from './pages/Resources';
import { StudyPlan } from './pages/StudyPlan';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exams" element={<MockExams />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/plan" element={<StudyPlan />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
