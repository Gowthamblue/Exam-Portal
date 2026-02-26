const AdminCard = ({ title, children }) => {
  return (
    <div style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    }}>
      <h3 style={{ marginBottom: "15px" }}>{title}</h3>
      {children}
    </div>
  );
};

export default AdminCard;
