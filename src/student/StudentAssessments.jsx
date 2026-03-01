import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function StudentAssessments() {
  const [aiAssessments, setAiAssessments] = useState([]);
  const [formAssessments, setFormAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ai"); // "ai" | "form"
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const department = userSnap.data().department;

      // Fetch AI assessments
      const aiQ = query(collection(db, "aiAssessments"), where("department", "==", department));
      const aiSnap = await getDocs(aiQ);
      const aiData = aiSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      aiData.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      setAiAssessments(aiData);

      // Fetch Google Form assessments
      const formQ = query(collection(db, "assessments"), where("department", "==", department));
      const formSnap = await getDocs(formQ);
      const formData = formSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFormAssessments(formData);

      setLoading(false);
    };

    fetch();
  }, []);

  const isExpired = (lastDate) => new Date() > new Date(lastDate);

  const tabStyle = (active) => ({
    border: "none",
    borderBottom: active ? "3px solid #1a56db" : "3px solid transparent",
    background: "transparent",
    color: active ? "#1a56db" : "#64748b",
    fontWeight: active ? 700 : 400,
    padding: "10px 20px",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-1 fw-bold">Assessments</h4>
      <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
        Attempt in-app AI tests or open external Google Form assessments.
      </p>

      {/* Tab bar */}
      <div
        className="d-flex mb-4"
        style={{ borderBottom: "1px solid #e2e8f0" }}
      >
        <button style={tabStyle(tab === "ai")} onClick={() => setTab("ai")}>
          🤖 AI Assessments
          <span
            className="badge ms-2"
            style={{ backgroundColor: tab === "ai" ? "#1a56db" : "#e2e8f0", color: tab === "ai" ? "#fff" : "#64748b", fontSize: "0.75rem" }}
          >
            {aiAssessments.length}
          </span>
        </button>
        <button style={tabStyle(tab === "form")} onClick={() => setTab("form")}>
          📋 Google Form Tests
          <span
            className="badge ms-2"
            style={{ backgroundColor: tab === "form" ? "#1a56db" : "#e2e8f0", color: tab === "form" ? "#fff" : "#64748b", fontSize: "0.75rem" }}
          >
            {formAssessments.length}
          </span>
        </button>
      </div>

      {/* AI Assessments Tab */}
      {tab === "ai" && (
        <>
          {aiAssessments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p style={{ fontSize: "2.5rem" }}>🤖</p>
              <p>No AI assessments available for your department yet.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {aiAssessments.map((a) => {
                const expired = isExpired(a.lastDate);
                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-3 d-flex justify-content-between align-items-center"
                    style={{
                      border: "1px solid #e2e8f0",
                      backgroundColor: expired ? "#f8f9fa" : "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      opacity: expired ? 0.7 : 1,
                    }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className="badge"
                          style={{ backgroundColor: "#ede9fe", color: "#7c3aed", fontSize: "0.72rem" }}
                        >
                          🤖 AI Generated
                        </span>
                        {expired && (
                          <span className="badge bg-danger" style={{ fontSize: "0.72rem" }}>
                            Expired
                          </span>
                        )}
                      </div>
                      <h6 className="fw-bold mb-1">{a.title}</h6>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        {a.questionCount} Questions &nbsp;·&nbsp; {a.questionCount * 2} min &nbsp;·&nbsp; Due: {a.lastDate}
                      </div>
                    </div>
                    {expired ? (
                      <span className="badge bg-secondary px-3 py-2">Closed</span>
                    ) : (
                      <button
                        className="btn btn-sm fw-bold px-4"
                        style={{
                          background: "linear-gradient(135deg, #1a56db, #7c3aed)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        onClick={() => navigate(`/student/attempt/${a.id}`)}
                      >
                        Start Test →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Google Form Tab */}
      {tab === "form" && (
        <>
          {formAssessments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p style={{ fontSize: "2.5rem" }}>📋</p>
              <p>No Google Form assessments available yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>S.No</th>
                    <th>Title</th>
                    <th>Last Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formAssessments.map((a, i) => {
                    const expired = isExpired(a.lastDate);
                    return (
                      <tr key={a.id}>
                        <td>{i + 1}</td>
                        <td>{a.title}</td>
                        <td>{a.lastDate}</td>
                        <td>
                          {expired ? (
                            <span className="badge bg-danger">Closed</span>
                          ) : (
                            <a href={a.formLink} target="_blank" rel="noreferrer" className="btn btn-sm btn-success">
                              Open Form
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentAssessments;