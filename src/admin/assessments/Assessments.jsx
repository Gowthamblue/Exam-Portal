import { useEffect, useState } from "react";
import AdminCard from "../../components/AdminCard";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../../firebase";

const departments = ["CSE", "ECE", "MECH"];

function Assessments() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [tab, setTab] = useState("google");

  const [assessments, setAssessments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formLink, setFormLink] = useState("");
  const [lastDate, setLastDate] = useState("");

  const [aiAssessments, setAiAssessments] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAssessments = async (dept) => {
    const q = query(collection(db, "assessments"), where("department", "==", dept));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
    setAssessments(data);
  };

  const fetchAiAssessments = async (dept) => {
    setAiLoading(true);
    const q = query(collection(db, "aiAssessments"), where("department", "==", dept));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
    setAiAssessments(data);
    setAiLoading(false);
  };

  useEffect(() => {
    if (selectedDept) {
      fetchAssessments(selectedDept);
      fetchAiAssessments(selectedDept);
    }
  }, [selectedDept]);

  const handleAddAssessment = async () => {
    if (!title || !formLink || !lastDate) { alert("Fill all required fields"); return; }
    await addDoc(collection(db, "assessments"), {
      title, description, formLink, lastDate,
      department: selectedDept, createdAt: new Date(),
    });
    setTitle(""); setDescription(""); setFormLink(""); setLastDate("");
    setShowForm(false);
    fetchAssessments(selectedDept);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assessment?")) return;
    await deleteDoc(doc(db, "assessments", id));
    fetchAssessments(selectedDept);
  };

  const handleDeleteAI = async (id, aTitle) => {
    if (!window.confirm(`Delete AI assessment "${aTitle}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, "aiAssessments", id));
    fetchAiAssessments(selectedDept);
  };

  const isExpired = (d) => new Date() > new Date(d);

  const tabStyle = (active) => ({
    border: "none",
    borderBottom: active ? "3px solid #0d6efd" : "3px solid transparent",
    background: "transparent",
    color: active ? "#0d6efd" : "#64748b",
    fontWeight: active ? 700 : 400,
    padding: "10px 20px",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <AdminCard title="Assessments">

      {/* Department Cards */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {departments.map((dept) => (
          <div
            key={dept}
            onClick={() => { setSelectedDept(dept); setShowForm(false); }}
            className="p-3 text-center shadow-sm"
            style={{
              cursor: "pointer", minWidth: "120px", borderRadius: "10px",
              backgroundColor: selectedDept === dept ? "#0d6efd" : "#f8f9fa",
              color: selectedDept === dept ? "#fff" : "#000",
              fontWeight: "600", transition: "all 0.2s",
            }}
          >
            {dept}
            {selectedDept === dept && (
              <div style={{ fontSize: "0.72rem", opacity: 0.85, marginTop: 2 }}>
                {assessments.length + aiAssessments.length} total
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedDept && (
        <>
          {/* Tabs */}
          <div className="d-flex mb-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
            <button style={tabStyle(tab === "google")} onClick={() => setTab("google")}>
              📋 Google Form Tests
              <span className="badge ms-2" style={{ backgroundColor: tab === "google" ? "#0d6efd" : "#e2e8f0", color: tab === "google" ? "#fff" : "#64748b", fontSize: "0.72rem" }}>
                {assessments.length}
              </span>
            </button>
            <button style={tabStyle(tab === "ai")} onClick={() => setTab("ai")}>
              🤖 AI Assessments
              <span className="badge ms-2" style={{ backgroundColor: tab === "ai" ? "#0d6efd" : "#e2e8f0", color: tab === "ai" ? "#fff" : "#64748b", fontSize: "0.72rem" }}>
                {aiAssessments.length}
              </span>
            </button>
          </div>

          {/* ── GOOGLE FORM TAB ── */}
          {tab === "google" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">{selectedDept} — Google Form Assessments</h6>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "✕ Cancel" : "➕ Add Assessment"}
                </button>
              </div>

              {showForm && (
                <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input className="form-control" placeholder="Assessment Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <input type="date" className="form-control" value={lastDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setLastDate(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <input className="form-control" placeholder="Google Form Link *" value={formLink} onChange={(e) => setFormLink(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <input className="form-control" placeholder="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-success btn-sm" onClick={handleAddAssessment}>💾 Save Assessment</button>
                    </div>
                  </div>
                </div>
              )}

              {assessments.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p style={{ fontSize: "2rem" }}>📋</p>
                  <p>No Google Form assessments for {selectedDept} yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>S.No</th>
                        <th>Title</th>
                        <th>Last Date</th>
                        <th>Status</th>
                        <th>Link</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((a, index) => (
                        <tr key={a.id}>
                          <td>{index + 1}</td>
                          <td>{a.title}</td>
                          <td>{a.lastDate}</td>
                          <td>
                            {isExpired(a.lastDate)
                              ? <span className="badge bg-danger">Expired</span>
                              : <span className="badge bg-success">Active</span>}
                          </td>
                          <td><a href={a.formLink} target="_blank" rel="noreferrer">Open ↗</a></td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── AI ASSESSMENTS TAB ── */}
          {tab === "ai" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">{selectedDept} — AI Generated Assessments</h6>
                <a href="/admin/ai-generator" className="btn btn-sm btn-outline-primary">
                  🤖 Create New
                </a>
              </div>

              {aiLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm" />
                  <p className="text-muted mt-2 small">Loading...</p>
                </div>
              ) : aiAssessments.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p style={{ fontSize: "2rem" }}>🤖</p>
                  <p>No AI assessments for {selectedDept} yet.</p>
                  <a href="/admin/ai-generator" className="btn btn-primary btn-sm">Generate First AI Assessment →</a>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {aiAssessments.map((a, index) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-3"
                      style={{
                        border: "1px solid #e2e8f0",
                        backgroundColor: isExpired(a.lastDate) ? "#f8f9fa" : "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        opacity: isExpired(a.lastDate) ? 0.8 : 1,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="flex-grow-1">

                          {/* Badges */}
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <span className="badge" style={{ backgroundColor: "#ede9fe", color: "#7c3aed", fontSize: "0.72rem" }}>
                              🤖 AI Generated
                            </span>
                            {isExpired(a.lastDate)
                              ? <span className="badge bg-danger" style={{ fontSize: "0.72rem" }}>Expired</span>
                              : <span className="badge bg-success" style={{ fontSize: "0.72rem" }}>Active</span>}
                          </div>

                          {/* Title */}
                          <h6 className="fw-bold mb-2">{a.title}</h6>

                          {/* Meta info */}
                          <div className="d-flex gap-3 flex-wrap mb-2" style={{ fontSize: "0.83rem", color: "#64748b" }}>
                            <span>❓ {a.questionCount} Questions</span>
                            <span>⏱ {a.questionCount * 2} min</span>
                            <span>📅 Due: {a.lastDate}</span>
                            {a.topic && <span>📚 {a.topic}</span>}
                            {a.createdAt?.toDate && (
                              <span>🕐 {a.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            )}
                          </div>

                          {/* Collapsible question preview */}
                          {a.questions?.length > 0 && (
                            <details>
                              <summary className="text-primary" style={{ fontSize: "0.82rem", cursor: "pointer", userSelect: "none" }}>
                                👁 Preview questions ({a.questions.length})
                              </summary>
                              <div
                                className="mt-2 p-2 rounded-2"
                                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", maxHeight: "220px", overflowY: "auto" }}
                              >
                                {a.questions.slice(0, 5).map((q, qi) => (
                                  <div key={qi} className="mb-2 pb-2" style={{ borderBottom: qi < Math.min(4, a.questions.length - 1) ? "1px solid #e2e8f0" : "none", fontSize: "0.82rem" }}>
                                    <span className="fw-semibold">Q{qi + 1}.</span> {q.question}
                                    <div className="text-success mt-1" style={{ fontSize: "0.78rem" }}>
                                      ✓ {q.correctAnswer}. {q.options?.[q.correctAnswer]}
                                    </div>
                                  </div>
                                ))}
                                {a.questions.length > 5 && (
                                  <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
                                    + {a.questions.length - 5} more questions...
                                  </p>
                                )}
                              </div>
                            </details>
                          )}
                        </div>

                        {/* Delete button */}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteAI(a.id, a.title)}
                          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </AdminCard>
  );
}

export default Assessments;