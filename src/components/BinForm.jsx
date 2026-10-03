import { useState } from "react";
import FillLevel from "./FillLevel";
import LocationPicker from "./LocationPicker";
import { AlertIcon, CheckIcon, PlusIcon, TrashBinIcon, WeightIcon } from "./Icons";

// وسط مدينة وهران، كنقطة انطلاق مألوفة عند إدخال الإحداثيات
const DEFAULT_LAT = "35.6971";
const DEFAULT_LNG = "-0.6308";

function toField(value) {
  return value === null || value === undefined ? "" : String(value);
}

function toNumberOrUndefined(value) {
  return value === "" ? undefined : Number(value);
}

/**
 * نموذج إضافة/تعديل حاوية يدويًا: الرقم والموقع (من الخريطة أو رابط Google)
 * ومستوى الامتلاء والوزن، لتجربة النظام دون انتظار بيانات المستشعر.
 */
function BinForm({ bin, submitting, error, onSubmit, onCancel }) {
  const isEdit = Boolean(bin);

  const [binId, setBinId] = useState(bin?.binId ?? "");
  const [latitude, setLatitude] = useState(bin ? toField(bin.latitude) : DEFAULT_LAT);
  const [longitude, setLongitude] = useState(bin ? toField(bin.longitude) : DEFAULT_LNG);
  const [fillLevel, setFillLevel] = useState(toField(bin?.lastFillLevel));
  const [weight, setWeight] = useState(toField(bin?.lastWeight));

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    // عند التعديل لا نرسل القراءة إلا إذا تغيّرت، حتى لا يُسجَّل تغيير الموقع كقراءة جديدة
    const fillChanged = !isEdit || fillLevel !== toField(bin.lastFillLevel);
    const weightChanged = !isEdit || weight !== toField(bin.lastWeight);

    if (fillChanged) payload.fillLevel = toNumberOrUndefined(fillLevel);
    if (weightChanged) payload.weight = toNumberOrUndefined(weight);
    if (!isEdit) payload.binId = binId.trim();

    onSubmit(payload);
  };

  const previewLevel = fillLevel === "" ? null : Number(fillLevel);

  return (
    <form className="card__body stack" onSubmit={handleSubmit}>
      <div className="form-section-title">معلومات الحاوية</div>

      <div className="field">
        <label className="field__label" htmlFor="bin-form-id">
          رقم الحاوية
        </label>
        <div className="input-group">
          <span className="input-group__icon">
            <TrashBinIcon size={18} />
          </span>
          <input
            id="bin-form-id"
            className="input"
            type="text"
            placeholder="مثال: bin10"
            value={binId}
            onChange={(e) => setBinId(e.target.value)}
            disabled={isEdit}
            required
          />
        </div>
        {isEdit && (
          <span className="field__hint">
            لا يمكن تغيير رقم الحاوية لأنه يربطها بالمستشعر والإشعارات.
          </span>
        )}
      </div>

      <div className="form-section-title">القراءة اليدوية</div>

      <div className="field">
        <label className="field__label" htmlFor="bin-form-fill">
          مستوى الامتلاء (%)
        </label>
        <div className="row" style={{ gap: 12 }}>
          <input
            className="range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={fillLevel === "" ? 0 : fillLevel}
            onChange={(e) => setFillLevel(e.target.value)}
            aria-label="مستوى الامتلاء"
          />
          <input
            id="bin-form-fill"
            className="input"
            type="number"
            min={0}
            max={100}
            step="any"
            placeholder="—"
            style={{ width: 96 }}
            value={fillLevel}
            onChange={(e) => setFillLevel(e.target.value)}
          />
        </div>
        <FillLevel level={previewLevel} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="bin-form-weight">
          الوزن (كغ)
        </label>
        <div className="input-group">
          <span className="input-group__icon">
            <WeightIcon size={18} />
          </span>
          <input
            id="bin-form-weight"
            className="input"
            type="number"
            min={0}
            step="any"
            placeholder="مثال: 12.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      <span className="field__hint">
        {isEdit
          ? "القراءة الجديدة تُحفظ في سجل القراءات وتُطلق إشعارًا إن تجاوزت الحاوية الحد الحرج."
          : "اترك الحقلين فارغين إن كانت الحاوية مزوّدة بمستشعر وستصلها البيانات تلقائيًا."}
      </span>

      <div className="form-section-title">الموقع</div>

      <LocationPicker
        latitude={latitude}
        longitude={longitude}
        onChange={(lat, lng) => {
          setLatitude(lat);
          setLongitude(lng);
        }}
      />

      <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="field">
          <label className="field__label" htmlFor="bin-form-lat">
            خط العرض
          </label>
          <input
            id="bin-form-lat"
            className="input"
            type="number"
            step="any"
            min={-90}
            max={90}
            dir="ltr"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bin-form-lng">
            خط الطول
          </label>
          <input
            id="bin-form-lng"
            className="input"
            type="number"
            step="any"
            min={-180}
            max={180}
            dir="ltr"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div className="alert alert--danger" role="alert">
          <AlertIcon size={17} className="alert__icon" />
          <span>{error}</span>
        </div>
      )}

      <div className="modal__footer">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          إلغاء
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? (
            <span className="spinner" />
          ) : isEdit ? (
            <CheckIcon size={17} />
          ) : (
            <PlusIcon size={17} />
          )}
          {submitting
            ? "جارٍ الحفظ..."
            : isEdit
            ? "حفظ التعديلات"
            : "إضافة الحاوية"}
        </button>
      </div>
    </form>
  );
}

export default BinForm;
