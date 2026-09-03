import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "@/data/luceraContent";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="lg:hidden grid place-items-center w-11 h-11 rounded-full text-lucera-wine hover:bg-lucera-wine/5 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[120] lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          <div className="absolute inset-0 bg-lucera-wine/55 backdrop-blur-md" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[86vw] max-w-sm bg-lucera-cream p-5 flex flex-col rounded-l-[30px] shadow-[-24px_0_70px_-30px_rgba(108,18,43,0.5)]">
            <div className="flex items-center justify-between mb-6">
              <Logo variant="dark" className="w-[128px]" />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="grid place-items-center w-11 h-11 rounded-full bg-white/70 text-lucera-wine"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 min-h-[52px] py-3.5 text-lucera-wine hover:bg-white/70 transition-colors"
                >
                  <span className="font-medium">{link.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </a>
              ))}
            </nav>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-auto lucera-btn-pill inline-flex items-center justify-center px-6 py-4 bg-lucera-wine text-lucera-cream"
            >
              Portal de mis hijos
            </Link>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}