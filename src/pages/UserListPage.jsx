import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error loading users", err);
      setMessage("تعذّر تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذا المستخدم؟")) return;

    try {
      await api.delete(`/users/${id}`);
      setMessage("تم حذف المستخدم");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Error deleting user", err);
      setMessage("حدث خطأ أثناء حذف المستخدم");
    }
  };

  return (
    <DashboardLayout>
      <h2>إدارة المستخدمين</h2>

      {loading && <p>جارٍ تحميل المستخدمين...</p>}
      {message && <p>{message}</p>}

      {!loading && users.length === 0 && <p>لا يوجد مستخدمون.</p>}

      {!loading && users.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#fff",
          }}
        >
          <thead>
            <tr>
              <th style={thTdStyle}>اسم المستخدم</th>
              <th style={thTdStyle}>الدور</th>
              <th style={thTdStyle}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={thTdStyle}>{u.username}</td>
                <td style={thTdStyle}>{u.role}</td>
                <td style={thTdStyle}>
                  <button onClick={() => handleDelete(u._id)}>حذف</button>
                  {/* لاحقًا: زر تعديل الدور مثلاً */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

const thTdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "right",
};

export default UserListPage;