import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";
import BinForm from "../components/BinForm";
import FillLevel from "../components/FillLevel";
import Modal from "../components/Modal";
import {
  AlertIcon,
  CheckIcon,
  DeleteIcon,
  EditIcon,
  InboxIcon,
  PlusIcon,
  RefreshIcon,
} from "../components/Icons";
import { fillTone, formatDateTime } from "../lib/format";

const STATUS_FILTERS = [
  { key: "all", label: "الكل" },
  { key: "danger", label: "حرجة" },
  { key: "warn", label: "متوسطة" },
  { key: "ok", label: "منخفضة" },
];

const STATUS_LABELS = {
  danger: "حرجة",
  warn: "متوسطة",
  ok: "منخفضة",
  neutral: "بلا قراءة",
};

function BinsPage() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // null: النافذة مغلقة، "new": إضافة، وإلا فهي الحاوية الجاري تعديلها
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bins/status");
      setBins(res.data || []);
    } catch (err) {
      console.error("Error loading bins", err);
      setError("تعذّر تحميل قائمة الحاويات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isEditing = formTarget !== null && formTarget !== "new";

  const openAddModal = () => {
    setFormError("");
    setFormTarget("new");
  };

  const openEditModal = (bin) => {
    setFormError("");
    setFormTarget(bin);
  };

  const closeFormModal = () => {
    setFormTarget(null);
    setFormError("");
  };

  const handleSave = async (payload) => {
    setFormError("");
    setSaving(true);

    try {
      if (isEditing) {
        await api.patch(`/bins/${formTarget._id}`, payload);
        setSuccessMessage(`تم تحديث الحاوية "${formTarget.binId}" بنجاح`);
      } else {
        await api.post("/bins", payload);
        setSuccessMessage(`تمت إضافة الحاوية "${payload.binId}" بنجاح`);
      }
      closeFormModal();
      load();
    } catch (err) {
      console.error("Error saving bin", err);
      setFormError(
        err.response?.data?.message || "حدث خطأ أثناء حفظ الحاوية"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bin) => {
    setDeleteError("");
    setDeletingId(bin._id);
    try {
      await api.delete(`/bins/${bin._id}`);
      setBins((prev) => prev.filter((b) => b._id !== bin._id));
      setConfirmingId(null);
      setSuccessMessage(`تم حذف الحاوية "${bin.binId}" بنجاح`);
    } catch (err) {
      console.error("Error deleting bin", err);
      setDeleteError(
        err.response?.data?.message || "حدث خطأ أثناء حذف الحاوية"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bins.filter((bin) => {
      const matchesTerm =
        !term || String(bin.binId).toLowerCase().includes(term);
      const matchesStatus =
        status === "all" || fillTone(bin.lastFillLevel) === status;
      return matchesTerm && matchesStatus;
    });
  }, [bins, search, status]);

  return (
    <DashboardLayout
      title="الحاويات"
      subtitle={`${bins.length} حاوية مسجّلة في النظام`}
      actions={
        <>
          <button
            className="btn btn--secondary btn--sm"
            onClick={load}
            disabled={loading}
          >
            <RefreshIcon size={15} />
            تحديث
          </button>
          <button
            className="btn btn--primary btn--sm"
            onClick={openAddModal}
          >
            <PlusIcon size={15} />
            إضافة حاوية
          </button>
        </>
      }
    >
      {successMessage && (
        <div
          className="alert alert--ok"
          role="status"
          style={{ marginBottom: 16 }}
        >
          <CheckIcon size={17} className="alert__icon" />
          <span>{successMessage}</span>
        </div>
      )}

      {deleteError && (
        <div
          className="alert alert--danger"
          role="alert"
          style={{ marginBottom: 16 }}
        >
          <AlertIcon size={17} className="alert__icon" />
          <span>{deleteError}</span>
        </div>
      )}

      <div className="card">
        <div className="card__head">
          <div className="toolbar" style={{ flex: 1 }}>
            <div className="field" style={{ flex: 1, minWidth: 200 }}>
              <label className="field__label" htmlFor="bin-search">
                بحث
              </label>
              <input
                id="bin-search"
                className="input"
                type="search"
                placeholder="ابحث برقم الحاوية..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field">
              <span className="field__label">الحالة</span>
              <div className="segmented" role="group" aria-label="تصفية الحالة">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    className={`segmented__btn${
                      status === filter.key ? " segmented__btn--active" : ""
                    }`}
                    onClick={() => setStatus(filter.key)}
                    aria-pressed={status === filter.key}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner spinner--lg" />
            <span className="loading-state__text">جارٍ تحميل الحاويات...</span>
          </div>
        ) : error ? (
          <div className="card__body">
            <div className="alert alert--danger" role="alert">
              <AlertIcon size={17} className="alert__icon" />
              <span>{error}</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty__icon">
              <InboxIcon size={26} />
            </div>
            <div className="empty__title">لا توجد حاويات مطابقة</div>
            <div className="empty__desc">
              {bins.length === 0
                ? "لم يتم تسجيل أي حاوية في النظام بعد."
                : "جرّب تعديل كلمة البحث أو تصفية الحالة."}
            </div>
            {bins.length === 0 && (
              <button
                className="btn btn--primary"
                style={{ marginTop: 14 }}
                onClick={openAddModal}
              >
                <PlusIcon size={16} />
                إضافة أول حاوية
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الحاوية</th>
                  <th>مستوى الامتلاء</th>
                  <th>الحالة</th>
                  <th>الوزن (كغ)</th>
                  <th>الإحداثيات</th>
                  <th>آخر تحديث</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bin) => {
                  const tone = fillTone(bin.lastFillLevel);
                  return (
                    <tr key={bin._id}>
                      <td className="table__id">
                        {bin.binId}
                        {bin.source === "manual" && (
                          <span
                            className="badge badge--info"
                            style={{ marginInlineStart: 8 }}
                            title="آخر قراءة أُدخلت يدويًا"
                          >
                            يدوي
                          </span>
                        )}
                      </td>
                      <td style={{ minWidth: 190 }}>
                        <FillLevel level={bin.lastFillLevel} />
                      </td>
                      <td>
                        <span className={`badge badge--${tone}`}>
                          <span className="badge__dot" />
                          {STATUS_LABELS[tone]}
                        </span>
                      </td>
                      <td className="table__mono">{bin.lastWeight ?? "—"}</td>
                      <td className="table__mono muted">
                        {bin.latitude != null && bin.longitude != null
                          ? `${bin.latitude.toFixed(4)}، ${bin.longitude.toFixed(4)}`
                          : "—"}
                      </td>
                      <td className="muted">{formatDateTime(bin.lastUpdate)}</td>
                      <td>
                        {confirmingId === bin._id ? (
                          <div className="row" style={{ gap: 6 }}>
                            <button
                              className="btn btn--danger btn--sm"
                              onClick={() => handleDelete(bin)}
                              disabled={deletingId === bin._id}
                            >
                              {deletingId === bin._id ? (
                                <span className="spinner" />
                              ) : null}
                              تأكيد الحذف
                            </button>
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => setConfirmingId(null)}
                              disabled={deletingId === bin._id}
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <div className="row" style={{ gap: 6 }}>
                            <button
                              className="btn btn--secondary btn--sm"
                              onClick={() => openEditModal(bin)}
                              aria-label={`تعديل ${bin.binId}`}
                            >
                              <EditIcon size={15} />
                              تعديل
                            </button>
                            <button
                              className="btn btn--danger btn--sm"
                              onClick={() => setConfirmingId(bin._id)}
                              aria-label={`حذف ${bin.binId}`}
                            >
                              <DeleteIcon size={15} />
                              حذف
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formTarget && (
        <Modal
          wide
          title={isEditing ? `تعديل الحاوية ${formTarget.binId}` : "إضافة حاوية جديدة"}
          description="أدخل البيانات يدويًا، وحدّد الموقع من الخريطة أو من رابط خرائط Google"
          onClose={closeFormModal}
        >
          <BinForm
            key={isEditing ? formTarget._id : "new"}
            bin={isEditing ? formTarget : null}
            submitting={saving}
            error={formError}
            onSubmit={handleSave}
            onCancel={closeFormModal}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default BinsPage;
