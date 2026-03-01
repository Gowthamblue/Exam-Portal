import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

function StudentAssessments() {
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const department = userSnap.data().department;

      const q = query(
        collection(db, "assessments"),
        where("department", "==", department)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAssessments(data);
    };

    fetchAssessments();
  }, []);

  return (
    <>
      <h3>Assessments</h3>

      {assessments.length === 0 ? (
        <p>No assessments available.</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Title</th>
                <th>Last Date</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, index) => {
                const today = new Date();
                const lastDate = new Date(a.lastDate);
                const isClosed = today > lastDate;

                return (
                  <tr key={a.id}>
                    <td>{index + 1}</td>
                    <td>{a.title}</td>
                    <td>{a.lastDate}</td>
                    <td>
                      {isClosed ? (
                        <span className="badge bg-danger">Closed</span>
                      ) : (
                        <a
                          href={a.formLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-success"
                        >
                          Start Test
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
  );
}

export default StudentAssessments;