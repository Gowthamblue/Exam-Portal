import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import AdminCard from "../../components/AdminCard";

const departments = ["All", "CSE", "ECE", "MECH"];

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.role === "student");
      setStudents(data);
    };

    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const deptMatch = selectedDept === "All" || s.department === selectedDept;
    const searchMatch =
      search.trim() === "" ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.registerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    return deptMatch && searchMatch;
  });

  // Count per dept for badges
  const deptCounts = students.reduce((acc, s) => {
    acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminCard title="Students">

      {/* Department Filter Tabs */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        {departments.map((dept) => {
          const count = dept === "All" ? students.length : deptCounts[dept] || 0;
          const isActive = selectedDept === dept;
          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{
                backgroundColor: isActive ? "#0d6efd" : "#f1f5f9",
                color: isActive ? "#fff" : "#374151",
                border: isActive ? "none" : "1px solid #d1d5db",
                borderRadius: "20px",
                fontWeight: isActive ? "600" : "400",
                padding: "6px 14px",
              }}
            >
              {dept}
              <span
                className="badge rounded-pill ms-1"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.3)" : "#0d6efd",
                  color: "#fff",
                  fontSize: "0.7rem",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          className="form-control"
          placeholder="🔍  Search by name, register number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p style={{ fontSize: "2rem" }}>👤</p>
          <p>
            {students.length === 0
              ? "No students registered yet."
              : "No students match the current filter."}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <p className="text-muted small mb-2">
            Showing <strong>{filtered.length}</strong> student{filtered.length !== 1 ? "s" : ""}
            {selectedDept !== "All" ? ` in ${selectedDept}` : ""}
          </p>
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Reg. Number</th>
                <th>Email</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, index) => (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td>{s.name}</td>
                  <td>
                    <code style={{ fontSize: "0.85rem" }}>{s.registerNumber}</code>
                  </td>
                  <td>{s.email}</td>
                  <td>
                    <span className="badge bg-primary">{s.department}</span>
                  </td>
                  <td>{s.phone || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/admin/student/${s.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}

export default StudentsList;