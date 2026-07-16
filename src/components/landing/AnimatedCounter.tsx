import { useEffect, useRef, useState } from "react";
import { Heading, HeadingProps } from "@chakra-ui/react";
import { useInView, animate } from "framer-motion";

type Props = HeadingProps & { value: string };

// Separa "3,400+" / "92%" en { prefix: "", number: 3400, suffix: "+" }
function parseValue(value: string) {
  const match = value.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!match) return { prefix: "", number: 0, suffix: value, decimals: 0 };
  const [, prefix, numStr, suffix] = match;
  const number = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix, number, suffix, decimals };
}

export function AnimatedCounter({ value, ...rest }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(() => {
    const { prefix, suffix } = parseValue(value);
    return `${prefix}0${suffix}`;
  });

  useEffect(() => {
    if (!isInView) return;
    const { prefix, number, suffix, decimals } = parseValue(value);
    const controls = animate(0, number, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        const formatted = latest.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        setDisplay(`${prefix}${formatted}${suffix}`);
      },
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <Heading ref={ref} {...rest}>
      {display}
    </Heading>
  );
}
