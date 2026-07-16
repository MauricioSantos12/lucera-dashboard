import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pago } from "@/lib/mockData";
import { useFetchAll } from "@/hooks/useFetchAll";
import {
  paymentMethodToEs,
  paymentStatusToEs,
  paymentPlanToEs,
} from "@/lib/apiMappings";
import type { PaymentApi, GuardianApi, InsuranceRef } from "@/lib/apiTypes";
import { toast } from "@/lib/toast";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Badge,
  TableContainer,
  Heading,
} from "@chakra-ui/react";
import {
  Search,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/lib/auth";

const estadoStyle: Record<
  Pago["estado"],
  { tone: string; label: string; Icon: typeof CheckCircle2 }
> = {
  confirmado: { tone: "green", label: "Confirmado", Icon: CheckCircle2 },
  pendiente: { tone: "yellow", label: "Pendiente", Icon: Clock },
  fallido: { tone: "red", label: "Fallido", Icon: XCircle },
  reembolsado: { tone: "gray", label: "Reembolsado", Icon: XCircle },
};

type KpiProps = {
  icon: typeof DollarSign;
  label: string;
  value: string | number;
  bg: string;
  fg: string;
};

type PagoRow = Pago & { seguro: string };

// El API de pagos no trae guardianId ni seguro directo, solo el nombre del
// acudiente (p.guardian) — se cruza por nombre contra /api/guardians para
// resolver la aseguradora. Puede fallar si dos acudientes comparten nombre.
function paymentApiToPago(
  p: PaymentApi,
  seguroByGuardianName: Record<string, string>
): PagoRow {
  return {
    id: p.id,
    acudiente: p.guardian,
    monto: p.amount,
    metodo: paymentMethodToEs[p.method] ?? "Stripe",
    plan: (paymentPlanToEs[p.plan] ?? p.plan) as Pago["plan"],
    estado: paymentStatusToEs[p.status] ?? "pendiente",
    fecha: p.date,
    respuestaProveedor: p.providerResponse,
    tipoPago: p.paymentType,
    seguro: seguroByGuardianName[p.guardian] ?? "",
  };
}

export default function Payments() {
  const { user, token } = useAuth();
  const canExport = user?.rol !== "Invitado";

  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
  } = useFetchAll<PaymentApi>(token ? "/api/payments" : null);
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

  const seguroByGuardianName = useMemo(
    () =>
      Object.fromEntries(
        (guardiansData?.items ?? []).map((g) => [g.name, g.insurance?.name ?? ""])
      ),
    [guardiansData]
  );
  const seguros = useMemo(() => insurancesData?.items ?? [], [insurancesData]);
  const pagos = useMemo(
    () =>
      (paymentsData?.items ?? []).map((p) =>
        paymentApiToPago(p, seguroByGuardianName)
      ),
    [paymentsData, seguroByGuardianName]
  );

  useEffect(() => {
    const err = paymentsError || guardiansError || insurancesError;
    if (err) {
      toast.error("No se pudieron cargar los pagos", { description: err });
    }
  }, [paymentsError, guardiansError, insurancesError]);

  const [q, setQ] = useState("");
  const [metodo, setMetodo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [planFilter, setPlanFilter] = useState("todos");
  const [seguroFilter, setSeguroFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const planes = useMemo(
    () => [...new Set(pagos.map((p) => p.plan))].sort(),
    [pagos]
  );

  const filtered = useMemo(() => {
    setPage(1);
    return pagos.filter((p) => {
      const okQ = `${p.id} ${p.acudiente} ${p.plan}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okM = metodo === "todos" || p.metodo === metodo;
      const okE = estado === "todos" || p.estado === estado;
      const okP = planFilter === "todos" || p.plan === planFilter;
      const okS =
        seguroFilter === "todos" ||
        (seguroFilter === "sin_seguro" ? !p.seguro : p.seguro === seguroFilter);
      return okQ && okM && okE && okP && okS;
    });
  }, [pagos, q, metodo, estado, planFilter, seguroFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // p.fecha viene como "YYYY-MM-DD HH:MM"; comparamos por prefijo de fecha
  // en vez de parsear a Date para evitar líos de zona horaria.
  const now = Date.now();
  const todayStr = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD
  const monthStr = todayStr.slice(0, 7); // YYYY-MM

  const ingresosHoy = filtered
    .filter((p) => p.estado === "confirmado" && p.fecha.slice(0, 10) === todayStr)
    .reduce((s, p) => s + p.monto, 0);
  const ingresosMes = filtered
    .filter((p) => p.estado === "confirmado" && p.fecha.slice(0, 7) === monthStr)
    .reduce((s, p) => s + p.monto, 0);
  const pendientes = filtered.filter((p) => p.estado === "pendiente").length;
  const fallidos24h = filtered.filter(
    (p) =>
      p.estado === "fallido" &&
      now - new Date(p.fecha.replace(" ", "T")).getTime() <= 24 * 60 * 60 * 1000
  ).length;

  const Kpi = ({ icon: I, label, value, bg, fg }: KpiProps) => (
    <StatCard>
      <Flex justify="space-between" align="center">
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
          <Heading size="lg" mt={1} sx={{ fontVariantNumeric: "tabular-nums" }}>
            {value}
          </Heading>
        </Box>
        <Flex
          h={10}
          w={10}
          borderRadius="lg"
          align="center"
          justify="center"
          bg={bg}
          color={fg}
        >
          <I size={18} />
        </Flex>
      </Flex>
    </StatCard>
  );

  return (
    <DashboardLayout
      title="Pagos y suscripciones"
      subtitle="Transacciones procesadas vía Stripe y Yappy"
    >
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={4}>
        <Kpi
          icon={DollarSign}
          label="Ingresos hoy"
          value={formatCurrency(ingresosHoy)}
          bg="naranja.50"
          fg="naranja.500"
        />
        <Kpi
          icon={DollarSign}
          label="Ingresos del mes"
          value={formatCurrency(ingresosMes)}
          bg="vino.50"
          fg="vino.500"
        />
        <Kpi
          icon={Clock}
          label="Pendientes"
          value={pendientes}
          bg="amarillo.50"
          fg="amarillo.700"
        />
        <Kpi
          icon={XCircle}
          label="Fallidos (24h)"
          value={fallidos24h}
          bg="peligro.500"
          fg="white"
        />
      </SimpleGrid>

      <StatCard>
        <Flex direction={{ base: "column", md: "row" }} gap={3} mb={4} align={{ md: "end" }} wrap="wrap">
          <Box flex={1} minW={{ md: "220px" }}>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Buscar
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="TX, acudiente o plan…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Método
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
            >
              <option value="todos">Todos los métodos</option>
              <option value="Stripe">Stripe</option>
              <option value="Yappy">Yappy</option>
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Estado
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="fallido">Fallido</option>
              <option value="reembolsado">Reembolsado</option>
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Plan
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="todos">Todos los planes</option>
              {planes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Aseguradora
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={seguroFilter}
              onChange={(e) => setSeguroFilter(e.target.value)}
            >
              <option value="todos">Todos los seguros</option>
              <option value="sin_seguro">Sin seguro</option>
              {seguros.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mb={4} justify="flex-end" wrap="wrap">
          <ExportButton
            isDisabled={!canExport}
            filename="pagos-lucera"
            sheetName="Pagos"
            data={filtered.map((p) => ({
              ID: p.id,
              Acudiente: p.acudiente,
              Plan: p.plan,
              Método: p.metodo,
              Monto: p.monto,
              Estado: p.estado,
              Seguro: p.seguro,
              Fecha: p.fecha,
            }))}
          />
        </Flex>

        {(paymentsLoading && !paymentsData) ||
        (guardiansLoading && !guardiansData) ||
        (insurancesLoading && !insurancesData) ? (
          <LoadingState label="Cargando pagos…" />
        ) : (
          <>
        <TableContainer
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="md"
        >
          <Table size="sm">
            <Thead bg="crema.100">
              <Tr>
                <Th>ID Transacción</Th>
                <Th>Acudiente</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Plan</Th>
                <Th>Método</Th>
                <Th isNumeric>Monto</Th>
                <Th>Estado</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Fecha</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((p) => {
                const { tone, label, Icon } = estadoStyle[p.estado];
                return (
                  <Tr key={p.id} _hover={{ bg: "crema.50" }}>
                    <Td fontFamily="mono" fontSize="xs">
                      {p.id}
                    </Td>
                    <Td fontSize="sm" fontWeight={600}>
                      {p.acudiente}
                    </Td>
                    <Td
                      display={{ base: "none", md: "table-cell" }}
                      fontSize="sm"
                      color="lucera.textMuted"
                    >
                      {p.plan}
                    </Td>
                    <Td>
                      <Badge variant="outline">
                        <HStack spacing={1}>
                          <CreditCard size={10} />
                          <Text>{p.metodo}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight={700}>
                      {formatCurrency(p.monto)}
                    </Td>
                    <Td>
                      <Badge colorScheme={tone}>
                        <HStack spacing={1}>
                          <Icon size={10} />
                          <Text>{label}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td
                      display={{ base: "none", lg: "table-cell" }}
                      fontSize="xs"
                      color="lucera.textMuted"
                    >
                      {p.fecha}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {pagos.length} transacciones
        </Text>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
          </>
        )}
      </StatCard>
    </DashboardLayout>
  );
}
