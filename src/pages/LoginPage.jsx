import { useState } from "react";
import api from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // طلب تسجيل الدخول إلى الـ backend
      const res = await api.post("/auth/login", { username, password });
      const { token, user } = res.data;

      // تخزين التوكن ومعلومات المستخدم في localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // توجيه حسب الدور
      if (user.role === "driver") {
        navigate("/driver-dashboard");
      } else if (user.role === "agent") {
        navigate("/agent-dashboard");
      } else {
        // admin أو أي دور آخر
        navigate("/admin-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("اسم المستخدم أو كلمة السر غير صحيحة");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>تسجيل الدخول</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">دخول</button>
      </form>
    </div>
  );
}

export default LoginPage;