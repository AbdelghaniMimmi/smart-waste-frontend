import { fillTone } from "../lib/format";

function FillLevel({ level }) {
  if (level === null || level === undefined) {
    return <span className="muted">لا توجد قراءة</span>;
  }

  const tone = fillTone(level);
  const clamped = Math.max(0, Math.min(100, level));

  return (
    <div className="fill">
      <div
        className="fill__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="مستوى الامتلاء"
      >
        <div className={`fill__bar fill__bar--${tone}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="fill__value">{level}%</span>
    </div>
  );
}

export default FillLevel;
