import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Download } from "lucide-react";

// Modal de lectura para publicaciones. Imagen superior banner ancho (2:1),
// accesible: focus trap, Escape para cerrar, bloqueo de scroll, retorno de foco.
const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80";

export default function PublicationModal({ publication, onClose }) {
  const open = !!publication;
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

  if (!open || !publication) return null;

  const hasImage = Boolean(publication.image);
  const img = publication.image || PLACEHOLDER_IMG;
  const paragraphs = (publication.content || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={publication.title}
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
        className="relative w-full sm:max-w-[640px] max-h-[92vh] overflow-y-auto bg-lucera-cream rounded-t-[32px] sm:rounded-[32px] outline-none"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        {/* Imagen superior — banner ancho 2:1 (solo si hay imagen) */}
        {hasImage ? (
          <div className="relative w-full aspect-[2/1] overflow-hidden rounded-t-[32px] sm:rounded-t-[32px]">
            <img
              src={img}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 grid place-items-center w-11 h-11 rounded-full bg-white/85 text-lucera-wine hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-10 grid place-items-center w-11 h-11 rounded-full bg-lucera-wine/10 text-lucera-wine hover:bg-lucera-wine/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8">
          <p className="text-eyebrow text-lucera-orange">{publication.category}</p>
          <h3 className="mt-3 font-display text-2xl text-lucera-wine leading-snug pr-6">
            {publication.title}
          </h3>
          <p className="mt-3 text-sm text-lucera-wine/55">
            {publication.author ?? "Autor pendiente"} ·{" "}
            {publication.publicationDate ?? "Fecha pendiente"}
          </p>

          {publication.summary && (
            <p className="mt-5 text-[16px] leading-relaxed font-medium text-lucera-wine">
              {publication.summary}
            </p>
          )}

          {paragraphs.length > 0 ? (
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-lucera-wine/80">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : !publication.externalUrl ? (
            <p className="mt-5 text-[15px] leading-relaxed text-lucera-wine/80">
              Contenido pendiente. El artículo definitivo se incorporará al recibirlo.
            </p>
          ) : null}

          {(publication.externalUrl || publication.downloadUrl) && (
            <p className="mt-4 text-xs text-lucera-wine/45">
              Los enlaces externos se identifican y abren de forma segura.
            </p>
          )}

          {(publication.externalUrl || publication.downloadUrl) && (
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              {publication.externalUrl && (
                <a
                  href={publication.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lucera-btn-pill inline-flex items-center gap-1.5 px-5 py-3 bg-lucera-wine text-lucera-cream text-sm"
                >
                  <ExternalLink className="w-4 h-4" /> Leer artículo completo
                </a>
              )}
              {publication.downloadUrl && (
                <a
                  href={publication.downloadUrl}
                  download
                  className="lucera-btn-pill inline-flex items-center gap-1.5 px-4 py-2.5 bg-lucera-wine/80 text-lucera-cream text-sm"
                >
                  <Download className="w-4 h-4" /> Descargar
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}