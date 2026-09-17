import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import {
  LeafIcon,
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertIcon,
  GaugeIcon,
  RouteIcon,
  ShieldIcon,
} from "../components/Icons";
import { dashboardPath } from "../lib/format";

const FEATURES = [
  { icon: GaugeIcon, text: "مراقبة مستوى امتلاء الحاويات لحظيًا" },
  { icon: RouteIcon, text: "تحسين مسارات الجمع وتقليل المسافة المقطوعة" },
  { icon: ShieldIcon, text: "صلاحيات مخصّصة لكل دور في المنظومة" },
];

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(dashboardPath(user.role));
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.status === 401
          ? "اسم المستخدم أو كلمة السر غير صحيحة"
          : "تعذّر الاتصال بالخادم، حاول مرة أخرى"
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__form-wrap">
          <div className="auth__mobile-brand">
            <div className="sidebar__logo">
              <LeafIcon size={22} />
            </div>
          </div>

          <h1 className="auth__title">مرحبًا بعودتك</h1>
          <p className="auth__desc">
            سجّل الدخول للوصول إلى لوحة إدارة النفايات الذكية
          </p>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field__label" htmlFor="username">
                اسم المستخدم
              </label>
              <div className="input-group">
                <span className="input-group__icon">
                  <UserIcon size={18} />
                </span>
                <input
                  id="username"
                  className="input"
                  type="text"
                  autoComplete="username"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">
                كلمة المرور
              </label>
              <div className="input-group">
                <span className="input-group__icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-group__action"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert--danger" role="alert">
                <AlertIcon size={17} className="alert__icon" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      </div>

      <aside className="auth__aside">
        <div className="auth__aside-inner">
          <div className="auth__brand">
            <div className="sidebar__logo">
              <LeafIcon size={22} />
            </div>
            <div>
              <div className="sidebar__brand-name">النفايات الذكية</div>
              <div className="sidebar__brand-tag">Smart Waste Management</div>
            </div>
          </div>

          <h2 className="auth__headline">
            إدارة أذكى للنفايات،
            <br />
            مدينة أنظف
          </h2>
          <p className="auth__sub">
            منصّة متكاملة لمراقبة الحاويات وتخطيط مسارات الجمع بكفاءة، تعتمد على
            بيانات المستشعرات اللحظية.
          </p>

          <ul className="auth__features">
            {FEATURES.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <li className="auth__feature" key={feature.text}>
                  <span className="auth__feature-icon">
                    <FeatureIcon size={18} />
                  </span>
                  {feature.text}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default LoginPage;
