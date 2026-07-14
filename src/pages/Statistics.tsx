import { useState, useMemo } from "react";
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
  triajeStats,
  chats,
  planesDistribucion,
  kpisGenerales,
  acudientes,
  paisesCiudades,
  segurosMedicos,
} from "@/lib/mockData";
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
import { exportToExcel } from "@/lib/exportToExcel";

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
  const { user } = useAuth();
  if (!user) return null;
  if (user.rol === "Ventas") return <Navigate to="/payments" replace />;

  const canExport = user.rol !== "Invitado" && user.rol !== "Ventas";

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pais, setPais] = useState("");
  const [seguro, setSeguro] = useState("");
  const [acudienteFilter, setAcudienteFilter] = useState("");
  const [applied, setApplied] = useState(false);
  const [snapshot, setSnapshot] = useState({ fechaInicio: "", fechaFin: "", pais: "", seguro: "", acudiente: "" });

  const handleSearch = () => {
    setSnapshot({ fechaInicio, fechaFin, pais, seguro, acudiente: acudienteFilter });
    setApplied(true);
  };

  const filteredAcudientes = useMemo(() => {
    if (!applied) return [];
    return acudientes.filter((a) => {
      const okPais = !snapshot.pais || snapshot.pais === "todos" || a.pais === snapshot.pais;
      const okSeguro = !snapshot.seguro || snapshot.seguro === "todos" || a.seguro === snapshot.seguro;
      const okAcudiente = !snapshot.acudiente || snapshot.acudiente === "todos" || a.id === snapshot.acudiente;
      const okFechaInicio = !snapshot.fechaInicio || a.registrado >= snapshot.fechaInicio;
      const okFechaFin = !snapshot.fechaFin || a.registrado <= snapshot.fechaFin;
      return okPais && okSeguro && okAcudiente && okFechaInicio && okFechaFin;
    });
  }, [applied, snapshot]);

  const k = kpisGenerales;

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
            isDisabled={!fechaInicio && !fechaFin && !pais && !seguro && !acudienteFilter}
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

      {/* Con filtros aplicados */}
      {applied && (
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
                Distribución por plan
              </Heading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={planesDistribucion}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#7b5a48" }}
                  />
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
            <StatCard>
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
                        fill={
                          (triajeColors as triajeColorsProps)[
                            e.nivel as keyof triajeColorsProps
                          ]
                        }
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
                      bg={
                        (triajeColors as triajeColorsProps)[
                          t.nivel as keyof triajeColorsProps
                        ]
                      }
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
      )}
    </DashboardLayout>
  );
}
