import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  Activity,
  MessageSquare,
  AlertTriangle,
  Heart,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Baby,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ComposedChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useFetch } from "@/hooks/useFetch";
import { chatTriageToLevel } from "@/lib/apiMappings";
import type {
  KpisResponse,
  TriageStatApi,
  ChatApi,
  GuardianApi,
  PatientApi,
  InsuranceRef,
  PaginatedResponse,
} from "@/lib/apiTypes";
import {
  Box,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Text,
  Heading,
  Input,
  Select,
  Button,
  Icon,
} from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { TriageBadge } from "@/components/TriageBadge";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { formatNumber, formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

const triajeColors: Record<TriageStatApi["level"], string> = {
  General: "#2f9e6b",
  Urgent: "#f8cc37",
  Emergency: "#b91c1c",
};

// Mapea el triage (minúscula) de cada chat al nivel (capitalizado) que usa
// el resto de la gráfica de triaje.
const chatTriageLevelMap: Record<ChatApi["triage"], TriageStatApi["level"]> = {
  general: "General",
  urgent: "Urgent",
  emergency: "Emergency",
};

// Patrón "Pie Chart With Customized Label" de recharts: dibuja el nombre del
// nivel y el % dentro de cada porción, a mitad de camino entre el radio
// interno y el externo.
const RADIAN = Math.PI / 180;
function renderTriajeLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent === 0) return null;
  const anchor = x > cx ? "start" : "end";
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      <tspan x={x} dy="-0.3em">
        {name}
      </tspan>
      <tspan x={x} dy="1.1em">
        {`${(percent * 100).toFixed(0)}%`}
      </tspan>
    </text>
  );
}

// Ciclo de colores de marca (vino, naranja, amarillo) reutilizado en todas
// las gráficas de barras para mantener consistencia visual.
const brandColors = ["#6d122b", "#ef7d54", "#f8cc37"];
const planColors = brandColors;

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

