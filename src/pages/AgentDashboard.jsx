import DashboardLayout from "../components/DashboardLayout";
import DashboardOverview from "../components/DashboardOverview";

function AgentDashboard() {
  return (
    <DashboardLayout
      title="لوحة التحكم"
      subtitle="متابعة الحاويات والتخطيط لعمليات الجمع"
    >
      <DashboardOverview showSettings />
    </DashboardLayout>
  );
}

export default AgentDashboard;
