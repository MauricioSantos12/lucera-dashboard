import { ReactNode } from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.div;

type Props = BoxProps & {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
};

// Wrapper que anima fade + slide-up cuando entra en el viewport. Los props
// de estilo (BoxProps) se aplican a un Box interno para no chocar con los
// tipos de evento propios de framer-motion en el elemento animado.
export function FadeInSection({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  ...rest
}: Props) {
  return (
    <MotionBox
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      <Box {...rest}>{children}</Box>
    </MotionBox>
  );
}
