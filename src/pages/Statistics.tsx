import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthUser, useAuth } from "@/lib/auth";
import {
  Activity,
  MessageSquare,
  AlertTriangle,
  Heart,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Building2,
  Baby,
  CalendarDays,
  Crown,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  sesionesPorMes,
  triajeStats,
  csatTrend,
  chats,
  planesDistribucion,
  kpisGenerales,
  acudientes,
  disponibilidad,
  medicos,
} from "@/lib/mockData";
import {
  Box,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Text,
  Heading,
  Badge,
  Button,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { TriageBadge } from "@/components/TriageBadge";

interface triajeColorsProps {
  General: string;
  Urgente: string;
  Emergencia: string;
}

const triajeColors: triajeColorsProps = {
  General: "#2f9e6b",
  Urgente: "#f8cc37",
  Emergencia: "#b91c1c",
};

const planColors = ["#6d122b", "#ef7d54", "#f8cc37"];

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  accent: { bg: string; fg: string };
  sub?: string;
}

function Stat({ icon, label, value, trend, trendUp, accent, sub }: StatProps) {
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
      {/* {trend && (
        <HStack spacing={1} mt={3} fontSize="xs">
          <Icon
            as={trendUp ? ArrowUpRight : ArrowDownRight}
            boxSize={3.5}
            color={trendUp ? "exito.500" : "peligro.500"}
          />
          <Text fontWeight={600} color={trendUp ? "exito.500" : "peligro.500"}>
            {trend}
          </Text>
          <Text color="lucera.textMuted">vs. mes anterior</Text>
        </HStack>
      )} */}
    </StatCard>
  );
}

