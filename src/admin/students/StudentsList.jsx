import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import AdminCard from "../../components/AdminCard";

const departments = ["All", "CSE", "ECE", "MECH"];

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null); // stores student being deleted
  const [confirmId, setConfirmId] = useState(null); // stores id to confirm delete

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "users", id));
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert("Failed to delete student. Please try again.");
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  };

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
                    <div style={{ display:"flex", gap:6 }}>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/admin/student/${s.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setConfirmId(s.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Confirm Delete Modal */}
      {confirmId && (() => {
        const st = students.find(s => s.id === confirmId);
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
            display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
            <div style={{ background:"#fff", borderRadius:14, padding:"28px 32px",
              maxWidth:400, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
              <div style={{ textAlign:"center", marginBottom:16 }}>
                <div style={{ fontSize:"2.5rem" }}>⚠️</div>
                <h5 style={{ fontWeight:700, color:"#0f172a", marginTop:8 }}>Remove Student?</h5>
              </div>
              <p style={{ color:"#374151", fontSize:".9rem", textAlign:"center", marginBottom:8 }}>
                You are about to permanently remove:
              </p>
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8,
                padding:"12px 16px", marginBottom:20, textAlign:"center" }}>
                <p style={{ margin:0, fontWeight:700, color:"#991b1b" }}>{st?.name}</p>
                <p style={{ margin:"4px 0 0", fontSize:".82rem", color:"#dc2626" }}>
                  {st?.registerNumber} · {st?.department}
                </p>
              </div>
              <p style={{ color:"#64748b", fontSize:".8rem", textAlign:"center", marginBottom:20 }}>
                This will remove the student account. Their results will remain in the database.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <button
                  onClick={() => setConfirmId(null)}
                  style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid #e2e8f0",
                    background:"#fff", cursor:"pointer", fontWeight:600, fontSize:".88rem" }}>
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmId)}
                  disabled={deleting === confirmId}
                  style={{ flex:1, padding:"10px", borderRadius:8, border:"none",
                    background:"#dc2626", color:"#fff", cursor:"pointer",
                    fontWeight:700, fontSize:".88rem" }}>
                  {deleting === confirmId ? "Removing…" : "Yes, Remove"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </AdminCard>
  );
}

export default StudentsList;