import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 14px",
    borderRadius: "8px",
    color: "#fff",
    textDecoration: "none",
    backgroundColor: isActive ? "#0d6efd" : "transparent",
    fontWeight: isActive ? "600" : "400",
  });

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      
      {/* Top Header */}
      <div
        className="text-white d-flex justify-content-between align-items-center px-4"
        style={{ height: "56px", backgroundColor: "#0d6efd" }}
      >
        <h5 className="mb-0">Student Dashboard</h5>
        <button onClick={handleLogout} className="btn btn-light btn-sm">
          Logout
        </button>
      </div>

      <div className="d-flex" style={{ height: "calc(100vh - 56px)" }}>
        
        {/* Sidebar */}
        <div
          className="p-3 text-white"
          style={{ width: "220px", backgroundColor: "#1e293b" }}
        >
          <NavLink to="" end style={navStyle}>
            🏠 Dashboard
          </NavLink>

          <NavLink to="materials" style={navStyle}>
            📚 Materials
          </NavLink>

          <NavLink to="assessments" style={navStyle}>
            📝 Assessments
          </NavLink>

          <NavLink to="announcements" style={navStyle}>
            📢 Announcements
          </NavLink>
        </div>

        {/* Main Content */}
        <div
          className="flex-grow-1 p-4"
          style={{ backgroundColor: "#f1f5f9", overflowY: "auto" }}
        >
          <div
            className="shadow p-4 bg-white"
            style={{ maxWidth: "1200px", margin: "0 auto", borderRadius: "12px" }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
