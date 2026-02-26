import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminWelcome";

// Admin sections
import StudentsList from "./admin/students/StudentsList";
import StudentDetails from "./admin/students/StudentDetails";
import Assessments from "./admin/assessments/Assessments";
import Materials from "./admin/materials/Materials";
import Announcements from "./admin/announcements/Announcements";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./student/Dashboard";

import StudentMaterials from "./student/StudentMaterials";
import StudentAssessments from "./student/StudentAssessments";
import StudentAnnouncements from "./student/StudentAnnoucements";
import Login from "./pages/Login";
import Register from "./pages/Register";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>

          <Route
            index
            element={<h2>Welcome Admin 👋</h2>}
          />
          <Route path="students" element={<StudentsList />} />
          <Route path="students/:id" element={<StudentDetails />} />

          <Route path="assessments" element={<Assessments />} />
          <Route path="materials" element={<Materials />} />
          <Route path="announcements" element={<Announcements />} />

        </Route>


          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />



          <Route path="/student" element={<StudentLayout />}>
          <Route
            index
            element={<StudentDashboard/>}
          />
          <Route path="students" element={<StudentsList />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="assessments" element={<StudentAssessments />} />
          <Route path="materials" element={<StudentMaterials/>} />
          <Route path="announcements" element={<StudentAnnouncements />} />

        </Route>
          


      </Routes>
    </BrowserRouter>
  );
}

export default App;
