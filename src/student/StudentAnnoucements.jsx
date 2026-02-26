import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const q = query(
        collection(db, "announcements"),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAnnouncements(data);
    };

    fetchAnnouncements();
  }, []);

  const getPriorityColor = (priority) => {
    if (priority === "high") return "#dc3545";
    if (priority === "medium") return "#ffc107";
    return "#0d6efd";
  };

  return (
    <>
      <h3>Announcements</h3>

      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((a) => (
          <div
            key={a.id}
            className="p-3 mb-3 rounded shadow-sm"
            style={{
              borderLeft: `6px solid ${getPriorityColor(a.priority)}`
            }}
          >
            <p className="mb-1 fw-semibold">{a.message}</p>
            <small className="text-muted">{a.date}</small>
          </div>
        ))
      )}
    </>
  );
}

export default StudentAnnouncements;
