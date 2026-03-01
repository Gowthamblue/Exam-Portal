import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import AdminCard from "../../components/AdminCard";

function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const snap = await getDoc(doc(db, "users", id));

      if (snap.exists()) {
        setStudent(snap.data());
      }
    };

    fetchStudent();
  }, [id]);

  if (!student) return <p>Loading...</p>;

  return (
    <AdminCard title="Student Profile">

      <div className="row">

        <div className="col-md-4 mb-3">
          <strong>Name:</strong>
          <p>{student.name}</p>
        </div>

        <div className="col-md-4 mb-3">
          <strong>Email:</strong>
          <p>{student.email}</p>
        </div>

        <div className="col-md-4 mb-3">
          <strong>Department:</strong>
          <p>{student.department}</p>
        </div>

        <div className="col-md-4 mb-3">
          <strong>Phone:</strong>
          <p>{student.phone || "-"}</p>
        </div>

        <div className="col-md-8 mb-3">
          <strong>Address:</strong>
          <p>{student.address || "-"}</p>
        </div>

        <div className="col-md-4 mb-3">
          <strong>City:</strong>
          <p>{student.city || "-"}</p>
        </div>

        <div className="col-md-4 mb-3">
          <strong>State:</strong>
          <p>{student.state || "-"}</p>
        </div>

        <div className="col-md-4 mb-3">
          <strong>Pincode:</strong>
          <p>{student.pincode || "-"}</p>
        </div>

      </div>

    </AdminCard>
  );
}

export default StudentDetails;