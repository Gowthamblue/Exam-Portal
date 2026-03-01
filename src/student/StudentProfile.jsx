import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function StudentProfile() {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data());
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      pincode: profile.pincode || ""
    });

    alert("Profile updated successfully");
    setEditMode(false);
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Student Profile</h4>
          {!editMode ? (
            <button
              className="btn btn-outline-primary"
              onClick={() => setEditMode(true)}
            >
              ✏️ Edit
            </button>
          ) : (
            <div>
              <button
                className="btn btn-success me-2"
                onClick={handleSave}
              >
                💾 Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>

        {/* BASIC INFO */}
        <h6 className="text-muted mb-2">Basic Information</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Name</label>
            <input
              className="form-control"
              value={profile.name || ""}
              disabled
            />
          </div>

          <div className="col-md-4">
            <label>Email</label>
            <input
              className="form-control"
              value={profile.email || ""}
              disabled
            />
          </div>

          <div className="col-md-4">
            <label>Department</label>
            <input
              className="form-control"
              value={profile.department || ""}
              disabled
            />
          </div>
        </div>

        {/* ADDRESS INFO */}
        <h6 className="text-muted mb-2">Address Details</h6>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Phone</label>
            <input
              name="phone"
              className="form-control"
              value={profile.phone || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div className="col-md-8 mb-3">
            <label>Address</label>
            <input
              name="address"
              className="form-control"
              value={profile.address || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label>City</label>
            <input
              name="city"
              className="form-control"
              value={profile.city || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label>State</label>
            <input
              name="state"
              className="form-control"
              value={profile.state || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label>Pincode</label>
            <input
              name="pincode"
              className="form-control"
              value={profile.pincode || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default StudentProfile;