import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Payment } from "@/lib/mockData";
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

const statusStyle: Record<
  Payment["status"],
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

type PaymentRow = Payment & { insurance: string };

// El API de pagos no trae guardianId ni seguro directo, solo el nombre del
// acudiente (p.guardian) — se cruza por nombre contra /api/guardians para
// resolver la aseguradora. Puede fallar si dos acudientes comparten nombre.
function paymentApiToRow(
  p: PaymentApi,
  insuranceByGuardianName: Record<string, string>
): PaymentRow {
  return {
    id: p.id,
    guardian: p.guardian,
    amount: p.amount,
    method: paymentMethodToEs[p.method] ?? "Stripe",
    plan: (paymentPlanToEs[p.plan] ?? p.plan) as Payment["plan"],
    status: paymentStatusToEs[p.status] ?? "pendiente",
    date: p.date,
    providerResponse: p.providerResponse,
    paymentType: p.paymentType,
    insurance: insuranceByGuardianName[p.guardian] ?? "",
  };
}

export default function Payments() {
  const { user, token } = useAuth();
  const canExport = user?.role !== "Invitado";

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

  const insuranceByGuardianName = useMemo(
    () =>
      Object.fromEntries(
        (guardiansData?.items ?? []).map((g) => [g.name, g.insurance?.name ?? ""])
      ),
    [guardiansData]
  );
  const insurances = useMemo(() => insurancesData?.items ?? [], [insurancesData]);
  const payments = useMemo(
    () =>
      (paymentsData?.items ?? []).map((p) =>
        paymentApiToRow(p, insuranceByGuardianName)
      ),
    [paymentsData, insuranceByGuardianName]
  );

  useEffect(() => {
    const err = paymentsError || guardiansError || insurancesError;
    if (err) {
      toast.error("No se pudieron cargar los pagos", { description: err });
    }
  }, [paymentsError, guardiansError, insurancesError]);

  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [method, setMethod] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [planFilter, setPlanFilter] = useState("todos");
  const [insuranceFilter, setInsuranceFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  // Loading breve para dar feedback al cambiar filtros.
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashLoading = useCallback(() => {
    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearching(false), 450);
  }, []);
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const plans = useMemo(
    () => [...new Set(payments.map((p) => p.plan))].sort(),
    [payments]
  );

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const okQ = `${p.id} ${p.guardian} ${p.plan}`
        .toLowerCase()
        .includes(q.toLowerCase());
      // p.date viene como "YYYY-MM-DD HH:MM"; comparamos por prefijo de
      // fecha en vez de parsear a Date para evitar líos de zona horaria.
      const date = p.date.slice(0, 10);
      const okStartDate = !startDate || date >= startDate;
      const okEndDate = !endDate || date <= endDate;
      const okM = method === "todos" || p.method === method;
      const okE = status === "todos" || p.status === status;
      const okP = planFilter === "todos" || p.plan === planFilter;
      const okS =
        insuranceFilter === "todos" ||
        (insuranceFilter === "sin_seguro" ? !p.insurance : p.insurance === insuranceFilter);
      return (
        okQ &&
        okStartDate &&
        okEndDate &&
        okM &&
        okE &&
        okP &&
        okS
      );
    });
  }, [payments, q, startDate, endDate, method, status, planFilter, insuranceFilter]);

  // Al cambiar filtros: volver a la primera página y mostrar loading breve.
  useEffect(() => {
    setPage(1);
    flashLoading();
  }, [
    q,
    startDate,
    endDate,
    method,
    status,
    planFilter,
    insuranceFilter,
    flashLoading,
  ]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // p.date viene como "YYYY-MM-DD HH:MM"; comparamos por prefijo de fecha
  // en vez de parsear a Date para evitar líos de zona horaria.
  const now = Date.now();
  const todayStr = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD
  const monthStr = todayStr.slice(0, 7); // YYYY-MM

  const revenueToday = filtered
    .filter((p) => p.status === "confirmado" && p.date.slice(0, 10) === todayStr)
    .reduce((s, p) => s + p.amount, 0);
  const revenueMonth = filtered
    .filter((p) => p.status === "confirmado" && p.date.slice(0, 7) === monthStr)
    .reduce((s, p) => s + p.amount, 0);
  const pending = filtered.filter((p) => p.status === "pendiente").length;
  const failed24h = filtered.filter(
    (p) =>
      p.status === "fallido" &&
      now - new Date(p.date.replace(" ", "T")).getTime() <= 24 * 60 * 60 * 1000
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
          value={formatCurrency(revenueToday)}
          bg="naranja.50"
          fg="naranja.500"
        />
        <Kpi
          icon={DollarSign}
          label="Ingresos del mes"
          value={formatCurrency(revenueMonth)}
          bg="vino.50"
          fg="vino.500"
        />
        <Kpi
          icon={Clock}
          label="Pendientes"
          value={pending}
          bg="amarillo.50"
          fg="amarillo.700"
        />
        <Kpi
          icon={XCircle}
          label="Fallidos (24h)"
          value={failed24h}
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
              Fecha inicio
            </Text>
            <Input
              type="date"
              w={{ base: "100%", md: "160px" }}
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Fecha fin
            </Text>
            <Input
              type="date"
              w={{ base: "100%", md: "160px" }}
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Método
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              {plans.map((p) => (
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
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value)}
            >
              <option value="todos">Todos los seguros</option>
              <option value="sin_seguro">Sin seguro</option>
              {insurances.map((s) => (
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
              Acudiente: p.guardian,
              Plan: p.plan,
              Método: p.method,
              Monto: p.amount,
              Estado: p.status,
              Seguro: p.insurance,
              Fecha: p.date,
            }))}
          />
        </Flex>

        {(paymentsLoading && !paymentsData) ||
        (guardiansLoading && !guardiansData) ||
        (insurancesLoading && !insurancesData) ||
        searching ? (
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
                const { tone, label, Icon } = statusStyle[p.status];
                return (
                  <Tr key={p.id} _hover={{ bg: "crema.50" }}>
                    <Td fontFamily="mono" fontSize="xs">
                      {p.id}
                    </Td>
                    <Td fontSize="sm" fontWeight={600}>
                      {p.guardian}
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
                          <Text>{p.method}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight={700}>
                      {formatCurrency(p.amount)}
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
                      {p.date}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {payments.length} transacciones
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
