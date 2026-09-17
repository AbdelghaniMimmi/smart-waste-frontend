import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";
import {
  UserIcon,
  LockIcon,
  ShieldIcon,
  UsersIcon,
  PlusIcon,
  DeleteIcon,
  AlertIcon,
  CheckIcon,
  RefreshIcon,
} from "../components/Icons";
import { roleLabel, roleBadgeClass, initials } from "../lib/format";

const ROLES = [
  { value: "admin", label: "مدير النظام" },
  { value: "agent", label: "موظف" },
  { value: "driver", label: "سائق" },
];

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("driver");
  const [creating, setCreating] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error loading users", err);
      setListError("تعذّر تحميل قائمة المستخدمين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormFeedback(null);
    setCreating(true);

    try {
      await api.post("/users", { username, password, role });
      setFormFeedback({
        type: "ok",
        text: `تم إنشاء المستخدم "${username}" بنجاح`,
      });
      setUsername("");
      setPassword("");
      setRole("driver");
      loadUsers();
    } catch (err) {
      console.error("Error creating user", err);
      setFormFeedback({
        type: "danger",
        text:
          err.response?.status === 409
            ? "اسم المستخدم مستعمل من قبل"
            : "حدث خطأ أثناء إنشاء المستخدم",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setConfirmingId(null);
    } catch (err) {
      console.error("Error deleting user", err);
      setListError("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setDeletingId(null);
    }
  };

  const countByRole = (value) => users.filter((u) => u.role === value).length;

  return (
    <DashboardLayout
      title="إدارة المستخدمين"
      subtitle="إنشاء الحسابات وإدارة الصلاحيات"
      actions={
        <button
          className="btn btn--secondary btn--sm"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshIcon size={15} />
          تحديث
        </button>
      }
    >
      <div className="stat-grid">
        <div className="stat">
          <div className="stat__top">
            <div className="stat__icon stat__icon--brand">
              <UsersIcon size={20} />
            </div>
            <div className="stat__label">إجمالي المستخدمين</div>
          </div>
          <div className="stat__value">{users.length}</div>
        </div>
        <div className="stat">
          <div className="stat__top">
            <div className="stat__icon stat__icon--danger">
              <ShieldIcon size={20} />
            </div>
            <div className="stat__label">مدراء النظام</div>
          </div>
          <div className="stat__value">{countByRole("admin")}</div>
        </div>
        <div className="stat">
          <div className="stat__top">
            <div className="stat__icon stat__icon--info">
              <UserIcon size={20} />
            </div>
            <div className="stat__label">الموظفون</div>
          </div>
          <div className="stat__value">{countByRole("agent")}</div>
        </div>
        <div className="stat">
          <div className="stat__top">
            <div className="stat__icon stat__icon--warn">
              <UserIcon size={20} />
            </div>
            <div className="stat__label">السائقون</div>
          </div>
          <div className="stat__value">{countByRole("driver")}</div>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <div className="card__head">
            <div className="stat__icon stat__icon--brand">
              <PlusIcon size={20} />
            </div>
            <div>
              <div className="card__title">إنشاء مستخدم جديد</div>
              <div className="card__desc">يُضاف مباشرة إلى القائمة</div>
            </div>
          </div>

          <form className="card__body stack" onSubmit={handleCreate}>
            <div className="field">
              <label className="field__label" htmlFor="new-username">
                اسم المستخدم
              </label>
              <div className="input-group">
                <span className="input-group__icon">
                  <UserIcon size={18} />
                </span>
                <input
                  id="new-username"
                  className="input"
                  type="text"
                  autoComplete="off"
                  placeholder="مثال: driver_01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="new-password">
                كلمة المرور
              </label>
              <div className="input-group">
                <span className="input-group__icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="new-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="كلمة مرور قوية"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="new-role">
                الدور
              </label>
              <select
                id="new-role"
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span className="field__hint">
                يحدّد الصفحات التي يمكن للمستخدم الوصول إليها
              </span>
            </div>

            {formFeedback && (
              <div className={`alert alert--${formFeedback.type}`} role="status">
                {formFeedback.type === "ok" ? (
                  <CheckIcon size={17} className="alert__icon" />
                ) : (
                  <AlertIcon size={17} className="alert__icon" />
                )}
                <span>{formFeedback.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={creating}
            >
              {creating ? <span className="spinner" /> : <PlusIcon size={17} />}
              {creating ? "جارٍ الإنشاء..." : "إنشاء المستخدم"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">قائمة المستخدمين</div>
              <div className="card__desc">
                {users.length} حساب مسجّل في النظام
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner spinner--lg" />
              <span className="loading-state__text">
                جارٍ تحميل المستخدمين...
              </span>
            </div>
          ) : listError ? (
            <div className="card__body">
              <div className="alert alert--danger" role="alert">
                <AlertIcon size={17} className="alert__icon" />
                <span>{listError}</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="empty">
              <div className="empty__icon">
                <UsersIcon size={26} />
              </div>
              <div className="empty__title">لا يوجد مستخدمون</div>
              <div className="empty__desc">
                أنشئ أول حساب من النموذج المجاور.
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>الدور</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="row">
                          <div className="avatar avatar--sm">
                            {initials(user.username)}
                          </div>
                          <span className="table__id">{user.username}</span>
                        </div>
                      </td>
                      <td>
                        <span className={roleBadgeClass(user.role)}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        {confirmingId === user._id ? (
                          <div className="row" style={{ gap: 6 }}>
                            <button
                              className="btn btn--danger btn--sm"
                              onClick={() => handleDelete(user._id)}
                              disabled={deletingId === user._id}
                            >
                              {deletingId === user._id ? (
                                <span className="spinner" />
                              ) : null}
                              تأكيد الحذف
                            </button>
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => setConfirmingId(null)}
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => setConfirmingId(user._id)}
                            aria-label={`حذف ${user.username}`}
                          >
                            <DeleteIcon size={15} />
                            حذف
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UsersPage;
