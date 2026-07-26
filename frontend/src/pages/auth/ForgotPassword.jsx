import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f6f7fb",
      }}
    >
      <div
        style={{
          width: "min(100%, 430px)",
          padding: "35px",
          borderRadius: "18px",
          background: "#ffffff",
          boxShadow: "0 18px 45px rgba(39, 43, 76, 0.1)",
        }}
      >
        <h1
          style={{
            margin: "0 0 10px",
            color: "#202438",
            fontSize: "27px",
          }}
        >
          Forgot Password
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "#858a9e",
            lineHeight: 1.6,
          }}
        >
          Please contact your administrator to reset your account password.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            height: "46px",
            border: "none",
            borderRadius: "10px",
            background: "#6557e8",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Login
        </button>
      </div>
    </main>
  );
}

export default ForgotPassword;
