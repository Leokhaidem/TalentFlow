import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import Candidates from "@/pages/Candidates";
// import Assessments from '@/pages/Assessments';
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import "./lib/msw.js"; // Initialize MSW
import JobDetail from "./pages/JobDetail.jsx";
import AssessmentBuilder from "./components/assessments/AssessmentBuilder/AssessmentBuilder.jsx";
import AssessmentTaking from "./components/assessments/AssessmentTaking/AssessmentTaking.jsx";
import CandidateProfile from "./components/candidates/CandidateProfile.jsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:jobId" element={<JobDetail />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:candidateId" element={<CandidateProfile />} />
            {/* <Route path="assessments" element={<Assessments />} /> */}
            <Route path="assessments/:jobId" element={<AssessmentBuilder />} />
            <Route
              path="assessments/:jobId/take"
              element={<AssessmentTaking />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
