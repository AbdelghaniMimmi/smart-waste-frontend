import { useEffect, useRef } from "react";

function Modal({ title, description, onClose, children }) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;

    // الحقل الأول أولى بالتركيز من زر الإغلاق الذي يسبقه في البنية
    const dialog = dialogRef.current;
    const target =
      dialog?.querySelector("input, select, textarea") ||
      dialog?.querySelector("button");
    target?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal__backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <div>
            <div className="modal__title" id="modal-title">
              {title}
            </div>
            {description && <div className="card__desc">{description}</div>}
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="إغلاق"
            type="button"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
