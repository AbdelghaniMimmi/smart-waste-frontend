import DashboardLayout from "../components/DashboardLayout";
import DashboardOverview from "../components/DashboardOverview";

function AdminDashboard() {
  return (
    <DashboardLayout
      title="لوحة التحكم"
      subtitle="نظرة عامة على حالة الحاويات في الشبكة"
    >
      <DashboardOverview showSettings />
    </DashboardLayout>
  );
}

export default AdminDashboard;
