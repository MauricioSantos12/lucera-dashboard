import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  Activity,
  Search,
  Users,
  Users2,
  UserCheck,
  UserX,
  Crown,
  Baby,
  MessageSquare,
  Siren,
  CheckCircle2,
  CircleDot,
  CircleSlash,
  Ban,
  ClipboardCheck,
  Timer,
  Clock,
  Unplug,
  TrendingDown,
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
import { useFetchAll } from "@/hooks/useFetchAll";
import type {
  ChatApi,
  GuardianApi,
  PatientApi,
  InsuranceRef,
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
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { formatNumber } from "@/lib/format";
import { toast } from "@/lib/toast";
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
  const { user, token } = useAuth();
  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useFetchAll<ChatApi>(token ? "/api/chats" : null);
  const {
    data: guardiansData,
    loading: guardiansLoading,
    error: guardiansError,
  } = useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const {
    data: patientsData,
    loading: patientsLoading,
    error: patientsError,
  } = useFetchAll<PatientApi>(token ? "/api/patients" : null);
  const {
    data: insurancesData,
    loading: insurancesLoading,
    error: insurancesError,
  } = useFetchAll<InsuranceRef>(token ? "/api/insurances" : null);

  const statsLoading =
    chatsLoading || guardiansLoading || patientsLoading || insurancesLoading;

  useEffect(() => {
    const err =
      chatsError || guardiansError || patientsError || insurancesError;
    if (err) {
      toast.error("No se pudieron cargar las estadísticas", {
        description: err,
      });
    }
  }, [chatsError, guardiansError, patientsError, insurancesError]);

  const chats = useMemo(() => chatsData?.items ?? [], [chatsData]);
  const realGuardians = useMemo(
    () => guardiansData?.items ?? [],
    [guardiansData]
  );
  const realPatients = useMemo(() => patientsData?.items ?? [], [patientsData]);

  // Distribución de attentionType en los chats: cuántos hay de cada tipo y
  // cuántos tipos distintos existen realmente en la data.
  useEffect(() => {
    if (chats.length === 0) return;
    const counts: Record<string, number> = {};
    chats.forEach((c) => {
      const key = String(c.attentionType);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    console.log(
      "[Lucera] attentionType de los chats →",
      counts,
      "· tipos distintos:",
      Object.keys(counts).length,
      "· total chats:",
      chats.length
    );
  }, [chats]);

  // Por defecto: mes actual (desde el día 1 hasta hoy), calculado con Date.now().
  const defaultEndDate = useMemo(
    () => new Date(Date.now()).toISOString().slice(0, 10),
    []
  );
  const defaultStartDate = useMemo(() => {
    const d = new Date(Date.now());
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [country, setCountry] = useState("");
  const [insurance, setInsurance] = useState("");
  const [guardianFilter, setGuardianFilter] = useState("");
  const [applied, setApplied] = useState(true);
  // Se incrementa en cada "Buscar" para re-montar los resultados y disparar la
  // animación de entrada (más dinámico al aplicar filtros).
  const [searchTick, setSearchTick] = useState(0);
  const [snapshot, setSnapshot] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    country: "",
    insurance: "",
    guardian: "",
  });

  // Opciones de los selects, derivadas de la data real (no de listas mock).
  const countryOptions = useMemo(
    () => [...new Set(realGuardians.map((g) => g.country))].sort(),
    [realGuardians]
  );
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );
  const insuranceOptions = useMemo(
    () => [...insurances].sort((a, b) => a.name.localeCompare(b.name)),
    [insurances]
  );
  const guardianOptions = useMemo(
    () => [...realGuardians].sort((a, b) => a.name.localeCompare(b.name)),
    [realGuardians]
  );

  // Acudientes que pasan los filtros de país/seguro/acudiente (SIN acotar por
  // fecha). Es la base para los chats: una consulta del período puede venir de
  // una cuenta registrada antes del rango.
  const scopedGuardians = useMemo(() => {
    if (!applied) return [];
    return realGuardians.filter((g) => {
      const okCountry =
        !snapshot.country ||
        snapshot.country === "todos" ||
        g.country === snapshot.country;
      const okInsurance =
        !snapshot.insurance ||
        snapshot.insurance === "todos" ||
        g.insurance?.name === snapshot.insurance;
      const okGuardian =
        !snapshot.guardian ||
        snapshot.guardian === "todos" ||
        g.id === snapshot.guardian;
      return okCountry && okInsurance && okGuardian;
    });
  }, [applied, snapshot, realGuardians]);

  const scopedGuardianPhones = useMemo(
    () => new Set(scopedGuardians.map((g) => g.phone)),
    [scopedGuardians]
  );

  // Cuentas del rango: además del scope, registradas dentro de [inicio, fin].
  // Todas las métricas de la sección Cuentas (activas, Free, Premium, niños…)
  // se derivan de aquí, así que responden también al filtro de fecha.
  const filteredGuardians = useMemo(() => {
    return scopedGuardians.filter((g) => {
      const date = g.registeredAt.slice(0, 10);
      const okStart = !snapshot.startDate || date >= snapshot.startDate;
      const okEnd = !snapshot.endDate || date <= snapshot.endDate;
      return okStart && okEnd;
    });
  }, [scopedGuardians, snapshot]);

  const filteredGuardianIds = useMemo(
    () => new Set(filteredGuardians.map((g) => g.id)),
    [filteredGuardians]
  );

  const filteredPatients = useMemo(
    () => realPatients.filter((p) => filteredGuardianIds.has(p.guardianId)),
    [realPatients, filteredGuardianIds]
  );

  // Actividad (chats) del período seleccionado, acotada por el rango de fechas
  // sobre startedAt y por el scope de cuentas (no por su fecha de registro).
  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      if (!scopedGuardianPhones.has(c.phone)) return false;
      const date = c.startedAt.slice(0, 10);
      const okStart = !snapshot.startDate || date >= snapshot.startDate;
      const okEnd = !snapshot.endDate || date <= snapshot.endDate;
      return okStart && okEnd;
    });
  }, [chats, scopedGuardianPhones, snapshot]);

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
    return [...counts.entries()].map(([plan, users]) => ({ plan, users }));
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

  // Género derivado de la relación (la API no expone género): mother→Femenino,
  // father→Masculino, guardian/grandparent→No especificado.
  const genderStats = useMemo(() => {
    let femenino = 0;
    let masculino = 0;
    let noEspecificado = 0;
    filteredGuardians.forEach((g) => {
      if (g.relationship === "mother") femenino++;
      else if (g.relationship === "father") masculino++;
      else noEspecificado++;
    });
    const total = filteredGuardians.length || 1;
    return [
      {
        label: "Femenino",
        value: femenino,
        pct: Math.round((femenino / total) * 100),
        color: "#6d122b",
      },
      {
        label: "Masculino",
        value: masculino,
        pct: Math.round((masculino / total) * 100),
        color: "#ef7d54",
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
      if (c.triage === "emergency") urgencias++;
      else if (c.attentionType === "in_person") citas++;
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
      if (c.triage === "emergency") entry.urgencias++;
      else if (c.attentionType === "in_person") entry.citas++;
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

  const activeUsers = useMemo(() => {
    const phones = new Set(filteredChats.map((c) => c.phone));
    return filteredGuardians.filter((g) => phones.has(g.phone)).length;
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

  console.log({ filteredChats });
  console.log({ chatStatus });

  // -------------------- DESEMPEÑO (derivado de la data filtrada) --------------------
  // No hay endpoints dedicados para estas métricas; se calculan sobre la data
  // ya filtrada, con proxies documentados donde el API no expone el dato exacto
  // (churn = bajas/suspendidas, onboarding = cuentas con ≥1 niño, interrumpidas
  // = sesiones sin cerrar).
  const performanceMetrics = useMemo(() => {
    const parseDate = (s: string) =>
      new Date((s.length <= 10 ? `${s} 00:00` : s).replace(" ", "T")).getTime();
    const total = filteredGuardians.length;

    // Límite Free sin conversión (proxy): cuentas Free vigentes.
    const freeCount = filteredGuardians.filter((g) => g.plan === "free").length;
    const freePct = total > 0 ? Math.round((freeCount / total) * 100) : 0;

    // Onboarding completo (proxy): cuentas con al menos un niño registrado.
    const withChildren = filteredGuardians.filter(
      (g) => (g.children?.length ?? 0) > 0
    ).length;
    const onboarding = total > 0 ? Math.round((withChildren / total) * 100) : 0;

    // Active account rate: cuentas con al menos una consulta.
    const activeRate = total > 0 ? Math.round((activeUsers / total) * 100) : 0;

    // Time to first consult: primer chat de cada acudiente − su registro.
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

    // Sesiones interrumpidas (proxy): chats en estado "waiting" (sin cerrar).
    const interrupted = filteredChats.filter(
      (c) => c.status === "waiting"
    ).length;
    const interruptedPct =
      filteredChats.length > 0
        ? Math.round((interrupted / filteredChats.length) * 1000) / 10
        : 0;

    // Time to resolution: promedio (cierre − inicio) de los chats cerrados.
    const ttrMin: number[] = [];
    filteredChats.forEach((c) => {
      if (c.status !== "closed" || !c.closedAt) return;
      const diff = (parseDate(c.closedAt) - parseDate(c.startedAt)) / 60_000;
      if (Number.isFinite(diff) && diff >= 0) ttrMin.push(diff);
    });
    const avgTtr = ttrMin.length
      ? ttrMin.reduce((a, b) => a + b, 0) / ttrMin.length
      : null;

    // Churn por segmento (proxy): cuentas dadas de baja/suspendidas.
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

  if (!user) return null;

  const canExport = user.role !== "Invitado";

  const handleSearch = () => {
    setSnapshot({
      startDate,
      endDate,
      country,
      insurance,
      guardian: guardianFilter,
    });
    setApplied(true);
    setSearchTick((t) => t + 1);
  };

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
      {/* Filtros */}
      <StatCard mb={2}>
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Fecha fin
            </Text>
            <Input
              type="date"
              size="sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              País
            </Text>
            <Select
              size="sm"
              placeholder="Seleccionar opción"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="todos">Todos</option>
              {countryOptions.map((p) => (
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
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
            >
              <option value="todos">Todos</option>
              {insuranceOptions.map((s) => (
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
              value={guardianFilter}
              onChange={(e) => setGuardianFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              {guardianOptions.map((g) => (
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
              !startDate &&
              !endDate &&
              !country &&
              !insurance &&
              !guardianFilter
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
              accent={{ bg: "vino.50", fg: "vino.500" }}
            />
            <Stat
              icon={Baby}
              label="Total de hijos registrados"
              value={formatNumber(totalChildren)}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
              sub="Pacientes pediátricos"
            />
            <Stat
              icon={Users2}
              label="Niños por cuenta"
              value={childrenPerAccount.toFixed(1)}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
              sub="Promedio"
            />
          </SimpleGrid>

          {/* Distribución por plan (total / free / premium) */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={4}>
            <Stat
              icon={Users}
              label="Total de cuentas"
              value={formatNumber(totalAccounts)}
              accent={{ bg: "vino.50", fg: "vino.500" }}
            />
            <Stat
              icon={UserX}
              label="Cuentas Free"
              value={formatNumber(freeAccounts)}
              accent={{ bg: "crema.100", fg: "lucera.textMuted" }}
              sub="Plan gratuito"
            />
            <Stat
              icon={Crown}
              label="Cuentas Premium"
              value={formatNumber(premiumAccounts)}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
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
                Derivado de la relación con el niño (la API no registra género).
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
              label="Abandonadas"
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

          {/* ==================== DESEMPEÑO ==================== */}
          <SectionTitle hint="Calculado sobre la data filtrada. Algunas métricas usan proxies: churn = bajas/suspendidas · onboarding = cuentas con ≥1 niño · interrumpidas = sesiones sin cerrar.">
            Desempeño
          </SectionTitle>

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
                      <Cell
                        key={i}
                        fill={brandColors[i % brandColors.length]}
                      />
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
