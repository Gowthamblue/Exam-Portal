import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

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

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAssessments(data);
    };

    fetchAssessments();
  }, []);

  const today = new Date();

  return (
    <>
      <h3>Assessments</h3>

      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>S.No</th>
            <th>Description</th>
            <th>Status</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((a, index) => {
            const start = new Date(a.startDate);
            const end = new Date(a.endDate);

            let status = "Expired";
            if (today < start) status = "Upcoming";
            if (today >= start && today <= end) status = "Active";

            return (
              <tr key={a.id}>
                <td>{index + 1}</td>
                <td>{a.description}</td>
                <td>{status}</td>
                <td>
                  {status === "Active" ? (
                    <a href={a.link} target="_blank" rel="noreferrer">
                      Take Test
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default StudentAssessments;
