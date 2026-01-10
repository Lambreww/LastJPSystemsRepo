import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function mapFirebaseError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-email":
      return "Невалиден имейл адрес.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Грешен имейл или парола.";
    case "auth/too-many-requests":
      return "Твърде много опити. Опитайте отново по-късно.";
    case "auth/network-request-failed":
      return "Мрежова грешка. Проверете интернет връзката си.";
    default:
      return err?.message || "Възникна грешка при вход.";
  }
}

const Login = ({ onClose, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      onClose?.();
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Вход в системата</h2>
        <p>Влезте в своя акаунт</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Имейл</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={submitting}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Парола</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={submitting}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="login-btn" disabled={submitting}>
          {submitting ? "Вход..." : "Влез"}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Нямате акаунт?{" "}
          <button
            type="button"
            className="switch-btn"
            onClick={switchToRegister}
            disabled={submitting}
          >
            Регистрирайте се
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
