function Navbar({ role, name , color}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{backgroundColor : color}}>
      <h2>
        <span className="navbar-brand fs-4 fw-bold text">
        {role === "admin" ? "📘 Admin Panel" : "📖 Member Panel"}
      </span>
        </h2>
      <div className="ms-auto d-flex align-items-center text-white">
        <span className="me-3 fw-semibold">Hello {name || "Guest"}!</span>
        <i className="bi bi-person-circle fs-4"></i>
      </div>
    </nav>
  );
}

export default Navbar;