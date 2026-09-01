import { Badge, BadgeProps } from "@chakra-ui/react";
import { TriageLevel } from "@/lib/mockData";

const map: Record<TriageLevel, { bg: string; color: string; label: string }> = {
  general:    { bg: "success.500",       color: "white", label: "General" },
  urgente:    { bg: "gold.500",    color: "brand.900", label: "Urgente" },
  emergencia: { bg: "danger.500",     color: "white", label: "Emergencia" },
};

export function TriageBadge({ level, ...rest }: { level: TriageLevel } & BadgeProps) {
  const m = map[level];
  return (
    <Badge bg={m.bg} color={m.color} px={2} py={0.5} borderRadius="md" fontSize="10px" {...rest}>
      {m.label}
    </Badge>
  );
}
