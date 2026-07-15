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
  Download,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  acudientes,
  paisesCiudades,
  segurosMedicos,
} from "@/lib/mockData";
import { useFetch } from "@/hooks/useFetch";
import { chatTriageToLevel, countryApiToEs } from "@/lib/apiMappings";
import type {
  KpisResponse,
  TriageStatApi,
  PlanStatApi,
  ChatApi,
  GuardianApi,
  PatientApi,
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
import { exportToExcel } from "@/lib/exportToExcel";
import { toast } from "@/lib/toast";

const triajeColors: Record<TriageStatApi["level"], string> = {
  General: "#2f9e6b",
  Urgent: "#f8cc37",
  Emergency: "#b91c1c",
};

const triajeLabels: Record<TriageStatApi["level"], string> = {
  General: "General",
  Urgent: "Urgente",
  Emergency: "Emergencia",
};

// Patrón "Pie Chart With Customized Label" de recharts: dibuja el % dentro
// de cada porción, a mitad de camino entre el radio interno y el externo.
const RADIAN = Math.PI / 180;
function renderTriajeLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent === 0) return null;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const planLabels: Record<PlanStatApi["plan"], string> = {
  free: "Gratuito",
  premium_monthly: "Premium Mensual",
  premium_annual: "Premium Anual",
};

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
    data: triageData,
    loading: triageLoading,
    error: triageError,
  } = useFetch<TriageStatApi[]>(token ? "/api/stats/triage" : null);
  const {
    data: plansData,
    loading: plansLoading,
    error: plansError,
  } = useFetch<PlanStatApi[]>(token ? "/api/stats/plans" : null);
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

  const statsLoading =
    kpisLoading ||
    triageLoading ||
    plansLoading ||
    chatsLoading ||
    guardiansLoading ||
    patientsLoading;

  useEffect(() => {
    const err =
      kpisError ||
      triageError ||
      plansError ||
      chatsError ||
      guardiansError ||
      patientsError;
    if (err) {
      toast.error("No se pudieron cargar las estadísticas", {
        description: err,
      });
    }
  }, [kpisError, triageError, plansError, chatsError, guardiansError, patientsError]);
  const triajeStats = triageData ?? [];
  const chats = chatsData?.items ?? [];
  const guardianesReales = useMemo(
    () => guardiansData?.items ?? [],
    [guardiansData]
  );
  const pacientesReales = useMemo(
    () => patientsData?.items ?? [],
    [patientsData]
  );

  const consultasStats = [
    { name: "Atendidas", value: chats.filter((c) => c.status === "closed").length },
    { name: "Total", value: chats.length },
    { name: "Abiertas", value: chats.filter((c) => c.status !== "closed").length },
  ];
  const consultasColors = brandColors;

  const aseguradoraStats = useMemo(() => {
    const counts = new Map<string, number>();
    guardianesReales.forEach((g) => {
      const name = g.insurance?.name ?? "Sin seguro";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [guardianesReales]);

  const paisStats = useMemo(() => {
    const counts = new Map<string, number>();
    guardianesReales.forEach((g) => {
      const name = countryApiToEs[g.country] ?? g.country;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [guardianesReales]);

  const edadStats = useMemo(() => {
    const buckets = {
      "Lactantes (0-1)": 0,
      "Preescolar (2-5)": 0,
      "Escolar (6+)": 0,
    };
    pacientesReales.forEach((p) => {
      if (p.age < 2) buckets["Lactantes (0-1)"]++;
      else if (p.age < 6) buckets["Preescolar (2-5)"]++;
      else buckets["Escolar (6+)"]++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [pacientesReales]);

  const planesDistribucion = (plansData ?? []).map((p) => ({
    plan: planLabels[p.plan] ?? p.plan,
    usuarios: p.users,
  }));
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

  const filteredAcudientes = useMemo(() => {
    if (!applied) return [];
    return acudientes.filter((a) => {
      const okPais =
        !snapshot.pais || snapshot.pais === "todos" || a.pais === snapshot.pais;
      const okSeguro =
        !snapshot.seguro ||
        snapshot.seguro === "todos" ||
        a.seguro === snapshot.seguro;
      const okAcudiente =
        !snapshot.acudiente ||
        snapshot.acudiente === "todos" ||
        a.id === snapshot.acudiente;
      const okFechaInicio =
        !snapshot.fechaInicio || a.registrado >= snapshot.fechaInicio;
      const okFechaFin =
        !snapshot.fechaFin || a.registrado <= snapshot.fechaFin;
      return okPais && okSeguro && okAcudiente && okFechaInicio && okFechaFin;
    });
  }, [applied, snapshot]);
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

  const k = {
    acudientesActivos: kpisData?.activeGuardians ?? 0,
    ninosRegistrados: kpisData?.registeredChildren ?? 0,
    sesionesMes: kpisData?.sessionsThisMonth ?? 0,
    conversionPremium: kpisData?.premiumConversion ?? 0,
    csat: kpisData?.csat ?? 0,
    emergenciasDetectadas: kpisData?.emergenciesDetected ?? 0,
    derivacionesPresenciales: kpisData?.inPersonReferrals ?? 0,
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
              {Object.keys(paisesCiudades).map((p) => (
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
              {segurosMedicos.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              {acudientes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </Select>
          </Box>
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
            <Button
              size="sm"
              variant="solid"
              leftIcon={<Download size={14} />}
              isDisabled={!canExport}
              onClick={() =>
                exportToExcel(
                  filteredAcudientes.map((a) => ({
                    ID: a.id,
                    Nombre: a.nombre,
                    Email: a.email,
                    Teléfono: a.telefono,
                    País: a.pais,
                    Ciudad: a.ciudad,
                    Seguro: a.seguro ?? "",
                    "ID Seguro": a.seguroId ?? "",
                    Plan: a.plan,
                    Estado: a.estado,
                    Niños: a.ninos.length,
                    Registrado: a.registrado,
                  })),
                  "estadisticas-lucera",
                  "Estadísticas"
                )
              }
            >
              Exportar
            </Button>
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
      {applied && statsLoading && <LoadingState label="Cargando estadísticas…" />}

      {/* Con filtros aplicados */}
      {applied && !statsLoading && (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={4}>
            <Stat
              icon={Users}
              label="Acudientes"
              value={filteredAcudientes.length}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Coinciden con filtros"
            />
            <Stat
              icon={Baby}
              label="Niños registrados"
              value={filteredAcudientes.reduce(
                (sum, a) => sum + a.ninos.length,
                0
              )}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
              sub="Pacientes pediátricos"
            />
            <Stat
              icon={MessageSquare}
              label="Sesiones del mes"
              value={k.sesionesMes.toLocaleString()}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
              sub="Conversaciones completas"
            />
            <Stat
              icon={DollarSign}
              label="Ingresos del mes"
              value={`$${k.ingresosMes.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`}
              accent={{ bg: "exito.500", fg: "white" }}
              sub="Stripe + Yappy"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
            <Stat
              icon={AlertTriangle}
              label="Emergencias detectadas"
              value={k.emergenciasDetectadas}
              accent={{ bg: "peligro.500", fg: "white" }}
              sub="Triaje rojo (mes)"
            />
            <Stat
              icon={Building2}
              label="Derivaciones presenciales"
              value={k.derivacionesPresenciales}
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
                      <Cell key={i} fill={triajeColors[e.level]} stroke="white" strokeWidth={2} />
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
                      {triajeLabels[t.level]}
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
                  <YAxis tick={{ fontSize: 11, fill: "#7b5a48" }} allowDecimals={false} />
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
                      <Cell key={i} fill={consultasColors[i % consultasColors.length]} />
                    ))}
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
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7b5a48" }} />
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
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7b5a48" }} />
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
                      <Cell key={i} fill={brandColors[i % brandColors.length]} />
                    ))}
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
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7b5a48" }} />
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
                      <Cell key={i} fill={brandColors[i % brandColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </StatCard>

            <StatCard>
              <Heading size="sm" fontFamily="heading" mb={4}>
                Pacientes por edad
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={edadStats} margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7b5a48" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(248,204,55,0.12)" }}
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
                    {edadStats.map((_, i) => (
                      <Cell key={i} fill={brandColors[i % brandColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
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
              {chats.slice(0, 4).map((c) => (
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
