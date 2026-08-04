import { useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Activity,
  Users,
  Users2,
  UserX,
  Crown,
  Baby,
  MessageSquare,
  Siren,
  CheckCircle2,
  CircleDot,
  CircleSlash,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ComposedChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useStatsFilters } from "@/hooks/useStatsFilters";
import { StatsFilterBar } from "@/components/StatsFilterBar";
import {
  Box,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Text,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { formatNumber } from "@/lib/format";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

// Ciclo de colores de marca (vino, naranja, amarillo) reutilizado en las
// gráficas de barras para mantener consistencia visual.
const brandColors = ["#6d122b", "#ef7d54", "#f8cc37"];

// Colores fijos para la disposición del paciente (urgencias / citas / casa),
// reutilizados en el donut y en la tendencia de 3 curvas.
const dispositionColors = {
  urgencias: "#b91c1c",
  citas: "#ef7d54",
  casa: "#2f9e6b",
};

const planDistributionLabel: Record<string, string> = {
  free: "Gratuito",
  premium_annual: "Anual",
  premium_monthly: "Mensual",
};

// Deja ~18% de espacio arriba de la barra más alta para que la etiqueta
// (número sobre cada barra) nunca se recorte contra el borde superior.
const yAxisDomain: [number, (dataMax: number) => number] = [
  0,
  (dataMax) => Math.ceil((dataMax || 1) * 1.18),
];

// Patrón "Pie Chart With Customized Label" de recharts: dibuja solo el valor
// (número) centrado dentro de cada porción.
const RADIAN = Math.PI / 180;
function renderPieValueLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}) {
  if (!value) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
    >
      {formatNumber(value)}
    </text>
  );
}

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

function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <Box mt={8} mb={3}>
      <Heading size="md" fontFamily="heading">
        {children}
      </Heading>
      {hint && (
        <Text fontSize="xs" color="lucera.textMuted" mt={0.5}>
          {hint}
        </Text>
      )}
    </Box>
  );
}

const tooltipStyle = {
  background: "white",
  border: "1px solid #e9d2b1",
  borderRadius: 8,
  fontSize: 12,
};

export default function Uses() {
  const stats = useStatsFilters();
  const {
    user,
    chats,
    realPatients,
    statsLoading,
    applied,
    searching,
    searchTick,
    snapshot,
    filteredGuardians,
    filteredPatients,
    filteredChats,
    activeUsers,
    canExport,
  } = stats;

  // Distribución de attentionType en los chats: cuántos hay de cada tipo y
  // cuántos tipos distintos existen realmente en la data.
  useEffect(() => {
    if (chats.length === 0) return;
    const counts: Record<string, number> = {};
    chats.forEach((c) => {
      const key = String(c.attentionType);
      counts[key] = (counts[key] ?? 0) + 1;
    });
  }, [chats]);

  // -------------------- USO --------------------

  // Uso (chats) por fecha dentro del rango.
  const chatsByDate = useMemo(() => {
    const counts = new Map<string, number>();
    filteredChats.forEach((c) => {
      const date = c.startedAt.slice(0, 10);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredChats]);

  // Disposición del paciente por sesión (mutuamente excluyente):
  // urgencias (triaje emergencia) → citas (presencial) → casa (virtual).
  const dispositionStats = useMemo(() => {
    let urgencias = 0;
    let citas = 0;
    let casa = 0;
    filteredChats.forEach((c) => {
      if (c.derivation === "emergency") urgencias++;
      else if (c.derivation === "appointment") citas++;
      else casa++;
    });
    const total = filteredChats.length || 1;
    return [
      {
        label: "Urgencias",
        value: urgencias,
        pct: Math.round((urgencias / total) * 100),
        color: dispositionColors.urgencias,
      },
      {
        label: "Citas",
        value: citas,
        pct: Math.round((citas / total) * 100),
        color: dispositionColors.citas,
      },
      {
        label: "Casa",
        value: casa,
        pct: Math.round((casa / total) * 100),
        color: dispositionColors.casa,
      },
    ];
  }, [filteredChats]);

  // Tendencia de la disposición por fecha (3 curvas).
  const dispositionByDate = useMemo(() => {
    const map = new Map<
      string,
      { date: string; urgencias: number; citas: number; casa: number }
    >();
    filteredChats.forEach((c) => {
      const date = c.startedAt.slice(0, 10);
      if (!map.has(date))
        map.set(date, { date, urgencias: 0, citas: 0, casa: 0 });
      const entry = map.get(date)!;
      if (c.derivation === "emergency") entry.urgencias++;
      else if (c.derivation === "appointment") entry.citas++;
      else entry.casa++;
    });
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredChats]);

  // Consultas por aseguradora (chat → acudiente por teléfono → seguro).
  const chatsByInsurance = useMemo(() => {
    const insByPhone = new Map(
      filteredGuardians.map((g) => [g.phone, g.insurance?.name ?? "Sin seguro"])
    );
    const counts = new Map<string, number>();
    filteredChats.forEach((c) => {
      const name = insByPhone.get(c.phone) ?? "Sin seguro";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredChats, filteredGuardians]);

  const chatStatus = useMemo(
    () => ({
      closed: filteredChats.filter((c) => c.status === "closed").length,
      active: filteredChats.filter((c) => c.status === "active").length,
      waiting: filteredChats.filter((c) => c.status === "waiting").length,
      total: filteredChats.length,
    }),
    [filteredChats]
  );

  if (!user) return null;

  // -------------------- Escalares derivados --------------------
  const totalAccounts = filteredGuardians.length;
  const activeAccounts = filteredGuardians.filter(
    (g) => g.status === "active"
  ).length;
  const freeAccounts = filteredGuardians.filter(
    (g) => g.plan === "free"
  ).length;
  const premiumAccounts = filteredGuardians.filter(
    (g) => g.plan !== "free"
  ).length;
  const totalChildren = filteredPatients.length;
  const childrenPerAccount =
    totalAccounts > 0 ? totalChildren / totalAccounts : 0;

  const totalChats = filteredChats.length;
  const chatsPerAccount = totalAccounts > 0 ? totalChats / totalAccounts : 0;
  const emergencyChats = filteredChats.filter(
    (c) => c.triage === "emergency"
  ).length;
  const emergenciesPerAccount =
    totalAccounts > 0 ? emergencyChats / totalAccounts : 0;

  return (
    <DashboardLayout
      title="Estadísticas"
      subtitle="Indicadores operativos del chatbot pediátrico Lucera"
    >
      {/* Filtros (compartidos con la página de Desempeño) */}
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
        rightSlot={
          applied && (
            <ExportButton
              size="sm"
              isDisabled={!canExport}
              filename="estadisticas-lucera"
              sheetName="Estadísticas"
              data={filteredGuardians.map((g) => ({
                ID: g.id,
                Nombre: g.name,
                Email: g.email,
                Teléfono: g.phone,
                País: g.country,
                Ciudad: g.city,
                Seguro: g.insurance?.name ?? "",
                Plan: g.plan,
                Estado: g.status,
                Niños: g.children.length,
                Registrado: g.registeredAt,
              }))}
            />
          )
        }
      />

      {/* Sin filtros aplicados */}
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
            Selecciona los filtros y presiona "Buscar" para ver las
            estadísticas.
          </Text>
        </Flex>
      )}

      {/* Cargando estadísticas (fetch inicial o al aplicar filtros) */}
      {applied && (statsLoading || searching) && (
        <LoadingState label="Cargando estadísticas…" />
      )}

      {/* Con filtros aplicados */}
      {applied && !statsLoading && !searching && (
        <MotionBox
          key={searchTick}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* ==================== USO ==================== */}
          <SectionTitle hint="Actividad de chats dentro del filtro seleccionado.">
            Uso
          </SectionTitle>

          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={4}>
            <Stat
              icon={MessageSquare}
              label="Total de chats"
              value={formatNumber(totalChats)}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Consultas en el filtro"
            />
            <Stat
              icon={Activity}
              label="Consultas por cuenta"
              value={chatsPerAccount.toFixed(1)}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
              sub="Promedio (chats / cuentas)"
            />
            <Stat
              icon={Siren}
              label="Urgencias por cuenta"
              value={emergenciesPerAccount.toFixed(1)}
              accent={{ bg: "peligro.500", fg: "white" }}
              sub="Promedio"
            />
          </SimpleGrid>

          {/* Chats por estado */}
          <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mb={4}>
            <Stat
              icon={CheckCircle2}
              label="Cerradas"
              value={formatNumber(chatStatus.closed)}
              accent={{ bg: "exito.500", fg: "white" }}
            />
            <Stat
              icon={CircleDot}
              label="Abiertas"
              value={formatNumber(chatStatus.active)}
              accent={{ bg: "vino.50", fg: "vino.500" }}
            />
            <Stat
              icon={CircleSlash}
              label="Pendientes"
              value={formatNumber(chatStatus.waiting)}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
            />
            <Stat
              icon={MessageSquare}
              label="Total"
              value={formatNumber(chatStatus.total)}
              accent={{ bg: "crema.100", fg: "lucera.textMuted" }}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={1}>
                Chats
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Volumen de consultas en el rango seleccionado.
              </Text>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chatsByDate} margin={{ top: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#7b5a48" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={yAxisDomain}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(109,18,43,0.06)" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                    fill={brandColors[0]}
                    animationDuration={700}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v: number) => formatNumber(v)}
                      fontSize={11}
                      fontWeight={700}
                      fill="#3a2a1f"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {chatsByDate.length === 0 && (
                <Text
                  mt={2}
                  fontSize="sm"
                  color="lucera.textMuted"
                  textAlign="center"
                >
                  No hay chats en el rango seleccionado.
                </Text>
              )}
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={1}>
                Disposición: Urgencias · Citas · Casa
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Número y % de sesiones por tipo de resolución.
              </Text>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dispositionStats}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={35}
                    outerRadius={85}
                    paddingAngle={3}
                    cornerRadius={6}
                    label={renderPieValueLabel}
                    labelLine={false}
                    animationDuration={700}
                  >
                    {dispositionStats.map((e, i) => (
                      <Cell
                        key={i}
                        fill={e.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <VStack align="stretch" spacing={1.5} mt={2}>
                {dispositionStats.map((d) => (
                  <HStack key={d.label} fontSize="xs">
                    <Box h="10px" w="10px" borderRadius="full" bg={d.color} />
                    <Text color="lucera.textMuted" flex={1}>
                      {d.label}
                    </Text>
                    <Text
                      fontWeight={700}
                      sx={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {d.value} · {d.pct}%
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </StatCard>

            <StatCard gridColumn={{ lg: "span 2" }}>
              <Heading size="sm" fontFamily="heading" mb={1}>
                Tendencia: Urgencias · Casa · Citas
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Evolución de cada tipo de atención en el rango seleccionado.
              </Text>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={dispositionByDate}
                  margin={{ top: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#7b5a48" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={yAxisDomain}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="urgencias"
                    name="Urgencias detectadas"
                    stroke={dispositionColors.urgencias}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={700}
                  />
                  <Line
                    type="monotone"
                    dataKey="casa"
                    name="Atenciones en casa"
                    stroke={dispositionColors.casa}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={700}
                  />
                  <Line
                    type="monotone"
                    dataKey="citas"
                    name="Atenciones derivadas (citas)"
                    stroke={dispositionColors.citas}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={700}
                  />
                </LineChart>
              </ResponsiveContainer>
              {dispositionByDate.length === 0 && (
                <Text
                  mt={2}
                  fontSize="sm"
                  color="lucera.textMuted"
                  textAlign="center"
                >
                  No hay atenciones en el rango seleccionado.
                </Text>
              )}
            </StatCard>

            <StatCard gridColumn={{ lg: "span 2" }}>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Consultas por aseguradora
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chatsByInsurance} margin={{ top: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10, fill: "#7b5a48" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={yAxisDomain}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(239,125,84,0.08)" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                    animationDuration={700}
                  >
                    {chatsByInsurance.map((_, i) => (
                      <Cell
                        key={i}
                        fill={brandColors[i % brandColors.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v: number) => formatNumber(v)}
                      fontSize={11}
                      fontWeight={700}
                      fill="#3a2a1f"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {chatsByInsurance.length === 0 && (
                <Text
                  mt={2}
                  fontSize="sm"
                  color="lucera.textMuted"
                  textAlign="center"
                >
                  No hay consultas en el rango seleccionado.
                </Text>
              )}
            </StatCard>
          </SimpleGrid>
        </MotionBox>
      )}
    </DashboardLayout>
  );
}
