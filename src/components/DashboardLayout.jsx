import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutIcon,
  TrashBinIcon,
  RouteIcon,
  MapIcon,
  SettingsIcon,
  UsersIcon,
  LogoutIcon,
  MenuIcon,
  LeafIcon,
} from "./Icons";
import NotificationBell from "./NotificationBell";
import {
  roleLabel,
  roleBadgeClass,
  initials,
  dashboardPath,
} from "../lib/format";

function DashboardLayout({ title, subtitle, actions, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sections = [
    {
      label: "المراقبة",
      items: [
        {
          label: "لوحة التحكم",
          path: dashboardPath(role),
          icon: LayoutIcon,
          roles: ["admin", "agent", "driver"],
        },
        {
          label: "الحاويات",
          path: "/bins",
          icon: TrashBinIcon,
          roles: ["admin", "agent"],
        },
        {
          label: "مسار الجمع",
          path: "/route",
          icon: RouteIcon,
          roles: ["admin", "agent", "driver"],
        },
        {
          label: "خريطة الحاويات",
          path: "/map",
          icon: MapIcon,
          roles: ["admin", "agent", "driver"],
        },
      ],
    },
    {
      label: "الإدارة",
      items: [
        {
          label: "المستخدمون",
          path: "/users",
          icon: UsersIcon,
          roles: ["admin"],
        },
        {
          label: "إعدادات النظام",
          path: "/settings",
          icon: SettingsIcon,
          roles: ["admin", "agent"],
        },
      ],
    },
  ]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="shell">
      {menuOpen && (
        <div
          className="sidebar__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${menuOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <LeafIcon size={22} />
          </div>
          <div>
            <div className="sidebar__brand-name">النفايات الذكية</div>
            <div className="sidebar__brand-tag">Smart Waste</div>
          </div>
        </div>

        <div className="sidebar__user">
          <div className="avatar avatar--sm">{initials(user?.username)}</div>
          <div className="sidebar__user-meta">
            <div className="sidebar__user-name">{user?.username}</div>
            <span className={roleBadgeClass(role)}>{roleLabel(role)}</span>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="التنقل الرئيسي">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="sidebar__section-label">{section.label}</div>
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`nav-item${active ? " nav-item--active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <ItemIcon size={19} className="nav-item__icon" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            onClick={handleLogout}
            className="nav-item nav-item--logout"
          >
            <LogoutIcon size={19} className="nav-item__icon" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <button
            className="header__menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="فتح القائمة"
          >
            <MenuIcon size={20} />
          </button>

          <div>
            <div className="header__title">{title}</div>
            {subtitle && <div className="header__subtitle">{subtitle}</div>}
          </div>

          <div className="header__spacer" />

          {actions}
          <NotificationBell />
        </header>

        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
