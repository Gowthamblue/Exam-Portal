import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom";
import AdminCard from "../../components/AdminCard";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [results, setResults]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchAll = async () => {
      const snap = await getDoc(doc(db, "users", id));
      if (!snap.exists()) { setLoading(false); return; }
      const data = snap.data();
      setStudent(data);

      const q = query(collection(db, "results"), where("registerNumber", "==", data.registerNumber));
      const rSnap = await getDocs(q);
      const res = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.sort((a, b) => (b.submittedAt?.toDate?.() || 0) - (a.submittedAt?.toDate?.() || 0));
      setResults(res);
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" />
      <p className="text-muted mt-2">Loading student profile...</p>
    </div>
  );

  if (!student) return (
    <div className="text-center py-5 text-muted">
      <p style={{ fontSize: "2.5rem" }}>👤</p>
      <p>Student not found.</p>
      <button className="btn btn-outline-primary btn-sm" onClick={() => navigate("/admin/students")}>← Back to Students</button>
    </div>
  );

  // Stats
  const totalTests = results.length;
  const avgScore   = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / totalTests) : 0;
  const bestScore  = totalTests > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;
  const passCount  = results.filter((r) => r.percentage >= 50).length;

  const getInitials = (name = "") => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const getPerformanceLevel = (avg) => {
    if (totalTests === 0) return { label: "No Data",    color: "#94a3b8", bg: "#f1f5f9" };
    if (avg >= 80)        return { label: "Excellent",  color: "#16a34a", bg: "#dcfce7" };
    if (avg >= 50)        return { label: "Good",       color: "#ca8a04", bg: "#fef9c3" };
    return                       { label: "Needs Help", color: "#dc2626", bg: "#fee2e2" };
  };

  const perf = getPerformanceLevel(avgScore);

  const tabStyle = (active) => ({
    border: "none",
    borderBottom: active ? "3px solid #0d6efd" : "3px solid transparent",
    background: "transparent",
    color: active ? "#0d6efd" : "#64748b",
    fontWeight: active ? 700 : 400,
    padding: "10px 20px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const InfoRow = ({ label, value, icon = "" }) => (
    <div className="d-flex justify-content-between align-items-start py-2"
      style={{ borderBottom: "1px solid #f1f5f9" }}>
      <span className="text-muted" style={{ fontSize: "0.83rem", minWidth: 140 }}>{icon} {label}</span>
      <span className="fw-semibold text-end" style={{ fontSize: "0.88rem", color: value === "—" ? "#94a3b8" : "#1e293b" }}>
        {value || "—"}
      </span>
    </div>
  );

  return (
    <AdminCard title="">
      {/* Back button */}
      <button className="btn btn-sm btn-outline-secondary mb-4"
        onClick={() => navigate("/admin/students")} style={{ fontSize: "0.82rem" }}>
        ← Back to Students
      </button>

      {/* Hero banner */}
      <div className="rounded-3 p-4 mb-4 text-white"
        style={{ background: "linear-gradient(135deg, #0f2544, #1a56db)" }}>
        <div className="d-flex align-items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
            style={{ width: 72, height: 72, fontSize: "1.6rem", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)" }}>
            {getInitials(student.name)}
          </div>

          <div className="flex-grow-1">
            <h4 className="fw-bold mb-1">{student.name}</h4>
            <p className="mb-2 opacity-75" style={{ fontSize: "0.88rem" }}>{student.email}</p>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                🎓 {student.department}
              </span>
              {student.yearOfStudy && (
                <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                  📅 Year {student.yearOfStudy}
                </span>
              )}
              {student.batch && (
                <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                  🏷 {student.batch}
                </span>
              )}
              <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                🪪 {student.registerNumber}
              </span>
              <span className="badge" style={{ backgroundColor: perf.bg, color: perf.color, fontSize: "0.75rem" }}>
                {perf.label}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="d-flex gap-3 flex-wrap">
            {[
              { label: "Tests",   value: totalTests,                          color: "#93c5fd" },
              { label: "Avg",     value: totalTests ? `${avgScore}%` : "—",   color: "#c4b5fd" },
              { label: "Best",    value: totalTests ? `${bestScore}%` : "—",  color: "#86efac" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="fw-bold" style={{ fontSize: "1.3rem", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.72rem", opacity: 0.75 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        {student.about && (
          <div className="mt-3 p-2 rounded-2" style={{ backgroundColor: "rgba(255,255,255,0.1)", fontSize: "0.85rem" }}>
            "{student.about}"
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="d-flex mb-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
        <button style={tabStyle(activeTab === "profile")}  onClick={() => setActiveTab("profile")}>👤 Personal</button>
        <button style={tabStyle(activeTab === "academic")} onClick={() => setActiveTab("academic")}>🎓 Academic</button>
        <button style={tabStyle(activeTab === "results")}  onClick={() => setActiveTab("results")}>
          📊 Results
          {totalTests > 0 && (
            <span className="badge bg-primary ms-1" style={{ fontSize: "0.7rem" }}>{totalTests}</span>
          )}
        </button>
        <button style={tabStyle(activeTab === "contact")}  onClick={() => setActiveTab("contact")}>📍 Contact</button>
      </div>

      {/* ── PERSONAL TAB ── */}
      {activeTab === "profile" && (
        <div className="row g-4">
          <div className="col-md-6">
            <p className="fw-bold mb-2" style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Identity</p>
            <InfoRow label="Full Name"      value={student.name}           icon="👤" />
            <InfoRow label="Register No."   value={student.registerNumber} icon="🪪" />
            <InfoRow label="Date of Birth"  value={student.dob}            icon="🎂" />
            <InfoRow label="Gender"         value={student.gender}         icon="⚧" />
            <InfoRow label="Blood Group"    value={student.bloodGroup}     icon="🩸" />
          </div>
          <div className="col-md-6">
            <p className="fw-bold mb-2" style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Online Presence</p>
            <InfoRow label="Email"   value={student.email}   icon="📧" />
            <InfoRow label="Phone"   value={student.phone}   icon="📱" />
            <div className="py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <span className="text-muted" style={{ fontSize: "0.83rem" }}>🔗 LinkedIn</span>
              <div className="mt-1">
                {student.linkedin
                  ? <a href={student.linkedin} target="_blank" rel="noreferrer" className="text-primary" style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{student.linkedin}</a>
                  : <span className="text-muted" style={{ fontSize: "0.85rem" }}>—</span>}
              </div>
            </div>
            <div className="py-2">
              <span className="text-muted" style={{ fontSize: "0.83rem" }}>💻 GitHub</span>
              <div className="mt-1">
                {student.github
                  ? <a href={student.github} target="_blank" rel="noreferrer" className="text-primary" style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{student.github}</a>
                  : <span className="text-muted" style={{ fontSize: "0.85rem" }}>—</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACADEMIC TAB ── */}
      {activeTab === "academic" && (
        <div className="row g-4">
          <div className="col-md-6">
            <p className="fw-bold mb-2" style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Academic Info</p>
            <InfoRow label="Department"    value={student.department}    icon="🏛" />
            <InfoRow label="Year of Study" value={student.yearOfStudy ? `Year ${student.yearOfStudy}` : null} icon="📅" />
            <InfoRow label="Batch"         value={student.batch}         icon="🏷" />
            <InfoRow label="CGPA"          value={student.cgpa}          icon="📈" />
            <InfoRow label="Register No."  value={student.registerNumber} icon="🪪" />
          </div>
          <div className="col-md-6">
            <p className="fw-bold mb-2" style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Performance Summary</p>
            {[
              { label: "Tests Attempted", value: totalTests,                          color: "#0d6efd", bg: "#e7f0ff" },
              { label: "Average Score",   value: totalTests ? `${avgScore}%`  : "—",  color: "#7c3aed", bg: "#f3eeff" },
              { label: "Best Score",      value: totalTests ? `${bestScore}%` : "—",  color: "#16a34a", bg: "#dcfce7" },
              { label: "Tests Passed",    value: totalTests ? `${passCount}/${totalTests}` : "—", color: "#f59e0b", bg: "#fef9c3" },
            ].map((s) => (
              <div key={s.label} className="d-flex justify-content-between align-items-center p-2 rounded-2 mb-2"
                style={{ backgroundColor: s.bg, border: `1px solid ${s.color}22` }}>
                <span style={{ fontSize: "0.83rem", color: "#374151" }}>{s.label}</span>
                <span className="fw-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
            <div className="p-2 rounded-2 mt-2"
              style={{ backgroundColor: perf.bg, border: `1px solid ${perf.color}33` }}>
              <div className="d-flex justify-content-between">
                <span style={{ fontSize: "0.83rem" }}>Overall Level</span>
                <span className="fw-bold" style={{ color: perf.color }}>{perf.label}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS TAB ── */}
      {activeTab === "results" && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p style={{ fontSize: "2.5rem" }}>📋</p>
              <p>No assessment results yet for this student.</p>
            </div>
          ) : (
            <>
              <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                {results.length} assessment{results.length !== 1 ? "s" : ""} attempted
              </p>
              <div className="table-responsive">
                <table className="table table-bordered table-hover" style={{ fontSize: "0.88rem" }}>
                  <thead className="table-dark">
                    <tr>
                      <th>S.No</th>
                      <th>Assessment</th>
                      <th>Score</th>
                      <th>Total</th>
                      <th>Percentage</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>{r.assessmentTitle}</td>
                        <td>{r.score}</td>
                        <td>{r.totalMarks}</td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: r.percentage >= 80 ? "#dcfce7" : r.percentage >= 50 ? "#fef9c3" : "#fee2e2",
                            color: r.percentage >= 80 ? "#16a34a" : r.percentage >= 50 ? "#ca8a04" : "#dc2626",
                            fontSize: "0.82rem",
                          }}>
                            {r.percentage}%
                          </span>
                        </td>
                        <td>{r.submittedAt?.toDate?.().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {activeTab === "contact" && (
        <div className="row g-4">
          <div className="col-md-6">
            <p className="fw-bold mb-2" style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact Details</p>
            <InfoRow label="Phone"   value={student.phone}   icon="📱" />
            <InfoRow label="Email"   value={student.email}   icon="📧" />
          </div>
          <div className="col-md-6">
            <p className="fw-bold mb-2" style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Address</p>
            <InfoRow label="Address" value={student.address} icon="🏠" />
            <InfoRow label="City"    value={student.city}    icon="🏙" />
            <InfoRow label="State"   value={student.state}   icon="📍" />
            <InfoRow label="Pincode" value={student.pincode} icon="📮" />
          </div>
        </div>
      )}
    </AdminCard>
  );
}

export default StudentDetails;