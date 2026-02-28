import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(data);
    };

    fetchAnnouncements();
  }, []);

  return (
    <>
      <h3>Announcements</h3>

      {announcements.map((a) => (
        <div
          key={a.id}
          className="p-3 mb-3 rounded shadow-sm"
          style={{
            borderLeft: `6px solid ${
              a.priority === "high"
                ? "#dc3545"
                : a.priority === "medium"
                ? "#ffc107"
                : "#0d6efd"
            }`
          }}
        >
          <p className="mb-1 fw-semibold">{a.message}</p>
          <small className="text-muted">
            {a.createdAt?.toDate().toLocaleString()}
          </small>
        </div>
      ))}
    </>
  );
}

export default StudentAnnouncements;