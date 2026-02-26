import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      department,
      role: "student"
    });

    navigate("/student");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow" style={{ maxWidth: "400px", margin: "auto" }}>
        <h3 className="text-center mb-3">Register</h3>
        <form onSubmit={handleRegister}>
          <input
            className="form-control mb-3"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="form-control mb-3"
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>

          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-success w-100">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
