import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin sections
import Departments from "./admin/depatments/Departments";
import StudentsList from "./admin/students/StudentsList";
import StudentDetails from "./admin/students/StudentDetails";
import Assessments from "./admin/assessments/Assessments";
import Materials from "./admin/materials/Materials";
import Announcements from "./admin/announcements/Announcements";
import AIAssessmentGenerator from "./admin/ai/AIAssessmentGenerator";
import AdminResultsPage from "./admin/results/AdminResultpage";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./student/StudentDashboard";
import StudentMaterials from "./student/StudentMaterials";
import StudentAssessments from "./student/StudentAssessments";
import StudentAnnouncements from "./student/StudentAnnoucements";
import MyResults from "./student/MyResults";
import AttemptAssessment from "./student/AttemptAssessment";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentProfile from "./student/StudentProfile";

import Home from "./Home";
import AdminWelcomePage from "./pages/AdminWelcomePage";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />} />

        {/* Admin Layout — protected, role: admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminWelcomePage/>} />
          <Route path="students" element={<StudentsList />} />
          <Route path="student/:id" element={<StudentDetails />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="ai-generator" element={<AIAssessmentGenerator />} />
          <Route path="materials" element={<Materials />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="departments" element={<Departments />} />
          <Route path="results" element={<AdminResultsPage />} />
        </Route>

        {/* Student Layout — protected, role: student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="results" element={<MyResults />} />
          <Route path="assessments" element={<StudentAssessments />} />
          <Route path="attempt/:id" element={<AttemptAssessment />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;