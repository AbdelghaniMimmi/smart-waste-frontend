import { useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";

function UserCreatePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("driver");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/users", { username, password, role });
      setMessage("تم إنشاء المستخدم بنجاح");
      setUsername("");
      setPassword("");
      setRole("driver");
    } catch (err) {
      console.error("Error creating user", err);
      if (err.response?.status === 409) {
        setMessage("اسم المستخدم مستعمل من قبل");
      } else {
        setMessage("حدث خطأ أثناء إنشاء المستخدم");
      }
    }
  };

  return (
    <DashboardLayout>
      <h2>إنشاء مستخدم جديد</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 10 }}>
          <label>اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>الدور</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="driver">Driver</option>
          </select>
        </div>

        <button type="submit">إنشاء المستخدم</button>
      </form>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </DashboardLayout>
  );
}

export default UserCreatePage;