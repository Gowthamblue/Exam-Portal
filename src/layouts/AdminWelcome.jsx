import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

function AdminLayout() {
  const navigate = useNavigate();
  const adminName = "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Active sidebar link styling
  const navLinkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 14px",
    borderRadius: "8px",
    color: "#fff",
    textDecoration: "none",
    backgroundColor: isActive ? "#0d6efd" : "transparent",
    fontWeight: isActive ? "600" : "400",
    transition: "all 0.2s ease"
  });

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      
      {/* Top Navbar */}
      <Navbar role="admin" name={adminName} color={"#02142cff"} />

      <div className="d-flex" style={{ height: "calc(100vh - 56px)" }}>
        
        {/* Sidebar */}
        <div
          className="text-white p-3 d-flex flex-column justify-content-between"
          style={{
            width: "250px",
            backgroundColor: "#02142cff",
            borderRight: "1px solid #1f2937"
          }}
        >
          <div className="mt-3">

            <ul className="nav flex-column gap-2">

              <li>
                <NavLink to="students" style={navLinkStyle}>
                  👤 Students
                </NavLink>
              </li>

              <li>
                <NavLink to="assessments" style={navLinkStyle}>
                  📝 Assessments
                </NavLink>
              </li>

              <li>
                <NavLink to="materials" style={navLinkStyle}>
                  📚 Materials
                </NavLink>
              </li>

              <li>
                <NavLink to="announcements" style={navLinkStyle}>
                  📢 Announcements
                </NavLink>
              </li>

            </ul>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-danger w-100 mt-3"
          >
            🚪 Logout
          </button>
        </div>

        {/* Main Content */}
        <div
          className="flex-grow-1 p-4"
          style={{
            overflowY: "auto",
            backgroundColor: "#f1f5f9"
          }}
        >
          <div
            className="w-100 shadow-lg p-4"
            style={{
              maxWidth: "1400px",
              backgroundColor: "white",
              minHeight: "100%",
              borderRadius: "12px",
              margin: "0 auto"
            }}
          >
            {/* Child Routes Render Here */}
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminLayout;
