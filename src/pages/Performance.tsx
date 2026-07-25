import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStatsFilters } from "@/hooks/useStatsFilters";
import { StatsFilterBar } from "@/components/StatsFilterBar";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { formatNumber } from "@/lib/format";
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Activity,
  Ban,
  ClipboardCheck,
  Timer,
  UserCheck,
  Unplug,
  Clock,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const brandColors = ["#6d122b", "#ef7d54", "#f8cc37"];
const tooltipStyle = {
  background: "white",
  border: "1px solid #e9d2b1",
  borderRadius: 8,
  fontSize: 12,
};

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

export default function Performance() {
  const stats = useStatsFilters();
  const {
    filteredGuardians,
    filteredChats,
    activeUsers,
    applied,
    searchTick,
    statsLoading,
  } = stats;

  // Métricas de desempeño derivadas de la data ya filtrada, con proxies
  // documentados donde el API no expone el dato exacto (churn = bajas/
  // suspendidas, onboarding = cuentas con ≥1 niño, interrumpidas = sesiones
  // sin cerrar).
  const performanceMetrics = useMemo(() => {
    const parseDate = (s: string) =>
      new Date((s.length <= 10 ? `${s} 00:00` : s).replace(" ", "T")).getTime();
    const total = filteredGuardians.length;

    const freeCount = filteredGuardians.filter((g) => g.plan === "free").length;
    const freePct = total > 0 ? Math.round((freeCount / total) * 100) : 0;

    const withChildren = filteredGuardians.filter(
      (g) => (g.children?.length ?? 0) > 0
    ).length;
    const onboarding = total > 0 ? Math.round((withChildren / total) * 100) : 0;

    const activeRate = total > 0 ? Math.round((activeUsers / total) * 100) : 0;

    const firstChatByPhone = new Map<string, number>();
    filteredChats.forEach((c) => {
      const t = parseDate(c.startedAt);
      const prev = firstChatByPhone.get(c.phone);
      if (prev == null || t < prev) firstChatByPhone.set(c.phone, t);
    });
    const ttfcHours: number[] = [];
    filteredGuardians.forEach((g) => {
      const first = firstChatByPhone.get(g.phone);
      if (first == null) return;
      const diff = (first - parseDate(g.registeredAt)) / 3_600_000;
      if (Number.isFinite(diff) && diff >= 0) ttfcHours.push(diff);
    });
    const avgTtfc = ttfcHours.length
      ? ttfcHours.reduce((a, b) => a + b, 0) / ttfcHours.length
      : null;

    const interrupted = filteredChats.filter(
      (c) => c.status === "waiting"
    ).length;
    const interruptedPct =
      filteredChats.length > 0
        ? Math.round((interrupted / filteredChats.length) * 1000) / 10
        : 0;

    const ttrMin: number[] = [];
    filteredChats.forEach((c) => {
      if (c.status !== "closed" || !c.closedAt) return;
      const diff = (parseDate(c.closedAt) - parseDate(c.startedAt)) / 60_000;
      if (Number.isFinite(diff) && diff >= 0) ttrMin.push(diff);
    });
    const avgTtr = ttrMin.length
      ? ttrMin.reduce((a, b) => a + b, 0) / ttrMin.length
      : null;

    const churnFor = (subset: typeof filteredGuardians) => {
      if (subset.length === 0) return 0;
      const inactive = subset.filter((g) => g.status !== "active").length;
      return Math.round((inactive / subset.length) * 1000) / 10;
    };
    const churn = [
      {
        segment: "Free",
        value: churnFor(filteredGuardians.filter((g) => g.plan === "free")),
      },
      {
        segment: "Premium",
        value: churnFor(filteredGuardians.filter((g) => g.plan !== "free")),
      },
      { segment: "Global", value: churnFor(filteredGuardians) },
    ];

    const fmtHours = (h: number) =>
      h >= 48 ? `${(h / 24).toFixed(1)} d` : `${h.toFixed(1)} h`;
    const fmtMin = (m: number) =>
      m >= 60 ? `${(m / 60).toFixed(1)} h` : `${m.toFixed(1)} min`;

    return {
      freeLimitNoConversion: { count: freeCount, pct: freePct },
      onboardingCompletionRate: onboarding,
      timeToFirstConsult: avgTtfc == null ? "—" : fmtHours(avgTtfc),
      activeAccountRate: activeRate,
      interruptedSessions: { count: interrupted, pct: interruptedPct },
      timeToResolution: avgTtr == null ? "—" : fmtMin(avgTtr),
      churn,
    };
  }, [filteredGuardians, filteredChats, activeUsers]);

  if (!stats.user) return null;

  return (
    <DashboardLayout
      title="Desempeño"
      subtitle="Indicadores de rendimiento del servicio"
    >
      <StatsFilterBar
        startDate={stats.startDate}
        setStartDate={stats.setStartDate}
        endDate={stats.endDate}
        setEndDate={stats.setEndDate}
        country={stats.country}
        setCountry={stats.setCountry}
        insurance={stats.insurance}
        setInsurance={stats.setInsurance}
        guardianFilter={stats.guardianFilter}
        setGuardianFilter={stats.setGuardianFilter}
        countryOptions={stats.countryOptions}
        insuranceOptions={stats.insuranceOptions}
        guardianOptions={stats.guardianOptions}
        onSearch={stats.handleSearch}
      />

      {!applied && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={20}
          color="lucera.textMuted"
        >
          <Icon as={Activity} boxSize={10} mb={3} opacity={0.4} />
          <Text fontSize="sm">
            Selecciona los filtros y presiona "Buscar" para ver el desempeño.
          </Text>
        </Flex>
      )}

      {applied && statsLoading && <LoadingState label="Cargando desempeño…" />}

      {applied && !statsLoading && (
        <MotionBox
          key={searchTick}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Box mt={2} mb={3}>
            <Text fontSize="xs" color="lucera.textMuted">
              Calculado sobre la data filtrada. Algunas métricas usan proxies:
              churn = bajas/suspendidas · onboarding = cuentas con ≥1 niño ·
              interrumpidas = sesiones sin cerrar.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={4}>
            <Stat
              icon={Ban}
              label="Límite Free sin conversión"
              value={formatNumber(
                performanceMetrics.freeLimitNoConversion.count
              )}
              accent={{ bg: "peligro.500", fg: "white" }}
              sub={`${performanceMetrics.freeLimitNoConversion.pct}% del total Free`}
            />
            <Stat
              icon={ClipboardCheck}
              label="Onboarding Completion Rate"
              value={`${performanceMetrics.onboardingCompletionRate}%`}
              accent={{ bg: "exito.500", fg: "white" }}
              sub="Registro completado"
            />
            <Stat
              icon={Timer}
              label="Time to first consult"
              value={performanceMetrics.timeToFirstConsult}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
              sub="Registro → 1ª consulta"
            />
            <Stat
              icon={UserCheck}
              label="Active Account Rate"
              value={`${performanceMetrics.activeAccountRate}%`}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Cuentas activas / total"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <SimpleGrid
              columns={{ base: 1, sm: 2 }}
              spacing={4}
              alignContent="start"
            >
              <Stat
                icon={Unplug}
                label="Sesiones interrumpidas"
                value={formatNumber(
                  performanceMetrics.interruptedSessions.count
                )}
                accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
                sub={`Fallos técnicos · ${performanceMetrics.interruptedSessions.pct}%`}
              />
              <Stat
                icon={Clock}
                label="Time to Resolution"
                value={performanceMetrics.timeToResolution}
                accent={{ bg: "vino.50", fg: "vino.500" }}
                sub="Duración media de sesión"
              />
            </SimpleGrid>

            <StatCard>
              <HStack mb={1} spacing={2}>
                <Icon as={TrendingDown} boxSize={4} color="peligro.500" />
                <Heading size="sm" fontFamily="heading">
                  Churn rate por segmento
                </Heading>
              </HStack>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Tasa de abandono en Free, Premium y global.
              </Text>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={performanceMetrics.churn}
                  margin={{ top: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="segment"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <YAxis
                    domain={[0, (max: number) => Math.ceil((max || 1) * 1.25)]}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(185,28,28,0.06)" }}
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [`${v}%`, "Churn"]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={70}
                    animationDuration={700}
                  >
                    {performanceMetrics.churn.map((_, i) => (
                      <Cell key={i} fill={brandColors[i % brandColors.length]} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v: number) => `${v}%`}
                      fontSize={11}
                      fontWeight={700}
                      fill="#3a2a1f"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </StatCard>
          </SimpleGrid>
        </MotionBox>
      )}
    </DashboardLayout>
  );
}
