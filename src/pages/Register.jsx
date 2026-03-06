import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [registerNumber, setRegisterNumber] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerNumber || !name || !department || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Check if register number already exists
      const checkQuery = query(
        collection(db, "users"),
        where("registerNumber", "==", registerNumber)
      );

      const snapshot = await getDocs(checkQuery);

      if (!snapshot.empty) {
        alert("Register Number already exists!");
        setLoading(false);
        return;
      }

      // 🔥 Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 🔥 Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        registerNumber: registerNumber,
        name: name,
        email: email,
        department: department,
        role: "student",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        createdAt: new Date()
      });

      alert("Registration successful!");
      navigate("/student");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card p-4 shadow"
        style={{ maxWidth: "400px", margin: "auto" }}
      >
        <h3 className="text-center mb-3">Register</h3>

        <form onSubmit={handleRegister}>

          <input
            className="form-control mb-3"
            placeholder="Register Number"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
            required
          />

          <input
            className="form-control mb-3"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="form-control mb-3"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="IT"></option>
          </select>

          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        {/* Login Navigation */}
        <div className="text-center mt-3">
          <small>
            Already have an account?{" "}
            <Link to="/" className="text-primary fw-semibold">
              Login here
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Register;