function AdminStatistics() {
  const k = kpisGenerales;
  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={4}>
        <Stat
          icon={Users}
          label="Acudientes activos"
          value={k.acudientesActivos.toLocaleString()}
          trend="+12.4%"
          trendUp
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Cuentas activas"
        />
        <Stat
          icon={Baby}
          label="Niños registrados"
          value={k.ninosRegistrados.toLocaleString()}
          trend="+9.1%"
          trendUp
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Pacientes pediátricos"
        />
        <Stat
          icon={MessageSquare}
          label="Sesiones del mes"
          value={k.sesionesMes.toLocaleString()}
          trend="+8.3%"
          trendUp
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="Conversaciones completas"
        />
        <Stat
          icon={DollarSign}
          label="Ingresos del mes"
          value={`$${k.ingresosMes.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          trend="+15.2%"
          trendUp
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Stripe + Yappy"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
        <Stat
          icon={AlertTriangle}
          label="Emergencias detectadas"
          value={k.emergenciasDetectadas}
          trend="-3.1%"
          trendUp
          accent={{ bg: "peligro.500", fg: "white" }}
          sub="Triaje rojo (mes)"
        />
        <Stat
          icon={Building2}
          label="Derivaciones presenciales"
          value={k.derivacionesPresenciales}
          trend="+6.7%"
          trendUp
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Sesiones → cita"
        />
        <Stat
          icon={TrendingUp}
          label="Conversión a Premium"
          value={`${k.conversionPremium}%`}
          trend="+2.1pp"
          trendUp
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Gratuito → Pago"
        />
        <Stat
          icon={Heart}
          label="CSAT (≥4★)"
          value={`${k.csat}%`}
          trend="+1.8pp"
          trendUp
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Calificación voluntaria"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={4} mb={6}>
        {/* <StatCard gridColumn={{ lg: "span 2" }}>
          <Box mb={4}>
            <Heading size="sm" fontFamily="heading">
              Sesiones mensuales · conversión a Premium
            </Heading>
            <Text fontSize="xs" color="lucera.textMuted">
              Conversaciones completas
            </Text>
          </Box>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={sesionesPorMes}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6d122b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6d122b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef7d54" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef7d54" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7b5a48" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7b5a48" }} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e9d2b1",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="sesiones"
                stroke="#6d122b"
                strokeWidth={2}
                fill="url(#g1)"
              />
              <Area
                type="monotone"
                dataKey="premium"
                stroke="#ef7d54"
                strokeWidth={2}
                fill="url(#g2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </StatCard> */}
        <StatCard gridColumn={{ lg: "span 2" }}>
          <Heading size="sm" fontFamily="heading" mb={4}>
            Distribución por plan
          </Heading>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={planesDistribucion}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#7b5a48" }} />
              <YAxis
                type="category"
                dataKey="plan"
                tick={{ fontSize: 11, fill: "#7b5a48" }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e9d2b1",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="usuarios" radius={[0, 6, 6, 0]}>
                {planesDistribucion.map((_, i) => (
                  <Cell key={i} fill={planColors[i % planColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </StatCard>
        <StatCard gridColumn={{ lg: "span 2" }}>
          <Heading size="sm" fontFamily="heading" mb={4}>
            Distribución por triaje
          </Heading>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={triajeStats}
                dataKey="value"
                nameKey="nivel"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {triajeStats.map((e, i) => (
                  <Cell
                    key={i}
                    fill={(triajeColors as triajeColorsProps)[e.nivel]}
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
              <HStack key={t.nivel} fontSize="xs">
                <Box
                  h="10px"
                  w="10px"
                  borderRadius="full"
                  bg={(triajeColors as triajeColorsProps)[t.nivel]}
                />
                <Text color="lucera.textMuted" flex={1}>
                  {t.nivel}
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
      </SimpleGrid>

      {/* <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <StatCard>
          <Heading size="sm" fontFamily="heading" mb={4}>
            CSAT semanal
          </Heading>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={csatTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
              <XAxis
                dataKey="semana"
                tick={{ fontSize: 11, fill: "#7b5a48" }}
              />
              <YAxis
                domain={[80, 100]}
                tick={{ fontSize: 11, fill: "#7b5a48" }}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e9d2b1",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="csat"
                stroke="#ef7d54"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </StatCard>
      </SimpleGrid> */}

      <StatCard mt={6}>
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
              <TriageBadge level={c.triaje} />
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                  {c.paciente}
                </Text>
                <Text fontSize="xs" color="lucera.textMuted" noOfLines={1}>
                  {c.acudiente} · {c.ultimoMensaje}
                </Text>
              </Box>
              <Text
                fontSize="xs"
                color="lucera.textMuted"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c.hora}
              </Text>
            </HStack>
          ))}
        </VStack>
      </StatCard>
    </>
  );
}

function DoctorStatistics({ user }: { user: AuthUser }) {
  const medicoNombre =
    medicos.find((m) => m.id === user.refId)?.nombre ?? user.nombre;
  const misSlots = disponibilidad.filter(
    (s) => s.especialista === medicoNombre
  );
  const reservados = misSlots.filter((s) => s.estado === "reservado").length;
  const disponibles = misSlots.filter((s) => s.estado === "disponible").length;

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
        <Stat
          icon={CalendarDays}
          label="Citas reservadas"
          value={reservados}
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Próximos días"
        />
        <Stat
          icon={Activity}
          label="Franjas disponibles"
          value={disponibles}
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Sin reservar"
        />
        <Stat
          icon={MessageSquare}
          label="Sesiones derivadas"
          value={12}
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Esta semana"
        />
        <Stat
          icon={Heart}
          label="Mi CSAT"
          value="94%"
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub="≥4★ pacientes"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <StatCard>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm" fontFamily="heading">
              Próximas citas
            </Heading>
            <Button
              as={RouterLink}
              to="/schedule"
              size="sm"
              variant="outline"
              leftIcon={<CalendarDays size={14} />}
            >
              Ver agenda
            </Button>
          </Flex>
          {misSlots
            .filter((s) => s.estado === "reservado")
            .slice(0, 5)
            .map((s, i) => (
              <HStack
                key={i}
                py={2}
                borderBottomWidth="1px"
                borderColor="lucera.borderSoft"
                _last={{ borderBottom: 0 }}
              >
                <Text
                  fontFamily="mono"
                  fontSize="sm"
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {s.fecha} · {s.startHour}
                </Text>
                <Badge variant="outline">{s.modalidad}</Badge>
                <Badge ml="auto" colorScheme="vino">
                  Reservado
                </Badge>
              </HStack>
            ))}
          {reservados === 0 && (
            <Text
              fontSize="sm"
              color="lucera.textMuted"
              py={6}
              textAlign="center"
            >
              Sin citas reservadas
            </Text>
          )}
        </StatCard>

        <StatCard>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm" fontFamily="heading">
              Sesiones recientes
            </Heading>
            <Button as={RouterLink} to="/chats" size="sm" variant="outline">
              Ver todas
            </Button>
          </Flex>
          {chats.slice(0, 4).map((c) => (
            <HStack
              key={c.id}
              py={2}
              borderBottomWidth="1px"
              borderColor="lucera.borderSoft"
              _last={{ borderBottom: 0 }}
              spacing={3}
            >
              <TriageBadge level={c.triaje} />
              <Text fontSize="sm" flex={1} noOfLines={1}>
                {c.paciente}
              </Text>
              <Text
                fontSize="xs"
                color="lucera.textMuted"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c.hora}
              </Text>
            </HStack>
          ))}
        </StatCard>
      </SimpleGrid>
    </>
  );
}

function GuardiansStatistics({ user }: { user: AuthUser }) {
  const ac = acudientes.find((a) => a.id === user.refId) ?? acudientes[0];
  const misChats = chats.filter((c) => c.acudiente === ac.nombre);
  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
        <Stat
          icon={Baby}
          label="Mis hijos"
          value={ac.ninos.length}
          accent={{ bg: "naranja.50", fg: "naranja.500" }}
          sub="Registrados"
        />
        <Stat
          icon={MessageSquare}
          label="Mis consultas"
          value={misChats.length || 5}
          accent={{ bg: "vino.50", fg: "vino.500" }}
          sub="Total históricas"
        />
        <Stat
          icon={Crown}
          label="Plan actual"
          value={ac.plan.replace("Premium ", "")}
          accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
          sub={ac.plan === "Gratuito" ? "Hazte Premium" : "Suscripción activa"}
        />
        {/* <Stat
          icon={Heart}
          label="Salud familiar"
          value="OK"
          accent={{ bg: "exito.500", fg: "white" }}
          sub="Sin alertas"
        /> */}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} mb={4}>
        <StatCard>
          <Heading size="sm" fontFamily="heading" mb={3}>
            Mis hijos
          </Heading>
          {ac.ninos.map((n) => {
            const edad = Math.floor(
              (Date.now() - new Date(n.fechaNacimiento).getTime()) /
                (365.25 * 86400000)
            );
            return (
              <HStack
                key={n.id}
                py={2}
                borderBottomWidth="1px"
                borderColor="lucera.borderSoft"
                _last={{ borderBottom: 0 }}
                spacing={3}
              >
                <Flex
                  h="36px"
                  w="36px"
                  borderRadius="full"
                  bg="naranja.50"
                  align="center"
                  justify="center"
                >
                  <Baby size={16} color="#ef7d54" />
                </Flex>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight={600}>
                    {n.nombre}
                  </Text>
                  <Text fontSize="xs" color="lucera.textMuted">
                    {edad} años · {n.pesoKg ?? "—"} kg
                  </Text>
                </Box>
                {(n.alergias?.length ?? 0) > 0 && (
                  <Badge colorScheme="amarillo">⚠ Alergias</Badge>
                )}
              </HStack>
            );
          })}
          <Button
            as={RouterLink}
            to="/my-children"
            variant="outline"
            w="100%"
            mt={3}
          >
            Gestionar mis hijos
          </Button>
        </StatCard>

        <StatCard>
          <Heading size="sm" fontFamily="heading" mb={3}>
            Última consulta
          </Heading>
          {(misChats.length ? misChats : chats.slice(0, 1)).map((c) => (
            <HStack
              key={c.id}
              py={2}
              borderBottomWidth="1px"
              borderColor="lucera.borderSoft"
              _last={{ borderBottom: 0 }}
              spacing={3}
            >
              <TriageBadge level={c.triaje} />
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                  {c.paciente}
                </Text>
                <Text fontSize="xs" color="lucera.textMuted" noOfLines={1}>
                  {c.ultimoMensaje}
                </Text>
              </Box>
              <Text
                fontSize="xs"
                color="lucera.textMuted"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c.hora}
              </Text>
            </HStack>
          ))}
          <Button
            as={RouterLink}
            to="/my-appointments"
            variant="outline"
            w="100%"
            mt={3}
          >
            Ver historial completo
          </Button>
        </StatCard>
      </SimpleGrid>
    </>
  );
}

export default function Statistics() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.rol === "Finanzas") return <Navigate to="/payments" replace />;
  const subtitle =
    user.rol === "Admin"
      ? "Indicadores operativos del chatbot pediátrico Lucera"
      : user.rol === "Médico"
      ? "Tu actividad clínica en Lucera"
      : "Resumen de tu cuenta familiar";

  return (
    <DashboardLayout title="Estadísticas" subtitle={subtitle}>
      {user.rol === "Admin" && <AdminStatistics />}
      {user.rol === "Médico" && <DoctorStatistics user={user} />}
      {user.rol === "Acudiente" && <GuardiansStatistics user={user} />}
    </DashboardLayout>
  );
}
