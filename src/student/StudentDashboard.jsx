import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const studentData = userSnap.data();
      setStudent(studentData);

      const q = query(
        collection(db, "results"),
        where("registerNumber", "==", studentData.registerNumber)
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

    fetchData();
  }, []);

  const totalAttempted = results.length;
  const avgPercentage =
    totalAttempted > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempted)
      : 0;
  const bestScore =
    totalAttempted > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;
  const latestScore = totalAttempted > 0 ? results[0].percentage : null;

  const getRecommendation = (avg) => {
    if (totalAttempted === 0) return { text: "No assessments attempted yet. Start with your first test!", color: "text-muted", icon: "📋" };
    if (avg < 50) return { text: "Your performance needs improvement. Revisit study materials and attempt practice tests.", color: "text-danger", icon: "📖" };
    if (avg <= 80) return { text: "Good progress! Keep practicing mock tests to push your score higher.", color: "text-warning", icon: "💪" };
    return { text: "Excellent performance! You're on track. Try advanced assessments to challenge yourself.", color: "text-success", icon: "🏆" };
  };

  const rec = getRecommendation(avgPercentage);

  const getScoreBadgeColor = (pct) => {
    if (pct >= 80) return "#198754";
    if (pct >= 50) return "#ffc107";
    return "#dc3545";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="rounded-3 p-4 mb-4 text-white"
        style={{ background: "linear-gradient(135deg, #1e3a5f, #0d6efd)" }}
      >
        <h4 className="mb-1">👋 Welcome back, {student?.name}!</h4>
        <p className="mb-0 opacity-75">
          Department: <strong>{student?.department}</strong> &nbsp;|&nbsp; Reg No:{" "}
          <strong>{student?.registerNumber}</strong>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Tests Attempted", value: totalAttempted, icon: "📝", color: "#0d6efd", bg: "#e7f0ff" },
          { label: "Average Score", value: totalAttempted > 0 ? `${avgPercentage}%` : "—", icon: "📊", color: "#6f42c1", bg: "#f3eeff" },
          { label: "Best Score", value: totalAttempted > 0 ? `${bestScore}%` : "—", icon: "🏆", color: "#198754", bg: "#e6f9ef" },
          { label: "Latest Score", value: latestScore !== null ? `${latestScore}%` : "—", icon: "🕐", color: "#fd7e14", bg: "#fff4e6" },
        ].map((stat) => (
          <div className="col-6 col-md-3" key={stat.label}>
            <div
              className="p-3 rounded-3 h-100"
              style={{ backgroundColor: stat.bg, border: `1px solid ${stat.color}22` }}
            >
              <div style={{ fontSize: "1.6rem" }}>{stat.icon}</div>
              <div className="fw-bold mt-1" style={{ fontSize: "1.5rem", color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-muted small">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div
        className="rounded-3 p-3 mb-4"
        style={{ backgroundColor: "#f8f9fa", borderLeft: "5px solid #0d6efd" }}
      >
        <h6 className="mb-1">{rec.icon} Performance Insight</h6>
        <p className={`mb-0 ${rec.color}`}>{rec.text}</p>
      </div>

      {/* Recent Results */}
      <h6 className="fw-semibold mb-3">Recent Results</h6>
      {results.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p style={{ fontSize: "2rem" }}>📋</p>
          <p>No results yet. Attempt an assessment to see your performance here.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
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
                    <span
                      className="badge"
                      style={{ backgroundColor: getScoreBadgeColor(r.percentage), fontSize: "0.85rem" }}
                    >
                      {r.percentage}%
                    </span>
                  </td>
                  <td>
                    {r.submittedAt?.toDate
                      ? r.submittedAt.toDate().toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;