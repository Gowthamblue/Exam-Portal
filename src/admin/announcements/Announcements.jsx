import { useEffect, useState } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../../firebase";

function Announcements() {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [announcements, setAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    const q = query(
      collection(db, "announcements"), 
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAddAnnouncement = async () => {
    if (!message.trim()) {
      alert("Please enter announcement message");
      return;
    }

    await addDoc(collection(db, "announcements"), {
      message: message,
      priority: priority,
      createdAt: new Date()
    });

    setMessage("");
    setPriority("normal");
    fetchAnnouncements();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "announcements", id));

    fetchAnnouncements();
  };

  return (
    <>
      <h3>Announcements</h3>

      <div className="mb-4">
        <textarea
          className="form-control mb-2"
          placeholder="Enter announcement..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <select
          className="form-control mb-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button className="btn btn-primary" onClick={handleAddAnnouncement}>
          Post Announcement
        </button>
      </div>

      <hr />

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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="mb-1 fw-semibold">{a.message}</p>
              <small className="text-muted">
                {a.createdAt?.toDate().toLocaleString()}
              </small>
            </div>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(a.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export default Announcements;