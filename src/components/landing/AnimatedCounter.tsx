import { useEffect, useRef, useState } from "react";
import { Heading, HeadingProps } from "@chakra-ui/react";
import { useInView, animate } from "framer-motion";

type Props = HeadingProps & { value: string };

// Separa "3,400+" / "92%" en { prefix: "", number: 3400, suffix: "+" }
function parseValue(value: string) {
  const match = value.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!match) return { prefix: "", number: 0, suffix: value, decimals: 0, hasThousands: false };
  const [, prefix, numStr, suffix] = match;
  const number = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  const hasThousands = numStr.includes(",");
  return { prefix, number, suffix, decimals, hasThousands };
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
    const { prefix, number, suffix, decimals, hasThousands } = parseValue(value);
    const controls = animate(0, number, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        const formatted =
          decimals > 0
            ? latest.toFixed(decimals)
            : Math.round(latest).toLocaleString(hasThousands ? "en-US" : undefined);
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
