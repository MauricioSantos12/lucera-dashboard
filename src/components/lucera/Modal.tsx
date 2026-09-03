import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Accessible dialog: focus trap, Escape to close, scroll lock, return focus.
export default function Modal({ open, onClose, title, children, footer }) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog) dialog.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Tab" && dialog) {
        const focusables = dialog.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (previouslyFocused.current) previouslyFocused.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-[#6c122b]/40 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="document"
        className="relative w-full sm:max-w-[520px] max-h-[92vh] overflow-y-auto bg-lucera-cream rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 outline-none"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-display text-xl text-lucera-wine pr-2">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-white/70 text-lucera-wine hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-[15px] leading-relaxed text-lucera-wine/80">{children}</div>
        {footer && (
          <div className="mt-6 flex flex-wrap gap-3 justify-end">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}