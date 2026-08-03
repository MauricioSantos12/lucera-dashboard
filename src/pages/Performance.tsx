import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { formatNumber } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { StatsPerformanceResponse } from "@/lib/apiTypes";
import { Box, Flex, Heading, Text, Icon, SimpleGrid } from "@chakra-ui/react";
import {
  Ban,
  ClipboardCheck,
  Timer,
  UserCheck,
  Unplug,
  Clock,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent: { bg: string; fg: string };
  sub?: string;
}

function Stat({ icon, label, value, accent, sub }: StatProps) {
  return (
    <StatCard>
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text
            fontSize="11px"
            textTransform="uppercase"
            letterSpacing="wider"
            color="lucera.textMuted"
            fontWeight={600}
          >
            {label}
          </Text>
          <Heading
            size="lg"
            mt={2}
            fontFamily="heading"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </Heading>
          {sub && (
            <Text fontSize="xs" color="lucera.textMuted" mt={0.5}>
              {sub}
            </Text>
          )}
        </Box>
        <Flex
          h={10}
          w={10}
          borderRadius="lg"
          align="center"
          justify="center"
          bg={accent.bg}
          color={accent.fg}
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
      </Flex>
    </StatCard>
  );
}

// Formatea minutos a la unidad más legible (min / h / d).
const fmtMinutes = (m: number | null): string => {
  if (m == null) return "—";
  if (m >= 1440) return `${(m / 1440).toFixed(1)} d`;
  if (m >= 60) return `${(m / 60).toFixed(1)} h`;
  return `${Math.round(m * 10) / 10} min`;
};

const pct = (v: number | null): string => (v == null ? "—" : `${v}%`);

export default function Performance() {
  const { user, token } = useAuth();
  const {
    data: perf,
    loading,
    error,
  } = useFetch<StatsPerformanceResponse>(
    token ? "/api/stats/performance" : null
  );

  useEffect(() => {
    if (error) {
      toast.error("No se pudo cargar el desempeño", { description: error });
    }
  }, [error]);

  if (!user) return null;

  return (
    <DashboardLayout
      title="Desempeño"
      subtitle="Indicadores de rendimiento del servicio"
    >
      {loading && !perf ? (
        <LoadingState label="Cargando desempeño…" />
      ) : !perf ? null : (
        <MotionBox
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={4}>
            <Stat
              icon={Timer}
              label="Time to first consult"
              value={fmtMinutes(perf.timeToFirstConsultMin)}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
              sub="Registro → 1ª consulta"
            />
            <Stat
              icon={Clock}
              label="Time to Resolution"
              value={fmtMinutes(perf.timeToResolutionMin)}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Duración media de sesión"
            />
            <Stat
              icon={UserCheck}
              label="Active Account Rate"
              value={pct(perf.activeAccountRate)}
              accent={{ bg: "exito.500", fg: "white" }}
              sub="Cuentas activas / total"
            />
            <Stat
              icon={TrendingDown}
              label="Churn Rate"
              value={pct(perf.churnRate)}
              accent={{ bg: "peligro.500", fg: "white" }}
              sub="Cuentas inactivas (~60 días)"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
            <Stat
              icon={Ban}
              label="Límite Free sin conversión"
              value={formatNumber(perf.freeLimitNoConversion)}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
              sub="Cuentas Free en el tope"
            />
            <Stat
              icon={Unplug}
              label="Sesiones con fallo técnico"
              value={formatNumber(perf.techFailureSessions)}
              accent={{ bg: "peligro.500", fg: "white" }}
              sub={`${pct(perf.techFailureRate)} de las sesiones`}
            />
          </SimpleGrid>

          {perf.note && (
            <Text fontSize="xs" color="lucera.textMuted" mt={4}>
              {perf.note}
            </Text>
          )}
        </MotionBox>
      )}
    </DashboardLayout>
  );
}
