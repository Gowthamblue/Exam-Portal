import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, deleteDoc,
  doc, query, orderBy, where
} from "firebase/firestore";
import { db } from "../../firebase";
import AdminCard from "../../components/AdminCard";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept]         = useState("");
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const fetchDepartments = async () => {
    const q = query(collection(db, "departments"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setDepartments(data);
    setLoading(false);
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleAdd = async () => {
    const name = newDept.trim().toUpperCase();
    if (!name) { setError("Department name cannot be empty."); return; }
    if (name.length > 20) { setError("Name too long (max 20 chars)."); return; }

    // Check duplicate
    const exists = departments.some((d) => d.name === name);
    if (exists) { setError(`"${name}" already exists.`); return; }

    setSaving(true);
    setError("");
    await addDoc(collection(db, "departments"), { name, createdAt: new Date() });
    setNewDept("");
    setSaving(false);
    fetchDepartments();
  };

  const handleDelete = async (id, name) => {
    // Warn if students exist in this dept
    const studentsSnap = await getDocs(
      query(collection(db, "users"), where("department", "==", name))
    );
    const studentCount = studentsSnap.size;

    const msg = studentCount > 0
      ? `"${name}" has ${studentCount} student(s). Deleting it won't remove those students but they won't appear in dept filters. Continue?`
      : `Delete department "${name}"?`;

    if (!window.confirm(msg)) return;
    await deleteDoc(doc(db, "departments", id));
    fetchDepartments();
  };

  return (
    <AdminCard title="Departments">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            {departments.length} department{departments.length !== 1 ? "s" : ""} configured
            &nbsp;·&nbsp; Used across Assessments, Materials, AI Generator &amp; Registration
          </p>
        </div>
      </div>

      {/* Add form */}
      <div
        className="p-4 rounded-3 mb-4"
        style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}
      >
        <h6 className="fw-bold mb-3">➕ Add New Department</h6>
        <div className="d-flex gap-2 align-items-start flex-wrap">
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              className="form-control"
              placeholder="e.g. IT, EEE, CIVIL"
              value={newDept}
              onChange={(e) => { setNewDept(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{ textTransform: "uppercase" }}
            />
            {error && (
              <p className="text-danger mt-1 mb-0" style={{ fontSize: "0.82rem" }}>
                ⚠ {error}
              </p>
            )}
            <p className="text-muted mt-1 mb-0" style={{ fontSize: "0.78rem" }}>
              Name will be saved in uppercase automatically.
            </p>
          </div>
          <button
            className="btn btn-primary fw-semibold"
            onClick={handleAdd}
            disabled={saving || !newDept.trim()}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
              : "💾 Add Department"}
          </button>
        </div>
      </div>

      {/* Department list */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary spinner-border-sm" />
          <p className="text-muted mt-2">Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p style={{ fontSize: "2.5rem" }}>🏛</p>
          <p>No departments added yet. Add your first department above.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {departments.map((dept, index) => (
            <div
              key={dept.id}
              className="d-flex align-items-center justify-content-between p-3 rounded-3"
              style={{
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                {/* Index badge */}
                <span
                  className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                  style={{
                    width: 36, height: 36,
                    backgroundColor: "#eff6ff",
                    color: "#0d6efd",
                    fontSize: "0.82rem",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                <div>
                  <span className="fw-bold" style={{ fontSize: "1rem" }}>
                    {dept.name}
                  </span>
                  {dept.createdAt?.toDate && (
                    <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                      Added{" "}
                      {dept.createdAt.toDate().toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>

              <button
                className="btn btn-sm btn-outline-danger"
                style={{ fontSize: "0.78rem" }}
                onClick={() => handleDelete(dept.id, dept.name)}
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      {departments.length > 0 && (
        <div
          className="mt-4 p-3 rounded-3"
          style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", fontSize: "0.82rem" }}
        >
          <strong>⚠ Note:</strong> Departments added here automatically appear in Assessments,
          Materials, AI Generator, Announcements, and the Student Registration page.
          Deleting a department does <strong>not</strong> delete existing students or data —
          it only removes it from dropdown lists.
        </div>
      )}
    </AdminCard>
  );
}

export default Departments;