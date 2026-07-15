import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { toast } from "@/lib/toast";
import { LoadingState } from "@/components/LoadingState";
import { StatCard } from "@/components/StatCard";
import type {
  UsageSummaryApi,
  UsageByDayApi,
  UsageByUserApi,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
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

  useEffect(() => {
    const err = summaryError || byDayError || byUserError;
    if (err) {
      toast.error("No se pudo cargar el consumo del LLM", {
        description: err,
      });
    }
  }, [summaryError, byDayError, byUserError]);

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

  const loading = summaryLoading || byDayLoading || byUserLoading;

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
              value={(summary?.calls ?? 0).toLocaleString()}
              accent={{ bg: "vino.50", fg: "vino.500" }}
              sub="Total de invocaciones al LLM"
            />
            <Stat
              icon={DollarSign}
              label="Costo total"
              value={`$${(summary?.costUsd ?? 0).toFixed(4)}`}
              accent={{ bg: "exito.500", fg: "white" }}
              sub="USD acumulado"
            />
            <Stat
              icon={Clock}
              label="Latencia promedio"
              value={`${(summary?.avgLatencyMs ?? 0).toLocaleString()} ms`}
              accent={{ bg: "amarillo.50", fg: "amarillo.700" }}
              sub="Por llamada"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
            <Stat
              icon={LogIn}
              label="Tokens de entrada"
              value={(summary?.inputTokens ?? 0).toLocaleString()}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
            />
            <Stat
              icon={LogOut}
              label="Tokens de salida"
              value={(summary?.outputTokens ?? 0).toLocaleString()}
              accent={{ bg: "naranja.50", fg: "naranja.500" }}
            />
            <Stat
              icon={Cpu}
              label="Tokens totales"
              value={(summary?.totalTokens ?? 0).toLocaleString()}
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
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                        {u.calls.toLocaleString()}
                      </Td>
                      <Td isNumeric sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {u.tokens.toLocaleString()}
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={700}
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        ${u.costUsd.toFixed(4)}
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
