import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function StudentDashboard() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStudent(docSnap.data());
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <h3>Welcome {student?.name}</h3>
      <p>Department: {student?.department}</p>

      <hr />

      <h5>Progress Summary</h5>
      <p>Total Assessments Attempted: 3</p>
      <p>Average Score: 72%</p>

      <hr />

      <h5>Recommendation</h5>
      <p className="text-primary">
        Based on your performance, try advanced assessments.
      </p>

      <h5>Performance Insight</h5>

{student && (
  <>
    <p>Total Assessments Attempted: 3</p>
    <p>Average Score: 72%</p>

    {72 < 50 && (
      <p className="text-danger">
        Your performance is low. Revise basic materials.
      </p>
    )}

    {72 >= 50 && 72 <= 80 && (
      <p className="text-warning">
        Good progress. Practice more mock tests.
      </p>
    )}

    {72 > 80 && (
      <p className="text-success">
        Excellent performance! Try advanced tests.
      </p>
    )}

    <hr />

    <p className="fw-semibold">
      Weak Area: Operating Systems
    </p>
  </>
)}

    </>
  );
}

export default StudentDashboard;
