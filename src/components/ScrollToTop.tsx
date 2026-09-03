import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Al cambiar de RUTA, arranca desde arriba (p. ej. al volver del dashboard a la
// landing). Si la URL trae un ancla (#seccion), NO interfiere: deja que el
// navegador la maneje de forma nativa (respetando scroll-padding-top). Se
// desactiva la restauración nativa de scroll para que "volver" no recupere la
// posición anterior.
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (hash) return; // hay ancla → lo maneja el navegador (con el offset del header)
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
}
