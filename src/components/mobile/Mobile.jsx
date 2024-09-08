export const Mobile = ({ visible = false }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa",
        color: "#333",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          padding: "40px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {/* Company logo */}
        <img
          src="favicon.png"
          alt="Company Logo"
          style={{
            width: "100px",
            marginBottom: "20px",
          }}
        />

        <h1
          style={{
            fontSize: "24px",
            marginBottom: "15px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Mobile Device Detected 🚫📱
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#666",
          }}
        >
          Sorry, this app is not supported on mobile devices. Please use a
          desktop or laptop for the best experience.
        </p>
      </div>
    </div>
  );
};
