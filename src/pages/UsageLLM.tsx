import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { useFetchAll } from "@/hooks/useFetchAll";
import { toast } from "@/lib/toast";
import { LoadingState } from "@/components/LoadingState";
import { StatCard } from "@/components/StatCard";
import type {
  UsageSummaryApi,
  UsageByDayApi,
  UsageByUserApi,
  GuardianApi,
  InsuranceRef,
} from "@/lib/apiTypes";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
} from "@chakra-ui/react";
import {
  MessageSquare,
  LogIn,
  LogOut,
  Cpu,
  DollarSign,
  Clock,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumber, formatCurrency } from "@/lib/format";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Ciclo de colores de marca (vino, naranja, amarillo), igual que en Estadísticas.
const brandColors = ["#6d122b", "#ef7d54", "#f8cc37"];

// Deja ~18% de espacio arriba de la barra más alta para que la etiqueta no se recorte.
const yAxisDomain: [number, (dataMax: number) => number] = [
  0,
  (dataMax) => (dataMax || 1) * 1.18,
];

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

export default function UsageLLM() {
  const { token } = useAuth();

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useFetch<UsageSummaryApi>(token ? "/api/usage/summary" : null);
  const {
    data: byDay,
    loading: byDayLoading,
    error: byDayError,
  } = useFetch<UsageByDayApi[]>(token ? "/api/usage/by-day" : null);
  const {
    data: byUser,
    loading: byUserLoading,
    error: byUserError,
  } = useFetch<UsageByUserApi[]>(token ? "/api/usage/by-user" : null);
  // El consumo se atribuye por teléfono → acudiente → su aseguradora.
  const {
    data: guardiansData,
    loading: guardiansLoading,
    error: guardiansError,
  } = useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const {
    data: insurancesData,
    loading: insurancesLoading,
    error: insurancesError,
  } = useFetchAll<InsuranceRef>(token ? "/api/insurances" : null);

  useEffect(() => {
    const err =
      summaryError ||
      byDayError ||
      byUserError ||
      guardiansError ||
      insurancesError;
    if (err) {
      toast.error("No se pudo cargar el consumo del LLM", {
        description: err,
      });
    }
  }, [summaryError, byDayError, byUserError, guardiansError, insurancesError]);

  const [q, setQ] = useState("");
  const users = byUser ?? [];
  const filteredUsers = users.filter((u) =>
    `${u.guardian} ${u.phone}`.toLowerCase().includes(q.toLowerCase())
  );

  // Por defecto, última semana (hoy - 6 días hasta hoy)
  const [fechaFin, setFechaFin] = useState(() => toISODate(new Date(Date.now())));
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date(Date.now());
    d.setDate(d.getDate() - 6);
    return toISODate(d);
  });

  const filteredByDay = useMemo(
    () =>
      (byDay ?? []).filter((d) => d.date >= fechaInicio && d.date <= fechaFin),
    [byDay, fechaInicio, fechaFin]
  );

  // Costo del LLM agrupado por aseguradora. El consumo viene por teléfono
  // (/api/usage/by-user), el teléfono identifica al acudiente
  // (/api/guardians) y de ahí sale su aseguradora. El nombre autoritativo se
  // resuelve por id contra el catálogo de /api/insurances.
  const costoPorAseguradora = useMemo(() => {
    const catalogo = new Map(
      (insurancesData?.items ?? []).map((i) => [i.id, i.name])
    );
    const acudientePorTelefono = new Map(
      (guardiansData?.items ?? []).map((g) => [g.phone, g])
    );
    const totales = new Map<string, number>();
    (byUser ?? []).forEach((u) => {
      const acudiente = acudientePorTelefono.get(u.phone);
      const etiqueta = !acudiente
        ? "Sin acudiente"
        : acudiente.insurance
        ? catalogo.get(acudiente.insurance.id) ?? acudiente.insurance.name
        : "Sin seguro";
      totales.set(etiqueta, (totales.get(etiqueta) ?? 0) + u.costUsd);
    });
    return [...totales.entries()]
      .map(([name, costUsd]) => ({ name, costUsd }))
      .sort((a, b) => b.costUsd - a.costUsd);
  }, [byUser, guardiansData, insurancesData]);

  // Control de consistencia: lo atribuido debe cuadrar con el consumo total.
  const costoAtribuido = costoPorAseguradora.reduce(
    (s, r) => s + r.costUsd,
    0
  );
  const costoTotal = summary?.costUsd ?? 0;
  const cobertura = costoTotal > 0 ? (costoAtribuido / costoTotal) * 100 : 0;

  const loading =
    summaryLoading ||
    byDayLoading ||
    byUserLoading ||
    guardiansLoading ||
    insurancesLoading;

  return (
    <DashboardLayout
      title="Consumo LLM"
      subtitle="Uso y costo del modelo de IA · actualizado cada ~60s"
    >
      {loading && !summary ? (
        <LoadingState label="Cargando consumo del LLM…" />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4} mb={4}>
            <Stat
              icon={MessageSquare}
              label="Llamadas"
              value={formatNumber(summary?.calls ?? 0)}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Total de invocaciones al LLM"
            />
            <Stat
              icon={DollarSign}
              label="Costo total"
              value={formatCurrency(summary?.costUsd ?? 0, 4)}
              accent={{ bg: "exito.500", fg: "white" }}
              sub="USD acumulado"
            />
            <Stat
              icon={Clock}
              label="Latencia promedio"
              value={`${formatNumber(summary?.avgLatencyMs ?? 0)} ms`}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
              sub="Por llamada"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
            <Stat
              icon={LogIn}
              label="Tokens de entrada"
              value={formatNumber(summary?.inputTokens ?? 0)}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
            />
            <Stat
              icon={LogOut}
              label="Tokens de salida"
              value={formatNumber(summary?.outputTokens ?? 0)}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
            />
            <Stat
              icon={Cpu}
              label="Tokens totales"
              value={formatNumber(summary?.totalTokens ?? 0)}
              accent={{ bg: "vino.50", fg: "vino.500" }}
            />
          </SimpleGrid>

          <StatCard mb={6}>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={3}
              mb={4}
              align={{ md: "center" }}
              justify="space-between"
            >
              <Heading size="sm" fontFamily="heading">
                Consumo diario
              </Heading>
              <Flex gap={3} wrap="wrap">
                <Box>
                  <Text fontSize="xs" fontWeight={600} mb={1}>
                    Fecha inicio
                  </Text>
                  <Input
                    type="date"
                    size="sm"
                    value={fechaInicio}
                    max={fechaFin}
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
                    min={fechaInicio}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </Box>
              </Flex>
            </Flex>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filteredByDay} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7b5a48" }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#7b5a48" }}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#7b5a48" }}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e9d2b1",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) =>
                    name === "Costo (USD)"
                      ? formatCurrency(value, 4)
                      : formatNumber(value)
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="calls"
                  name="Llamadas"
                  fill="#6d122b"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="costUsd"
                  name="Costo (USD)"
                  fill="#ef7d54"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            {filteredByDay.length === 0 && (
              <Text mt={3} fontSize="sm" color="lucera.textMuted" textAlign="center">
                No hay consumo registrado en el rango seleccionado.
              </Text>
            )}
          </StatCard>

          <StatCard mb={6}>
            <Heading size="sm" fontFamily="heading" mb={1}>
              Costo por aseguradora
            </Heading>
            <Text fontSize="xs" color="lucera.textMuted" mb={4}>
              Costo del LLM atribuido a la aseguradora del acudiente que
              generó cada consulta.
            </Text>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={costoPorAseguradora}
                margin={{ top: 20, left: 0, right: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d2b1" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 10, fill: "#7b5a48" }}
                />
                <YAxis
                  domain={yAxisDomain}
                  tick={{ fontSize: 11, fill: "#7b5a48" }}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip
                  cursor={{ fill: "rgba(109,18,43,0.06)" }}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e9d2b1",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v, 4)}
                />
                <Bar
                  dataKey="costUsd"
                  name="Costo (USD)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={70}
                  animationDuration={700}
                  animationEasing="ease-out"
                >
                  {costoPorAseguradora.map((_, i) => (
                    <Cell key={i} fill={brandColors[i % brandColors.length]} />
                  ))}
                  <LabelList
                    dataKey="costUsd"
                    position="top"
                    formatter={(v: number) => formatCurrency(v, 4)}
                    fontSize={11}
                    fontWeight={700}
                    fill="#3a2a1f"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {costoPorAseguradora.length === 0 ? (
              <Text mt={3} fontSize="sm" color="lucera.textMuted" textAlign="center">
                No hay consumo atribuible todavía.
              </Text>
            ) : (
              <Text mt={3} fontSize="xs" color="lucera.textMuted">
                Atribuido: {formatCurrency(costoAtribuido, 4)} de{" "}
                {formatCurrency(costoTotal, 4)} de consumo total (
                {cobertura.toFixed(1)}%). La diferencia, si la hay, es por
                redondeo de cada acudiente a 4 decimales.
              </Text>
            )}
          </StatCard>

          <StatCard>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={3}
              mb={4}
              align={{ md: "center" }}
              justify="space-between"
            >
              <Heading size="sm" fontFamily="heading">
                Consumo por acudiente
              </Heading>
              <InputGroup w={{ base: "100%", md: "280px" }}>
                <InputLeftElement pointerEvents="none">
                  <Search size={16} />
                </InputLeftElement>
                <Input
                  placeholder="Buscar acudiente o teléfono…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </InputGroup>
            </Flex>
            <TableContainer
              borderWidth="1px"
              borderColor="lucera.border"
              borderRadius="md"
            >
              <Table size="sm">
                <Thead bg="crema.100">
                  <Tr>
                    <Th>Acudiente</Th>
                    <Th display={{ base: "none", md: "table-cell" }}>
                      Teléfono
                    </Th>
                    <Th isNumeric>Llamadas</Th>
                    <Th isNumeric>Tokens</Th>
                    <Th isNumeric>Costo</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredUsers.map((u) => (
                    <Tr key={u.phone} _hover={{ bg: "crema.50" }}>
                      <Td fontSize="sm" fontWeight={600}>
                        {u.guardian}
                      </Td>
                      <Td
                        display={{ base: "none", md: "table-cell" }}
                        fontSize="xs"
                        color="lucera.textMuted"
                      >
                        {u.phone}
                      </Td>
                      <Td isNumeric sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatNumber(u.calls)}
                      </Td>
                      <Td isNumeric sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatNumber(u.tokens)}
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={700}
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatCurrency(u.costUsd, 4)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            {filteredUsers.length === 0 && (
              <Text mt={3} fontSize="sm" color="lucera.textMuted" textAlign="center">
                No hay resultados.
              </Text>
            )}
          </StatCard>
        </>
      )}
    </DashboardLayout>
  );
}
