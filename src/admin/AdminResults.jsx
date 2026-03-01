import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import AdminCard from "../components/AdminCard";
function AdminResults() {
  const [registerNumber, setRegisterNumber] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [score, setScore] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const handleAddResult = async () => {
    if (!registerNumber || !assessmentTitle || !score || !totalMarks) {
      alert("Fill all fields");
      return;
    }

    const percentage = (score / totalMarks) * 100;

    await addDoc(collection(db, "results"), {
      registerNumber,
      assessmentTitle,
      score: Number(score),
      totalMarks: Number(totalMarks),
      percentage,
      submittedAt: new Date()
    });

    alert("Result Added");
    setRegisterNumber("");
    setAssessmentTitle("");
    setScore("");
    setTotalMarks("");
  };

  return (
    <AdminCard title="Add Student Result">
      <input
        className="form-control mb-2"
        placeholder="Register Number"
        value={registerNumber}
        onChange={(e) => setRegisterNumber(e.target.value)}
      />

      <input
        className="form-control mb-2"
        placeholder="Assessment Title"
        value={assessmentTitle}
        onChange={(e) => setAssessmentTitle(e.target.value)}
      />

      <input
        className="form-control mb-2"
        placeholder="Score"
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
      />

      <input
        className="form-control mb-2"
        placeholder="Total Marks"
        type="number"
        value={totalMarks}
        onChange={(e) => setTotalMarks(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleAddResult}>
        Save Result
      </button>
    </AdminCard>
  );
}

export default AdminResults;