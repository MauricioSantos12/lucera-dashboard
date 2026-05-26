import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { pagos, Pago } from "@/lib/mockData";
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
import { exportToExcel } from "@/lib/exportToExcel";

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

export default function Payments() {
  const [q, setQ] = useState("");
  const [metodo, setMetodo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    setPage(1);
    return pagos.filter((p) => {
      const okQ = `${p.id} ${p.acudiente} ${p.plan}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okM = metodo === "todos" || p.metodo === metodo;
      const okE = estado === "todos" || p.estado === estado;
      return okQ && okM && okE;
    });
  }, [q, metodo, estado]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const total = filtered
    .filter((p) => p.estado === "confirmado")
    .reduce((s, p) => s + p.monto, 0);
  const pendientes = filtered.filter((p) => p.estado === "pendiente").length;
  const fallidos = filtered.filter((p) => p.estado === "fallido").length;

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
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={4}>
        <Kpi
          icon={DollarSign}
          label="Ingresos hoy"
          value={`$${total.toFixed(2)}`}
          bg="naranja.50"
          fg="naranja.500"
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
          value={fallidos}
          bg="peligro.500"
          fg="white"
        />
      </SimpleGrid>

      <StatCard>
        <Flex direction={{ base: "column", md: "row" }} gap={3} mb={4}>
          <InputGroup flex={1}>
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
          <Button variant="solid" leftIcon={<Download size={16} />} onClick={() => exportToExcel(
            filtered.map(p => ({ ID: p.id, Acudiente: p.acudiente, Plan: p.plan, Método: p.metodo, Monto: p.monto, Estado: p.estado, Fecha: p.fecha })),
            "pagos-lucera",
            "Pagos"
          )}>
            Exportar
          </Button>
        </Flex>

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
      </StatCard>
    </DashboardLayout>
  );
}
