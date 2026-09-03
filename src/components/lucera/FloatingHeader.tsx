import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

const desktopNav = [
{ label: "Propósito", href: "#proposito" },
{ label: "Cómo funciona", href: "#como-funciona" },
{ label: "Consejo Asesor", href: "#consejo-asesor" },
{ label: "Fundadores", href: "#founders" },
{ label: "Suscripción", href: "#suscripcion" }];


export default function FloatingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = desktopNav.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-sticky" : ""}`}>
      <div className="site-header__inner">
        <a href="#inicio" className="site-header__logo">
          <Logo variant="dark" />
        </a>

        <nav className="site-header__nav" aria-label="Navegación principal">
          {desktopNav.map((link) =>
          <a
            key={link.href}
            href={link.href}
            aria-current={active === link.href.replace("#", "") ? "page" : undefined}
            className={`site-header__link ${active === link.href.replace("#", "") ? "is-active" : ""} inline-flex`}>
            {link.label}
            </a>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
          <Link to="/dashboard" className="site-header__cta hidden sm:inline-flex">
            Portal de mis hijos
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>);

}