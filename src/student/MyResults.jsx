import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registerNumber, setRegisterNumber] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const regNum = userSnap.data().registerNumber;
      setRegisterNumber(regNum);

      const q = query(
        collection(db, "results"),
        where("registerNumber", "==", regNum)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      data.sort((a, b) => {
        const aTime = a.submittedAt?.toDate?.() || new Date(0);
        const bTime = b.submittedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });

      setResults(data);
      setLoading(false);
    };

    fetchResults();
  }, []);

  const getScoreBadgeColor = (pct) => {
    if (pct >= 80) return { bg: "#e6f9ef", color: "#198754", label: "Excellent" };
    if (pct >= 50) return { bg: "#fff8e1", color: "#c8960c", label: "Good" };
    return { bg: "#fde8e8", color: "#dc3545", label: "Needs Work" };
  };

  const totalAttempted = results.length;
  const avgPercentage =
    totalAttempted > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempted)
      : 0;
  const bestScore =
    totalAttempted > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading results...</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-1">My Results</h4>
      <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
        Register Number: <strong>{registerNumber}</strong>
      </p>

      {/* Summary Cards */}
      {totalAttempted > 0 && (
        <div className="row g-3 mb-4">
          {[
            { label: "Total Tests", value: totalAttempted, icon: "📝", color: "#0d6efd", bg: "#e7f0ff" },
            { label: "Average Score", value: `${avgPercentage}%`, icon: "📊", color: "#6f42c1", bg: "#f3eeff" },
            { label: "Best Score", value: `${bestScore}%`, icon: "🏆", color: "#198754", bg: "#e6f9ef" },
          ].map((stat) => (
            <div className="col-4" key={stat.label}>
              <div
                className="p-3 rounded-3 text-center"
                style={{ backgroundColor: stat.bg, border: `1px solid ${stat.color}22` }}
              >
                <div style={{ fontSize: "1.4rem" }}>{stat.icon}</div>
                <div className="fw-bold" style={{ fontSize: "1.3rem", color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-muted small">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <div
          className="text-center py-5 rounded-3"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <p style={{ fontSize: "2.5rem" }}>📋</p>
          <h6 className="text-muted">No Results Yet</h6>
          <p className="text-muted small">
            Your scores will appear here once the admin enters your assessment results.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {results.map((r, i) => {
            const badge = getScoreBadgeColor(r.percentage);
            return (
              <div
                key={r.id}
                className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                style={{
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div>
                  <div className="fw-semibold">{r.assessmentTitle}</div>
                  <div className="text-muted small mt-1">
                    Score: {r.score} / {r.totalMarks} &nbsp;|&nbsp;{" "}
                    {r.submittedAt?.toDate
                      ? r.submittedAt.toDate().toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
                <div className="text-end">
                  <div
                    className="fw-bold"
                    style={{ fontSize: "1.4rem", color: badge.color }}
                  >
                    {r.percentage}%
                  </div>
                  <span
                    className="badge"
                    style={{ backgroundColor: badge.bg, color: badge.color, fontSize: "0.75rem" }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyResults;