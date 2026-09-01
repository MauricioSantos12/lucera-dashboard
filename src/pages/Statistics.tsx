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
const brandColors = ["#6c122b", "#f08159", "#f6ca35"];

// Colores fijos para la disposición del paciente (urgencias / citas / casa),
// reutilizados en el donut y en la tendencia de 3 curvas.
const dispositionColors = {
  urgencias: "#b91c1c",
  citas: "#f08159",
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

export default function Statistics() {
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

  // -------------------- CUENTAS --------------------

  // Captación de cuentas dentro del rango, agrupada por fecha de registro.
  const accountsByDate = useMemo(() => {
    const counts = new Map<string, number>();
    filteredGuardians.forEach((g) => {
      const date = g.registeredAt.slice(0, 10);
      if (date < snapshot.startDate || date > snapshot.endDate) return;
      counts.set(date, (counts.get(date) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredGuardians, snapshot]);

  const planDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    filteredGuardians.forEach((g) => {
      counts.set(g.plan, (counts.get(g.plan) ?? 0) + 1);
    });
    return [...counts.entries()].map(([plan, users]) => ({
      plan: planDistributionLabel[plan] ?? plan,
      users,
    }));
  }, [filteredGuardians]);

  const insuranceStats = useMemo(() => {
    const counts = new Map<string, number>();
    filteredGuardians.forEach((g) => {
      const name = g.insurance?.name ?? "Sin seguro";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredGuardians]);

  const countryStats = useMemo(() => {
    const counts = new Map<string, number>();
    filteredGuardians.forEach((g) => {
      counts.set(g.country, (counts.get(g.country) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredGuardians]);

  // Género del acudiente, usando el campo real `gender` del API. Se normaliza
  // porque puede venir en distintos formatos (o null → "No especificado").
  const genderStats = useMemo(() => {
    let femenino = 0;
    let masculino = 0;
    let noEspecificado = 0;
    filteredGuardians.forEach((g) => {
      const v = (g.gender ?? "").toString().trim().toLowerCase();
      if (["female", "f", "femenino", "femenina", "mujer"].includes(v))
        femenino++;
      else if (["male", "m", "masculino", "hombre"].includes(v)) masculino++;
      else noEspecificado++;
    });
    const total = filteredGuardians.length || 1;
    return [
      {
        label: "Femenino",
        value: femenino,
        pct: Math.round((femenino / total) * 100),
        color: "#6c122b",
      },
      {
        label: "Masculino",
        value: masculino,
        pct: Math.round((masculino / total) * 100),
        color: "#f08159",
      },
      {
        label: "No especificado",
        value: noEspecificado,
        pct: Math.round((noEspecificado / total) * 100),
        color: "#c9b8a8",
      },
    ];
  }, [filteredGuardians]);

  // Captación de niños dentro del rango, usando el registro de SU acudiente
  // como fecha de referencia (los pacientes no traen fecha de alta propia).
  const childrenByDate = useMemo(() => {
    const guardiansInRange = filteredGuardians.filter((g) => {
      const date = g.registeredAt.slice(0, 10);
      return date >= snapshot.startDate && date <= snapshot.endDate;
    });
    const dateByGuardianId = new Map(
      guardiansInRange.map((g) => [g.id, g.registeredAt.slice(0, 10)])
    );
    const counts = new Map<string, number>();
    realPatients.forEach((p) => {
      const date = dateByGuardianId.get(p.guardianId);
      if (!date) return;
      counts.set(date, (counts.get(date) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredGuardians, realPatients, snapshot]);

  const ageDistribution = useMemo(() => {
    const counts = new Map<number, number>();
    filteredPatients.forEach((p) => {
      counts.set(p.age, (counts.get(p.age) ?? 0) + 1);
    });
    const maxAge = counts.size > 0 ? Math.max(...counts.keys()) : 0;
    const rows: { age: number; count: number }[] = [];
    for (let age = 0; age <= maxAge; age++) {
      rows.push({ age, count: counts.get(age) ?? 0 });
    }
    return rows;
  }, [filteredPatients]);

  if (!user) return null;

  // -------------------- Escalares derivados --------------------
  const totalAccounts = filteredGuardians.length;
  const freeAccounts = filteredGuardians.filter(
    (g) => g.plan === "free"
  ).length;
  const premiumAccounts = filteredGuardians.filter(
    (g) => g.plan !== "free"
  ).length;
  const totalChildren = filteredPatients.length;
  const childrenPerAccount =
    totalAccounts > 0 ? totalChildren / totalAccounts : 0;

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
          {/* ==================== CUENTAS ==================== */}
          <SectionTitle hint="Todos los valores corresponden al filtro seleccionado.">
            Cuentas
          </SectionTitle>

          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={4}>
            <Stat
              icon={Users}
              label="Usuarios activos"
              value={formatNumber(activeUsers)}
              accent={{ bg: "brand.50", fg: "brand.500" }}
            />
            <Stat
              icon={Baby}
              label="Total de hijos registrados"
              value={formatNumber(totalChildren)}
              accent={{ bg: "accent.50", fg: "accent.500" }}
              sub="Pacientes pediátricos"
            />
            <Stat
              icon={Users2}
              label="Niños por cuenta"
              value={childrenPerAccount.toFixed(1)}
              accent={{ bg: "gold.50", fg: "gold.700" }}
              sub="Promedio"
            />
          </SimpleGrid>

          {/* Distribución por plan (total / free / premium) */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={4}>
            <Stat
              icon={Users}
              label="Total de cuentas"
              value={formatNumber(totalAccounts)}
              accent={{ bg: "brand.50", fg: "brand.500" }}
            />
            <Stat
              icon={UserX}
              label="Cuentas Free"
              value={formatNumber(freeAccounts)}
              accent={{ bg: "cream.100", fg: "lucera.textMuted" }}
              sub="Plan gratuito"
            />
            <Stat
              icon={Crown}
              label="Cuentas Premium"
              value={formatNumber(premiumAccounts)}
              accent={{ bg: "gold.50", fg: "gold.700" }}
              sub="Planes de pago"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={1}>
                Cuentas
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Captación de cuentas registradas en el rango seleccionado.
              </Text>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={accountsByDate} margin={{ top: 20, left: 0 }}>
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
              {accountsByDate.length === 0 && (
                <Text
                  mt={2}
                  fontSize="sm"
                  color="lucera.textMuted"
                  textAlign="center"
                >
                  No hay cuentas registradas en el rango seleccionado.
                </Text>
              )}
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Distribución por plan
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={planDistribution} margin={{ top: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="plan"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
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
                    dataKey="users"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={70}
                    animationDuration={700}
                  >
                    {planDistribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={brandColors[i % brandColors.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="users"
                      position="top"
                      formatter={(v: number) => formatNumber(v)}
                      fontSize={11}
                      fontWeight={700}
                      fill="#3a2a1f"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Cuentas por aseguradora
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={insuranceStats} margin={{ top: 20, left: 0 }}>
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
                    {insuranceStats.map((_, i) => (
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
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Cuentas por país
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={countryStats} margin={{ top: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
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
                    maxBarSize={70}
                    animationDuration={700}
                  >
                    {countryStats.map((_, i) => (
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
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={1}>
                Género de los acudientes
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Según el campo de género del acudiente en el sistema.
              </Text>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={genderStats}
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
                    {genderStats.map((e, i) => (
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
                {genderStats.map((g) => (
                  <HStack key={g.label} fontSize="xs">
                    <Box h="10px" w="10px" borderRadius="full" bg={g.color} />
                    <Text color="lucera.textMuted" flex={1}>
                      {g.label}
                    </Text>
                    <Text
                      fontWeight={700}
                      sx={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {g.value} · {g.pct}%
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={1}>
                Niños registrados
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted" mb={4}>
                Captación de niños en el rango, según el registro de su
                acudiente.
              </Text>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={childrenByDate} margin={{ top: 20, left: 0 }}>
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
                    fill={brandColors[1]}
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
              {childrenByDate.length === 0 && (
                <Text
                  mt={2}
                  fontSize="sm"
                  color="lucera.textMuted"
                  textAlign="center"
                >
                  No hay niños registrados en el rango seleccionado.
                </Text>
              )}
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Pacientes por edad
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart
                  data={ageDistribution}
                  margin={{ top: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                    tickFormatter={(age: number) => `${age}a`}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={yAxisDomain}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(248,204,55,0.12)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const entry = payload.find((p) => p.dataKey === "count");
                      if (!entry) return null;
                      return (
                        <Box
                          bg="white"
                          borderWidth="1px"
                          borderColor="#e9d2b1"
                          borderRadius="md"
                          px={3}
                          py={2}
                          fontSize="xs"
                        >
                          <Text fontWeight={700}>{label} años</Text>
                          <Text>{entry.value} pacientes</Text>
                        </Box>
                      );
                    }}
                  />
                  <Area
                    dataKey="count"
                    type="monotone"
                    stroke={brandColors[2]}
                    fill={brandColors[2]}
                    fillOpacity={0.75}
                    animationDuration={700}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </StatCard>
          </SimpleGrid>
        </MotionBox>
      )}
    </DashboardLayout>
  );
}
