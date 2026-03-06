import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | az

  useEffect(() => {
    const fetchMaterials = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const dept = userSnap.data().department;
      setDepartment(dept);

      const q = query(collection(db, "materials"), where("department", "==", dept));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMaterials(data);
      setLoading(false);
    };
    fetchMaterials();
  }, []);

  // Detect material type from link
  const getMaterialType = (link = "") => {
    const l = link.toLowerCase();
    if (l.includes("youtube.com") || l.includes("youtu.be"))
      return { icon: "▶️", label: "Video", color: "#dc3545", bg: "#fff5f5" };
    if (l.endsWith(".pdf") || l.includes("pdf"))
      return { icon: "📄", label: "PDF", color: "#dc6c00", bg: "#fff8f0" };
    if (l.includes("drive.google.com"))
      return { icon: "📁", label: "Drive", color: "#1a73e8", bg: "#f0f6ff" };
    if (l.includes("docs.google.com"))
      return { icon: "📝", label: "Doc", color: "#0f9d58", bg: "#f0fdf4" };
    if (l.includes("github.com"))
      return { icon: "💻", label: "Code", color: "#1e293b", bg: "#f8fafc" };
    if (l.includes("slides") || l.includes("ppt"))
      return { icon: "📊", label: "Slides", color: "#f59e0b", bg: "#fffbeb" };
    return { icon: "🔗", label: "Link", color: "#6366f1", bg: "#f5f3ff" };
  };

  // Sort + filter
  const processed = [...materials]
    .filter((m) =>
      search.trim() === "" ||
      m.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
      }
      if (sortBy === "oldest") {
        return (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0);
      }
      if (sortBy === "az") {
        return (a.description || "").localeCompare(b.description || "");
      }
      return 0;
    });

  const formatDate = (ts) => {
    if (!ts?.toDate) return "-";
    const date = ts.toDate();
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="text-muted mt-2">Loading materials...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">📚 Study Materials</h4>
        <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
          {materials.length} material{materials.length !== 1 ? "s" : ""} for <strong>{department}</strong>
        </p>
      </div>

      {/* Search + Sort bar */}
      {materials.length > 0 && (
        <div className="d-flex gap-2 flex-wrap align-items-center mb-4">
          <input
            className="form-control form-control-sm"
            placeholder="🔍 Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "240px" }}
          />
          <select
            className="form-select form-select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ maxWidth: "160px" }}
          >
            <option value="newest">⬇ Newest First</option>
            <option value="oldest">⬆ Oldest First</option>
            <option value="az">🔤 A → Z</option>
          </select>
          {search && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSearch("")}
              style={{ fontSize: "0.78rem", borderRadius: "20px" }}
            >
              ✕ Clear
            </button>
          )}
          <span className="text-muted ms-auto" style={{ fontSize: "0.8rem" }}>
            {processed.length} of {materials.length} shown
          </span>
        </div>
      )}

      {/* Empty state */}
      {materials.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p style={{ fontSize: "3rem" }}>📭</p>
          <h6>No Materials Yet</h6>
          <p style={{ fontSize: "0.88rem" }}>
            Your admin hasn't uploaded any study materials for {department} yet.
            <br />Check back soon!
          </p>
        </div>
      )}

      {/* No search results */}
      {materials.length > 0 && processed.length === 0 && (
        <div className="text-center py-4 text-muted">
          <p style={{ fontSize: "2rem" }}>🔍</p>
          <p>No materials match "<strong>{search}</strong>"</p>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearch("")}>
            Clear search
          </button>
        </div>
      )}

      {/* Materials grid */}
      {processed.length > 0 && (
        <div className="row g-3">
          {processed.map((m, index) => {
            const type = getMaterialType(m.link);
            const isNew = m.createdAt?.toDate && (new Date() - m.createdAt.toDate()) < 86400000 * 3;

            return (
              <div className="col-md-6" key={m.id}>
                <div
                  className="h-100 rounded-3 p-3"
                  style={{
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="d-flex gap-3 align-items-start">
                    {/* Type icon */}
                    <div
                      className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                      style={{
                        width: 48, height: 48,
                        backgroundColor: type.bg,
                        fontSize: "1.4rem",
                        border: `1px solid ${type.color}22`,
                      }}
                    >
                      {type.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="badge"
                          style={{
                            backgroundColor: type.bg,
                            color: type.color,
                            fontSize: "0.68rem",
                            border: `1px solid ${type.color}33`,
                          }}
                        >
                          {type.label}
                        </span>
                        {isNew && (
                          <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "0.68rem" }}>
                            ✨ New
                          </span>
                        )}
                        <span className="badge bg-light text-secondary" style={{ fontSize: "0.68rem" }}>
                          #{index + 1}
                        </span>
                      </div>

                      <p
                        className="fw-semibold mb-1"
                        style={{
                          fontSize: "0.92rem",
                          lineHeight: "1.4",
                          color: "#1e293b",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {m.description}
                      </p>

                      <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                        <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                          🕐 {formatDate(m.createdAt)}
                        </span>
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm fw-semibold"
                          style={{
                            backgroundColor: type.color,
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "4px 14px",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                          }}
                        >
                          Open {type.label} ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentMaterials;