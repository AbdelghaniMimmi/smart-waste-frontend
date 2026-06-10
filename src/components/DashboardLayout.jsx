import { useNavigate } from "react-router-dom";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", direction: "rtl" }}>
      {/* الشريط الجانبي */}
      <aside
        style={{
          width: "220px",
          backgroundColor: "#1f2933",
          color: "#fff",
          padding: "20px 10px",
        }}
      >
        <h2 style={{ fontSize: "18px", marginBottom: 20 }}>Smart Waste</h2>
        <p style={{ fontSize: "14px" }}>المستخدم: {user?.username}</p>
        <p style={{ fontSize: "14px" }}>الدور: {role}</p>

        <nav style={{ marginTop: 20 }}>
          <button
            onClick={() =>
              role === "admin"
                ? navigate("/admin-dashboard")
                : role === "agent"
                ? navigate("/agent-dashboard")
                : navigate("/driver-dashboard")
            }
            style={navButtonStyle}
          >
            لوحة التحكم
          </button>

          {(role === "admin" || role === "agent") && (
            <>
              <button onClick={() => navigate("/bins")} style={navButtonStyle}>
                الحاويات
              </button>
              <button onClick={() => navigate("/settings")} style={navButtonStyle}>
                إعدادات النظام
              </button>
            </>
          )}

          <button onClick={() => navigate("/route")} style={navButtonStyle}>
            مسار الجمع
          </button>
          <button onClick={() => navigate("/map")} style={navButtonStyle}>
            خريطة الحاويات
          </button>
           {role === "admin" && (
                <>
                    <button onClick={() => navigate("/users")} style={navButtonStyle}>
                       إدارة المستخدمين
                    </button>
                    <button onClick={() => navigate("/users/new")} style={navButtonStyle}>
                       إنشاء مستخدم
                    </button>
                </>
            )}
        </nav>

        <button
          onClick={handleLogout}
          style={{ ...navButtonStyle, marginTop: 30, backgroundColor: "#e12d39" }}
        >
          تسجيل الخروج
        </button>
        
      </aside>

      {/* منطقة المحتوى */}
      <main style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
        {/* شريط علوي بسيط */}
        <header
          style={{
            backgroundColor: "#ffffff",
            padding: "10px 20px",
            borderBottom: "1px solid #d8d8d8",
          }}
        >
          <h1 style={{ fontSize: "20px", margin: 0 }}>لوحة إدارة النفايات الذكية</h1>
        </header>

        <div style={{ padding: 20 }}>{children}</div>
      </main>
    </div>
  );
}

const navButtonStyle = {
  display: "block",
  width: "100%",
  textAlign: "right",
  padding: "8px 10px",
  marginBottom: "8px",
  backgroundColor: "#323f4b",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default DashboardLayout;