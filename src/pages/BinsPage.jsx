import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";
import FillLevel from "../components/FillLevel";
import Modal from "../components/Modal";
import {
  AlertIcon,
  CheckIcon,
  DeleteIcon,
  InboxIcon,
  PlusIcon,
  RefreshIcon,
  TrashBinIcon,
} from "../components/Icons";
import { fillTone, formatDateTime } from "../lib/format";

// وسط مدينة وهران، كنقطة انطلاق مألوفة عند إدخال الإحداثيات
const DEFAULT_LAT = "35.6971";
const DEFAULT_LNG = "-0.6308";

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

  const [addOpen, setAddOpen] = useState(false);
  const [newBinId, setNewBinId] = useState("");
  const [newLat, setNewLat] = useState(DEFAULT_LAT);
  const [newLng, setNewLng] = useState(DEFAULT_LNG);
  const [creating, setCreating] = useState(false);
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

  const closeAddModal = () => {
    setAddOpen(false);
    setFormError("");
    setNewBinId("");
    setNewLat(DEFAULT_LAT);
    setNewLng(DEFAULT_LNG);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);

    try {
      await api.post("/bins", {
        binId: newBinId.trim(),
        latitude: Number(newLat),
        longitude: Number(newLng),
      });
      setSuccessMessage(`تمت إضافة الحاوية "${newBinId.trim()}" بنجاح`);
      closeAddModal();
      load();
    } catch (err) {
      console.error("Error creating bin", err);
      setFormError(
        err.response?.data?.message || "حدث خطأ أثناء إضافة الحاوية"
      );
    } finally {
      setCreating(false);
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
            onClick={() => setAddOpen(true)}
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
                onClick={() => setAddOpen(true)}
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
                      <td className="table__id">{bin.binId}</td>
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
                      <td className="muted">{formatDateTime(bin.updatedAt)}</td>
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
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => setConfirmingId(bin._id)}
                            aria-label={`حذف ${bin.binId}`}
                          >
                            <DeleteIcon size={15} />
                            حذف
                          </button>
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

      {addOpen && (
        <Modal
          title="إضافة حاوية جديدة"
          description="تُسجَّل الحاوية بلا قراءات، وتُحدَّث تلقائيًا عند وصول بيانات المستشعر"
          onClose={closeAddModal}
        >
          <form className="card__body stack" onSubmit={handleCreate}>
            <div className="field">
              <label className="field__label" htmlFor="new-bin-id">
                رقم الحاوية
              </label>
              <div className="input-group">
                <span className="input-group__icon">
                  <TrashBinIcon size={18} />
                </span>
                <input
                  id="new-bin-id"
                  className="input"
                  type="text"
                  placeholder="مثال: bin10"
                  value={newBinId}
                  onChange={(e) => setNewBinId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="field">
                <label className="field__label" htmlFor="new-bin-lat">
                  خط العرض
                </label>
                <input
                  id="new-bin-lat"
                  className="input"
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="new-bin-lng">
                  خط الطول
                </label>
                <input
                  id="new-bin-lng"
                  className="input"
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  required
                />
              </div>
            </div>

            <span className="field__hint">
              الإحداثيات مطلوبة لعرض الحاوية على الخريطة وإدراجها في مسار الجمع.
            </span>

            {formError && (
              <div className="alert alert--danger" role="alert">
                <AlertIcon size={17} className="alert__icon" />
                <span>{formError}</span>
              </div>
            )}

            <div className="modal__footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={closeAddModal}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={creating}
              >
                {creating ? <span className="spinner" /> : <PlusIcon size={17} />}
                {creating ? "جارٍ الإضافة..." : "إضافة الحاوية"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default BinsPage;
