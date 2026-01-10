import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const splitName = (fullName) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const Register = ({ onClose, switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Името и фамилията са задължителни";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Името трябва да е поне 2 символа";
    }

    if (!formData.email) {
      newErrors.email = "Имейл адресът е задължителен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Имейл адресът не е валиден";
    }

    if (!formData.password) {
      newErrors.password = "Паролата е задължителна";
    } else if (formData.password.length < 6) {
      newErrors.password = "Паролата трябва да е поне 6 символа";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Потвърждението на паролата е задължително";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Паролите не съвпадат";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const { firstName, lastName } = splitName(formData.name);

      await register({
        firstName,
        lastName,
        email: formData.email.trim(),
        password: formData.password,
      });

      onClose();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <h2>Регистрация</h2>
        <p>Създайте нов акаунт</p>
      </div>

      {errors.general && <div className="error-message">{errors.general}</div>}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="name">Име и фамилия *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className={errors.name ? "error" : ""}
            placeholder="Въведете име и фамилия"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Имейл адрес *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={errors.email ? "error" : ""}
            placeholder="Въведете вашия имейл"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Парола *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className={errors.password ? "error" : ""}
            placeholder="Поне 6 символа"
            minLength="6"
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Потвърдете паролата *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            className={errors.confirmPassword ? "error" : ""}
            placeholder="Потвърдете паролата"
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Регистрация..." : "Регистрирай се"}
        </button>
      </form>

      <div className="register-footer">
        <p>
          Вече имате акаунт?{" "}
          <button
            type="button"
            className="switch-btn"
            onClick={switchToLogin}
            disabled={loading}
          >
            Влезте тук
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
