import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pago } from "@/lib/mockData";
import { useFetch } from "@/hooks/useFetch";
import {
  paymentMethodToEs,
  paymentStatusToEs,
  paymentPlanToEs,
} from "@/lib/apiMappings";
import type { PaymentApi, PaginatedResponse } from "@/lib/apiTypes";
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
  Download,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { exportToExcel } from "@/lib/exportToExcel";
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

function paymentApiToPago(p: PaymentApi): Pago {
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
  };
}

export default function Payments() {
  const { user, token } = useAuth();
  const canExport = user?.rol !== "Invitado" && user?.rol !== "Ventas";

  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
  } = useFetch<PaginatedResponse<PaymentApi>>(
    token ? "/api/payments?page=1&page_limit=500" : null
  );
  const pagos = useMemo(
    () => (paymentsData?.items ?? []).map(paymentApiToPago),
    [paymentsData]
  );

  useEffect(() => {
    if (paymentsError) {
      toast.error("No se pudieron cargar los pagos", {
        description: paymentsError,
      });
    }
  }, [paymentsError]);

  const [q, setQ] = useState("");
  const [metodo, setMetodo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [planFilter, setPlanFilter] = useState("todos");
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
      return okQ && okM && okE && okP;
    });
  }, [pagos, q, metodo, estado, planFilter]);

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
          value={`$${ingresosHoy.toFixed(2)}`}
          bg="naranja.50"
          fg="naranja.500"
        />
        <Kpi
          icon={DollarSign}
          label="Ingresos del mes"
          value={`$${ingresosMes.toFixed(2)}`}
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
        <Flex direction={{ base: "column", md: "row" }} gap={3} mb={4} wrap="wrap">
          <InputGroup flex={1} minW={{ md: "220px" }}>
            <InputLeftElement pointerEvents="none">
              <Search size={16} />
            </InputLeftElement>
            <Input
              placeholder="Buscar TX, acudiente o plan…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <Select
            w={{ base: "100%", md: "180px" }}
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            <option value="todos">Todos los métodos</option>
            <option value="Stripe">Stripe</option>
            <option value="Yappy">Yappy</option>
          </Select>
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
        </Flex>

        <Flex gap={3} mb={4} wrap="wrap">
          <Button variant="solid" leftIcon={<Download size={16} />} isDisabled={!canExport} onClick={() => exportToExcel(
            filtered.map(p => ({ ID: p.id, Acudiente: p.acudiente, Plan: p.plan, Método: p.metodo, Monto: p.monto, Estado: p.estado, Fecha: p.fecha })),
            "pagos-lucera",
            "Pagos"
          )}>
            Exportar
          </Button>
        </Flex>

        {paymentsLoading && !paymentsData ? (
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
                      ${p.monto.toFixed(2)}
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
