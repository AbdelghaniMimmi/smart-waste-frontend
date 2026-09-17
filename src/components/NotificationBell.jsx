import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import {
  BellIcon,
  BellOffIcon,
  AlertIcon,
  CheckIcon,
  TrashBinIcon,
} from "./Icons";
import { relativeTime } from "../lib/format";

const POLL_INTERVAL_MS = 30000;

const SEVERITY_ICONS = {
  critical: AlertIcon,
  warning: AlertIcon,
  info: CheckIcon,
};

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error loading notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const markRead = async (notification) => {
    if (notification.read) return;

    setNotifications((prev) =>
      prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await api.put(`/notifications/${notification._id}/read`);
    } catch (err) {
      console.error("Error marking notification as read", err);
      load();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.put("/notifications/read-all");
    } catch (err) {
      console.error("Error marking all notifications as read", err);
      load();
    }
  };

  const openBin = (notification) => {
    markRead(notification);
    setOpen(false);
    navigate("/bins");
  };

  return (
    <div className="notif" ref={panelRef}>
      <button
        className="notif__trigger"
        onClick={toggle}
        aria-label={
          unreadCount > 0
            ? `الإشعارات، ${unreadCount} غير مقروء`
            : "الإشعارات"
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className="notif__badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif__panel" role="dialog" aria-label="الإشعارات">
          <div className="notif__head">
            <div className="notif__title">
              الإشعارات
              {unreadCount > 0 && (
                <span className="badge badge--danger">{unreadCount} جديد</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button className="btn btn--ghost btn--sm" onClick={markAllRead}>
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          <div className="notif__list">
            {loading ? (
              <div className="loading-state" style={{ padding: 32 }}>
                <span className="spinner" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty" style={{ padding: "36px 20px" }}>
                <div className="empty__icon">
                  <BellOffIcon size={24} />
                </div>
                <div className="empty__title">لا توجد إشعارات</div>
                <div className="empty__desc">
                  ستظهر هنا التنبيهات عند امتلاء الحاويات.
                </div>
              </div>
            ) : (
              notifications.map((notification) => {
                const SeverityIcon =
                  SEVERITY_ICONS[notification.severity] || TrashBinIcon;
                return (
                  <button
                    key={notification._id}
                    className={`notif__item${
                      notification.read ? "" : " notif__item--unread"
                    }`}
                    onClick={() => openBin(notification)}
                  >
                    <span
                      className={`notif__icon notif__icon--${notification.severity}`}
                    >
                      <SeverityIcon size={16} />
                    </span>
                    <span className="notif__body">
                      <span className="notif__message">
                        {notification.message}
                      </span>
                      <span className="notif__time">
                        {relativeTime(notification.createdAt)}
                      </span>
                    </span>
                    {!notification.read && <span className="notif__dot" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
