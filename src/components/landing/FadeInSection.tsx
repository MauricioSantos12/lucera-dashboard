import { ReactNode, useEffect, useRef, useState } from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";

const MotionDiv = motion.div;

// Señal compartida de "revelar todo". Los crawlers (Googlebot, scrapers) NO
// hacen scroll, así que las secciones con fade-on-scroll se quedarían en
// opacity:0 y el screenshot de Search Console sale incompleto. Si NO hubo scroll
// en `REVEAL_DELAY`ms, forzamos que todo sea visible. Si el usuario SÍ scrollea,
// no se fuerza nada y las animaciones on-scroll siguen intactas (UX sin cambios).
const REVEAL_DELAY = 1500;
let forcedReveal = false;
const revealListeners = new Set<() => void>();

if (typeof window !== "undefined") {
  let scrolled = false;
  const onScroll = () => {
    scrolled = true;
    window.removeEventListener("scroll", onScroll);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.setTimeout(() => {
    if (!scrolled) {
      forcedReveal = true;
      revealListeners.forEach((l) => l());
    }
  }, REVEAL_DELAY);
}

function useForcedReveal() {
  const [forced, setForced] = useState(forcedReveal);
  useEffect(() => {
    if (forcedReveal) {
      setForced(true);
      return;
    }
    const listener = () => setForced(true);
    revealListeners.add(listener);
    return () => {
      revealListeners.delete(listener);
    };
  }, []);
  return forced;
}

type Props = BoxProps & {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
};

// Wrapper que anima fade + slide-up cuando entra en el viewport. framer-motion
// se queda con el elemento animado (opacity + y); cualquier disposición o
// estilo se pasa como props de Chakra normales y aterrizan en el Box interno,
// evitando el choque de tipos entre framer-motion y Chakra. Ej.:
//   <FadeInSection display="flex" justifyContent="center"> …
export function FadeInSection({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const forced = useForcedReveal();
  const visible = inView || forced;

  return (
    <MotionDiv
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: "easeOut" }}
      // Altura completa para no romper la cadena de `h="100%"` cuando el wrapper
      // es celda de un grid/flex (tarjetas de igual altura). En contextos sin
      // altura definida, 100% resuelve a auto y no molesta.
      style={{ height: "100%" }}
    >
      <Box h="100%" {...rest}>
        {children}
      </Box>
    </MotionDiv>
  );
}