export default function Statistics() {
  const { user, token } = useAuth();
  const {
    data: kpisData,
    loading: kpisLoading,
    error: kpisError,
  } = useFetch<KpisResponse>(token ? "/api/stats/kpis" : null);
  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useFetch<PaginatedResponse<ChatApi>>(
    token ? "/api/chats?page=1&page_limit=500" : null
  );
  const {
    data: guardiansData,
    loading: guardiansLoading,
    error: guardiansError,
  } = useFetch<PaginatedResponse<GuardianApi>>(
    token ? "/api/guardians?page=1&page_limit=500" : null
  );
  const {
    data: patientsData,
    loading: patientsLoading,
    error: patientsError,
  } = useFetch<PaginatedResponse<PatientApi>>(
    token ? "/api/patients?page=1&page_limit=500" : null
  );
  const {
    data: insurancesData,
    loading: insurancesLoading,
    error: insurancesError,
  } = useFetch<PaginatedResponse<InsuranceRef>>(
    token ? "/api/insurances?page=1&page_limit=100" : null
  );

  const statsLoading =
    kpisLoading ||
    chatsLoading ||
    guardiansLoading ||
    patientsLoading ||
    insurancesLoading;

  useEffect(() => {
    const err =
      kpisError || chatsError || guardiansError || patientsError || insurancesError;
    if (err) {
      toast.error("No se pudieron cargar las estadísticas", {
        description: err,
      });
    }
  }, [kpisError, chatsError, guardiansError, patientsError, insurancesError]);
  const chats = useMemo(() => chatsData?.items ?? [], [chatsData]);
  const guardianesReales = useMemo(
    () => guardiansData?.items ?? [],
    [guardiansData]
  );
  const pacientesReales = useMemo(
    () => patientsData?.items ?? [],
    [patientsData]
  );

  // Por defecto: mes actual (desde el día 1 hasta hoy), calculado con Date.now().
  const defaultFechaFin = useMemo(
    () => new Date(Date.now()).toISOString().slice(0, 10),
    []
  );
  const defaultFechaInicio = useMemo(() => {
    const d = new Date(Date.now());
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [fechaInicio, setFechaInicio] = useState(defaultFechaInicio);
  const [fechaFin, setFechaFin] = useState(defaultFechaFin);
  const [pais, setPais] = useState("");
  const [seguro, setSeguro] = useState("");
  const [acudienteFilter, setAcudienteFilter] = useState("");
  const [applied, setApplied] = useState(true);
  const [snapshot, setSnapshot] = useState({
    fechaInicio: defaultFechaInicio,
    fechaFin: defaultFechaFin,
    pais: "",
    seguro: "",
    acudiente: "",
  });

  // Opciones de los selects, derivadas de la data real (no de listas mock),
  // para que siempre coincidan con lo que llega del API. El de seguro médico
  // sale de /api/insurances, la fuente oficial del catálogo de aseguradoras.
  const paisOptions = useMemo(
    () => [...new Set(guardianesReales.map((g) => g.country))].sort(),
    [guardianesReales]
  );
  const seguros = useMemo(() => insurancesData?.items ?? [], [insurancesData]);
  const seguroOptions = useMemo(
    () => [...seguros].sort((a, b) => a.name.localeCompare(b.name)),
    [seguros]
  );
  const acudienteOptions = useMemo(
    () => [...guardianesReales].sort((a, b) => a.name.localeCompare(b.name)),
    [guardianesReales]
  );

  // Acudientes reales que pasan los filtros de país/seguro/acudiente. El
  // rango de fechas NO filtra aquí (sería la fecha de registro del
  // acudiente, casi siempre fuera del mes en curso) — filtra las CHATS más
  // abajo, para que "mes en curso" describa la actividad del período y no
  // esconda acudientes ya registrados de antes.
  const filteredGuardianes = useMemo(() => {
    if (!applied) return [];
    return guardianesReales.filter((g) => {
      const okPais =
        !snapshot.pais || snapshot.pais === "todos" || g.country === snapshot.pais;
      const okSeguro =
        !snapshot.seguro ||
        snapshot.seguro === "todos" ||
        g.insurance?.name === snapshot.seguro;
      const okAcudiente =
        !snapshot.acudiente ||
        snapshot.acudiente === "todos" ||
        g.id === snapshot.acudiente;
      return okPais && okSeguro && okAcudiente;
    });
  }, [applied, snapshot, guardianesReales]);

  const filteredGuardianIds = useMemo(
    () => new Set(filteredGuardianes.map((g) => g.id)),
    [filteredGuardianes]
  );
  const filteredGuardianPhones = useMemo(
    () => new Set(filteredGuardianes.map((g) => g.phone)),
    [filteredGuardianes]
  );

  const filteredPacientes = useMemo(
    () => pacientesReales.filter((p) => filteredGuardianIds.has(p.guardianId)),
    [pacientesReales, filteredGuardianIds]
  );
  // Actividad (chats) del período seleccionado — por defecto, el mes en
  // curso (snapshot.fechaInicio/fechaFin arrancan en defaultFechaInicio/Fin).
  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      if (!filteredGuardianPhones.has(c.phone)) return false;
      const fecha = c.startedAt.slice(0, 10);
      const okFechaInicio = !snapshot.fechaInicio || fecha >= snapshot.fechaInicio;
      const okFechaFin = !snapshot.fechaFin || fecha <= snapshot.fechaFin;
      return okFechaInicio && okFechaFin;
    });
  }, [chats, filteredGuardianPhones, snapshot]);

  const consultasStats = [
    {
      name: "Cerradas",
      value: filteredChats.filter((c) => c.status === "closed").length,
    },
    { name: "Total", value: filteredChats.length },
    {
      name: "Abiertas",
      value: filteredChats.filter((c) => c.status !== "closed").length,
    },
  ];
  const consultasColors = brandColors;

  const triajeStats = useMemo(() => {
    const counts: Record<TriageStatApi["level"], number> = {
      General: 0,
      Urgent: 0,
      Emergency: 0,
    };
    filteredChats.forEach((c) => {
      counts[chatTriageLevelMap[c.triage]]++;
    });
    return (Object.keys(counts) as TriageStatApi["level"][]).map((level) => ({
      level,
      value: counts[level],
    }));
  }, [filteredChats]);

  const aseguradoraStats = useMemo(() => {
    const counts = new Map<string, number>();
    filteredGuardianes.forEach((g) => {
      const name = g.insurance?.name ?? "Sin seguro";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredGuardianes]);

  const paisStats = useMemo(() => {
    const counts = new Map<string, number>();
    filteredGuardianes.forEach((g) => {
      counts.set(g.country, (counts.get(g.country) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredGuardianes]);

  // Distribución de pacientes por cada edad exacta: curva de densidad
  // (área suavizada de un solo lado) en vez de un violin plot espejado.
  const edadDistribucion = useMemo(() => {
    const counts = new Map<number, number>();
    filteredPacientes.forEach((p) => {
      counts.set(p.age, (counts.get(p.age) ?? 0) + 1);
    });
    const maxAge = counts.size > 0 ? Math.max(...counts.keys()) : 0;
    const rows: { age: number; count: number }[] = [];
    for (let age = 0; age <= maxAge; age++) {
      rows.push({ age, count: counts.get(age) ?? 0 });
    }
    return rows;
  }, [filteredPacientes]);

  const planesDistribucion = useMemo(() => {
    const counts = new Map<string, number>();
    filteredGuardianes.forEach((g) => {
      counts.set(g.plan, (counts.get(g.plan) ?? 0) + 1);
    });
    return [...counts.entries()].map(([plan, usuarios]) => ({
      plan,
      usuarios,
    }));
  }, [filteredGuardianes]);

  if (!user) return null;
  if (user.rol === "Ventas") return <Navigate to="/payments" replace />;

  const canExport = user.rol !== "Invitado";

  const handleSearch = () => {
    setSnapshot({
      fechaInicio,
      fechaFin,
      pais,
      seguro,
      acudiente: acudienteFilter,
    });
    setApplied(true);
  };

  // Todos los KPIs se derivan de las queries de acudientes/pacientes/chats
  // ya filtradas, para que respondan a los filtros aplicados con "Buscar".
  // Solo "ingresos del mes" se queda con kpisData: no hay ninguna otra
  // query en esta página que traiga pagos/facturación por acudiente.
  // filteredChats ya está acotado por el rango de fechas seleccionado
  // (mes en curso por defecto), así que "sesiones" es directamente su total.
  const sesionesMes = filteredChats.length;

  const ratedChats = filteredChats.filter((c) => c.rating != null);
  const csatCalculado =
    ratedChats.length > 0
      ? Math.round(
          (ratedChats.filter((c) => (c.rating ?? 0) >= 4).length /
            ratedChats.length) *
            100
        )
      : 0;

  const totalUsuariosPlan = filteredGuardianes.length;
  const usuariosPremium = filteredGuardianes.filter(
    (g) => g.plan !== "free"
  ).length;
  const conversionPremiumCalculada =
    totalUsuariosPlan > 0
      ? Math.round((usuariosPremium / totalUsuariosPlan) * 100)
      : 0;

  const k = {
    acudientesActivos: filteredGuardianes.filter((g) => g.status === "active")
      .length,
    ninosRegistrados: filteredPacientes.length,
    sesionesMes,
    conversionPremium: conversionPremiumCalculada,
    csat: csatCalculado,
    emergenciasDetectadas:
      triajeStats.find((t) => t.level === "Emergency")?.value ?? 0,
    derivacionesPresenciales: filteredChats.filter(
      (c) => c.attentionType === "in_person"
    ).length,
    ingresosMes: kpisData?.revenueThisMonth ?? 0,
  };

  return (
    <DashboardLayout
      title="Estadísticas"
      subtitle="Indicadores operativos del chatbot pediátrico Lucera"
    >
      {/* Filtros */}
      <StatCard mb={6}>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align={{ md: "end" }}
          wrap="wrap"
        >
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Fecha inicio
            </Text>
            <Input
              type="date"
              size="sm"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Fecha fin
            </Text>
            <Input
              type="date"
              size="sm"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              País
            </Text>
            <Select
              size="sm"
              placeholder="Seleccionar opción"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            >
              <option value="todos">Todos</option>
              {paisOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Seguro médico
            </Text>
            <Select
              size="sm"
              placeholder="Seleccionar opción"
              value={seguro}
              onChange={(e) => setSeguro(e.target.value)}
            >
              <option value="todos">Todos</option>
              {seguroOptions.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Acudiente
            </Text>
            <Select
              size="sm"
              placeholder="Seleccionar opción"
              value={acudienteFilter}
              onChange={(e) => setAcudienteFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              {acudienteOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mt={4} justify="flex-end" wrap="wrap">
          <Button
            colorScheme="vino"
            size="sm"
            leftIcon={<Search size={14} />}
            onClick={handleSearch}
            isDisabled={
              !fechaInicio && !fechaFin && !pais && !seguro && !acudienteFilter
            }
          >
            Buscar
          </Button>
          {applied && (
            <ExportButton
              size="sm"
              isDisabled={!canExport}
              filename="estadisticas-lucera"
              sheetName="Estadísticas"
              data={filteredGuardianes.map((g) => ({
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
          )}
        </Flex>
      </StatCard>

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

      {/* Cargando estadísticas */}
      {applied && statsLoading && (
        <LoadingState label="Cargando estadísticas…" />
      )}

      {/* Con filtros aplicados */}
      {applied && !statsLoading && (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={4}>
            <Stat
              icon={Users}
              label="Acudientes activos"
              value={formatNumber(k.acudientesActivos)}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Total en la plataforma"
            />
            <Stat
              icon={Baby}
              label="Niños registrados"
              value={formatNumber(k.ninosRegistrados)}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
              sub="Pacientes pediátricos"
            />
            <Stat
              icon={MessageSquare}
              label="Sesiones del mes"
              value={formatNumber(k.sesionesMes)}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
              sub="Conversaciones completas"
            />
            <Stat
              icon={DollarSign}
              label="Ingresos del mes"
              value={formatCurrency(k.ingresosMes)}
              accent={{ bg: "exito.500", fg: "white" }}
              sub="Stripe + Yappy"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
            <Stat
              icon={AlertTriangle}
              label="Emergencias detectadas"
              value={formatNumber(k.emergenciasDetectadas)}
              accent={{ bg: "peligro.500", fg: "white" }}
              sub="Triaje rojo (mes)"
            />
            <Stat
              icon={Building2}
              label="Derivaciones presenciales"
              value={formatNumber(k.derivacionesPresenciales)}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
              sub="Sesiones → cita"
            />
            <Stat
              icon={TrendingUp}
              label="Conversión a Premium"
              value={`${k.conversionPremium}%`}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Gratuito → Pago"
            />
            <Stat
              icon={Heart}
              label="CSAT (≥4★)"
              value={`${k.csat}%`}
              accent={{ bg: "exito.500", fg: "white" }}
              sub="Calificación voluntaria"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} mb={6}>
            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Distribución por triaje
              </Heading>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={triajeStats}
                    dataKey="value"
                    nameKey="level"
                    innerRadius={35}
                    outerRadius={95}
                    paddingAngle={3}
                    cornerRadius={6}
                    label={renderTriajeLabel}
                    labelLine={false}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {triajeStats.map((e, i) => (
                      <Cell
                        key={i}
                        fill={triajeColors[e.level]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e9d2b1",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <VStack align="stretch" spacing={1.5} mt={2}>
                {triajeStats.map((t) => (
                  <HStack key={t.level} fontSize="xs">
                    <Box
                      h="10px"
                      w="10px"
                      borderRadius="full"
                      bg={triajeColors[t.level]}
                    />
                    <Text color="lucera.textMuted" flex={1}>
                      {t.level}
                    </Text>
                    <Text
                      fontWeight={700}
                      sx={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {t.value}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Consultas: atendidas, total y abiertas
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={consultasStats} margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(109,18,43,0.06)" }}
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e9d2b1",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    stackId="a"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={70}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {consultasStats.map((_, i) => (
                      <Cell
                        key={i}
                        fill={consultasColors[i % consultasColors.length]}
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
                Distribución por plan
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={planesDistribucion} margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="plan"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(109,18,43,0.06)" }}
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e9d2b1",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="usuarios"
                    stackId="a"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={70}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {planesDistribucion.map((_, i) => (
                      <Cell key={i} fill={planColors[i % planColors.length]} />
                    ))}
                    <LabelList
                      dataKey="usuarios"
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
                Acudientes por aseguradora
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={aseguradoraStats} margin={{ left: 0 }}>
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
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(239,125,84,0.08)" }}
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e9d2b1",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    stackId="a"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {aseguradoraStats.map((_, i) => (
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
                Acudientes por país
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={paisStats} margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(109,18,43,0.06)" }}
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e9d2b1",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    stackId="a"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={70}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {paisStats.map((_, i) => (
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
                Pacientes por edad
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={edadDistribucion} margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                    tickFormatter={(age: number) => `${age}a`}
                  />
                  <YAxis
                    allowDecimals={false}
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
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </StatCard>
          </SimpleGrid>

          <StatCard>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="sm" fontFamily="heading">
                Sesiones recientes
              </Heading>
              <Icon as={Activity} boxSize={4} color="naranja.500" />
            </Flex>
            <VStack align="stretch" spacing={0}>
              {filteredChats.slice(0, 4).map((c) => (
                <HStack
                  key={c.id}
                  py={2}
                  borderBottomWidth="1px"
                  borderColor="lucera.borderSoft"
                  _last={{ borderBottom: 0 }}
                  spacing={3}
                >
                  <TriageBadge level={chatTriageToLevel[c.triage]} />
                  <Box flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                      {c.patient}
                    </Text>
                    <Text fontSize="xs" color="lucera.textMuted" noOfLines={1}>
                      {c.guardian} · {c.lastMessage}
                    </Text>
                  </Box>
                  <Text
                    fontSize="xs"
                    color="lucera.textMuted"
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {c.time}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </StatCard>
        </>
      )}
    </DashboardLayout>
  );
}
