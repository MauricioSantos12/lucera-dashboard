import { ReactNode } from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

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
  return (
    <MotionDiv
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
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
