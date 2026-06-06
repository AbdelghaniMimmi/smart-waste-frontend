import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/AdminDashboard";
import BinsPage from "./pages/BinsPage";
import RoutePage from "./pages/RoutePage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MapPage from "./pages/MapPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin", "agent"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bins"
          element={
            <ProtectedRoute roles={["admin", "agent"]}>
              <BinsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/route"
          element={
            <ProtectedRoute roles={["admin", "agent", "driver"]}>
              <RoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={["admin", "agent"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute roles={["admin", "agent", "driver"]}>
               <MapPage />
            </ProtectedRoute>
          }
        />

        {/* صفحة السائق البسيطة يمكن إضافتها لاحقًا */}
        {/* <Route ... /> */}

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}



export default App;