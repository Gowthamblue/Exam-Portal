import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const PRIORITY_CONFIG = {
  high:   { color: "#dc3545", bg: "#fff5f5", badge: "#fecaca", label: "High",   icon: "🔴", borderColor: "#dc3545" },
  medium: { color: "#f59e0b", bg: "#fffbeb", badge: "#fde68a", label: "Medium", icon: "🟡", borderColor: "#f59e0b" },
  normal: { color: "#0d6efd", bg: "#eff6ff", badge: "#bfdbfe", label: "Normal", icon: "🔵", borderColor: "#0d6efd" },
};

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentDept, setStudentDept] = useState(null);
  const [filter, setFilter] = useState("all"); // all | high | medium | normal
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Get student department for filtering
      const user = auth.currentUser;
      if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setStudentDept(userSnap.data().department);
      }

      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAnnouncements(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Show only announcements meant for this student's dept or all depts
  const relevant = announcements.filter((a) => {
    const dept = a.targetDept || "all";
    return dept === "all" || dept === studentDept;
  });

  const filtered = relevant.filter((a) => {
    const matchFilter = filter === "all" || a.priority === filter;
    const matchSearch = search.trim() === "" || a.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    high:   relevant.filter((a) => a.priority === "high").length,
    medium: relevant.filter((a) => a.priority === "medium").length,
    normal: relevant.filter((a) => a.priority === "normal").length,
  };

  const highCount = counts.high;

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <h4 className="fw-bold mb-0">📢 Announcements</h4>
          {highCount > 0 && (
            <span className="badge bg-danger" style={{ fontSize: "0.75rem", animation: "pulse 2s infinite" }}>
              {highCount} urgent
            </span>
          )}
        </div>
        <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
          {relevant.length} announcement{relevant.length !== 1 ? "s" : ""} for you
          {studentDept && <span> &nbsp;·&nbsp; {studentDept} + General</span>}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Urgent banner — show if any high priority */}
      {highCount > 0 && filter === "all" && search === "" && (
        <div
          className="rounded-3 p-3 mb-4 d-flex align-items-center gap-3"
          style={{ backgroundColor: "#fff5f5", border: "1px solid #fecaca" }}
        >
          <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          <div>
            <p className="fw-bold mb-0 text-danger" style={{ fontSize: "0.9rem" }}>
              {highCount} urgent announcement{highCount > 1 ? "s" : ""} require your attention
            </p>
            <button
              className="btn btn-sm btn-link text-danger p-0"
              style={{ fontSize: "0.8rem" }}
              onClick={() => setFilter("high")}
            >
              View urgent only →
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {relevant.length > 0 && (
        <div className="d-flex gap-2 flex-wrap align-items-center mb-4">
          {/* Search */}
          <input
            className="form-control form-control-sm"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "180px" }}
          />

          {/* Priority filter pills */}
          {["all", "high", "medium", "normal"].map((p) => {
            const cfg = p === "all" ? null : PRIORITY_CONFIG[p];
            const isActive = filter === p;
            const count = p === "all" ? relevant.length : counts[p];
            if (p !== "all" && count === 0) return null;
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className="btn btn-sm"
                style={{
                  borderRadius: "20px",
                  backgroundColor: isActive ? (cfg?.color || "#1e293b") : "#f1f5f9",
                  color: isActive ? "#fff" : "#374151",
                  border: "none",
                  fontSize: "0.78rem",
                  fontWeight: isActive ? 600 : 400,
                  padding: "4px 14px",
                }}
              >
                {p === "all" ? `All (${count})` : `${cfg.icon} ${cfg.label} (${count})`}
              </button>
            );
          })}

          {(search || filter !== "all") && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => { setSearch(""); setFilter("all"); }}
              style={{ fontSize: "0.78rem", borderRadius: "20px" }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="text-muted mt-2">Loading announcements...</p>
        </div>
      )}

      {/* Empty states */}
      {!loading && relevant.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p style={{ fontSize: "3rem" }}>📭</p>
          <h6>No Announcements Yet</h6>
          <p style={{ fontSize: "0.88rem" }}>Check back later. Your admin will post updates here.</p>
        </div>
      )}

      {!loading && relevant.length > 0 && filtered.length === 0 && (
        <div className="text-center py-4 text-muted">
          <p style={{ fontSize: "2rem" }}>🔍</p>
          <p>No announcements match your search.</p>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSearch(""); setFilter("all"); }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Announcements list */}
      {!loading && filtered.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {filtered.map((a, index) => {
            const cfg = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.normal;
            const isNew = a.createdAt?.toDate && (new Date() - a.createdAt.toDate()) < 86400000; // < 24h

            return (
              <div
                key={a.id}
                className="rounded-3 p-3"
                style={{
                  borderLeft: `5px solid ${cfg.borderColor}`,
                  backgroundColor: cfg.bg,
                  border: `1px solid ${cfg.borderColor}22`,
                  borderLeftWidth: "5px",
                  boxShadow: a.priority === "high" ? "0 2px 8px rgba(220,53,69,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "transform 0.15s",
                }}
              >
                {/* Top row: badges + time */}
                <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span
                      className="badge"
                      style={{ backgroundColor: cfg.badge, color: cfg.color, fontSize: "0.72rem" }}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                    {a.targetDept && a.targetDept !== "all" ? (
                      <span className="badge bg-primary" style={{ fontSize: "0.72rem" }}>{a.targetDept}</span>
                    ) : (
                      <span className="badge bg-secondary" style={{ fontSize: "0.72rem", opacity: 0.7 }}>General</span>
                    )}
                    {isNew && (
                      <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "0.68rem" }}>
                        ✨ New
                      </span>
                    )}
                  </div>
                  <span className="text-muted" style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                    🕐 {formatDate(a.createdAt)}
                  </span>
                </div>

                {/* Message */}
                <p
                  className="mb-0 fw-semibold"
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: a.priority === "high" ? "#991b1b" : "#1e293b",
                  }}
                >
                  {a.message}
                </p>

                {/* Full date tooltip on hover */}
                {a.createdAt?.toDate && (
                  <p className="mb-0 mt-1 text-muted" style={{ fontSize: "0.75rem" }}>
                    {a.createdAt.toDate().toLocaleString("en-IN", {
                      weekday: "short", day: "numeric", month: "short",
                      year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-muted text-center mt-4" style={{ fontSize: "0.8rem" }}>
          Showing {filtered.length} of {relevant.length} announcements
        </p>
      )}
    </div>
  );
}

export default StudentAnnouncements;