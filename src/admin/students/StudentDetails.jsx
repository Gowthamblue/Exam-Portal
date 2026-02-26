import { useParams } from "react-router-dom";
import AdminCard from "../../components/AdminCard";

const StudentDetails = () => {
  const { id } = useParams();

  // Hardcoded sample
  const student = {
    name: "Arun",
    email: "arun@gmail.com",
    dept: "CSE",
    phone: "9876543210",
    testsTaken: 4,
    avgScore: "78%"
  };

  return (
    <AdminCard title="Student Details">
      <p><b>Name:</b> {student.name}</p>
      <p><b>Email:</b> {student.email}</p>
      <p><b>Department:</b> {student.dept}</p>
      <p><b>Phone:</b> {student.phone}</p>
      <p><b>Tests Taken:</b> {student.testsTaken}</p>
      <p><b>Average Score:</b> {student.avgScore}</p>
    </AdminCard>
  );
};

export default StudentDetails;
