import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

import "../../styles/auth.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 60000,
        }
      );

      const token =
        response.data?.token ||
        response.data?.data?.token;

      const user =
        response.data?.user ||
        response.data?.data?.user;

      if (!token || !user) {
        throw new Error(
          "Token or user information was not received."
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin/dashboard", {
          replace: true,
        });
        return;
      }

      if (user.role === "employee") {
        navigate("/employee/dashboard", {
          replace: true,
        });
        return;
      }

      if (user.role === "client") {
        navigate("/client/dashboard", {
          replace: true,
        });
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError("This account role is not supported.");
    } catch (requestError) {
      console.error(
        "Login error:",
        requestError.response?.data || requestError.message
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (requestError.code === "ECONNABORTED") {
        setError(
          "Server is taking too long to respond. Please try again."
        );
        return;
      }

      if (!requestError.response) {
        setError(
          "Unable to connect to the server. Please try again after a moment."
        );
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-mark">P</div>

          <h1>Employee Management System</h1>

          <p>
            Manage employees, attendance, leave requests and assigned tasks
            from one secure workspace.
          </p>
        </div>

        <p className="brand-footer">Prazeon AI Pvt. Ltd.</p>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-heading">
            <span className="login-label">WELCOME BACK</span>

            <h2>Employee Portal</h2>

            <p>Please enter your account details to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setError(
                      "Please contact your administrator to reset your password."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (currentValue) => !currentValue
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-support-text">
            Having trouble signing in? Contact your administrator.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;