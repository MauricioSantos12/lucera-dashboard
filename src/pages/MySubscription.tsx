import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import type { GuardianApi, PortalPayment } from "@/lib/apiTypes";
import { planLabelEs } from "@/lib/guardianForm";
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { CreditCard, Crown } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

// Vista de solo lectura: plan actual (/portal/me) e historial de pagos
// (/portal/payments). Los cambios de plan los gestiona el admin/soporte.
const statusColor = (s: string) =>
  /confirm|paid|success/i.test(s)
    ? "green"
    : /pend/i.test(s)
    ? "yellow"
    : /fail|reject|cancel/i.test(s)
    ? "red"
    : "gray";

const cycleLabel = (planTier?: string | null) =>
  planTier === "premium_annual"
    ? "Anual"
    : planTier === "premium_monthly"
    ? "Mensual"
    : null;

export default function MySubscription() {
  const { token } = useAuth();
  const { data: me, loading: meLoading, error: meError } = useFetch<GuardianApi>(
    token ? "/portal/me" : null
  );
  const {
    data: paymentsData,
    loading: payLoading,
    error: payError,
  } = useFetch<PortalPayment[]>(token ? "/portal/payments" : null);
  const payments = paymentsData ?? [];

  useEffect(() => {
    const err = meError || payError;
    if (err) {
      toast.error("No se pudo cargar tu suscripción", { description: err });
    }
  }, [meError, payError]);

  if (meLoading && !me) {
    return (
      <DashboardLayout title="Mi suscripción" subtitle="Plan actual e historial de pagos">
        <LoadingState label="Cargando tu suscripción…" />
      </DashboardLayout>
    );
  }

  const planName = me ? planLabelEs[me.plan] ?? me.plan : "—";
  const isPaid = !!me && me.plan !== "free";
  const cycle = cycleLabel(me?.planTier);

  return (
    <DashboardLayout
      title="Mi suscripción"
      subtitle="Plan actual e historial de pagos"
    >
      <Box
        bgGradient="linear(135deg, vino.700 0%, vino.500 60%, naranja.600 100%)"
        color="white"
        borderRadius="xl"
        p={6}
        mb={6}
      >
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Badge bg="whiteAlpha.300" color="white" mb={2}>
              Plan actual
            </Badge>
            <Heading size="lg" fontFamily="heading" color="white">
              <HStack>
                <Text>{planName}</Text>
                {isPaid && <Crown size={20} color="#f6ca35" />}
              </HStack>
            </Heading>
            <Text opacity={0.75} fontSize="sm" mt={1}>
              {isPaid && cycle ? `Cobro ${cycle.toLowerCase()}` : "Sin costo"}
              {me?.subscriptionExpiresAt
                ? ` · Vence ${me.subscriptionExpiresAt.slice(0, 10)}`
                : ""}
            </Text>
          </Box>
          <CreditCard size={32} color="rgba(255,255,255,0.4)" />
        </Flex>
      </Box>

      <StatCard>
        <Heading size="sm" mb={3} fontFamily="heading">
          Historial de pagos
        </Heading>
        {payLoading && !paymentsData ? (
          <LoadingState label="Cargando pagos…" />
        ) : payments.length === 0 ? (
          <Text fontSize="sm" color="lucera.textMuted">
            Aún no tienes pagos registrados.
          </Text>
        ) : (
          <TableContainer
            borderWidth="1px"
            borderColor="lucera.border"
            borderRadius="md"
          >
            <Table size="sm">
              <Thead bg="crema.100">
                <Tr>
                  <Th>Plan</Th>
                  <Th>Método</Th>
                  <Th isNumeric>Monto</Th>
                  <Th>Estado</Th>
                  <Th>Fecha</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments.map((p) => (
                  <Tr key={p.id} _hover={{ bg: "crema.50" }}>
                    <Td fontSize="sm">{planLabelEs[p.plan] ?? p.plan}</Td>
                    <Td>
                      <Badge variant="outline" textTransform="capitalize">
                        {p.method}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight={700}>
                      {formatCurrency(p.amount)}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={statusColor(p.status)}
                        textTransform="capitalize"
                      >
                        {p.status}
                      </Badge>
                    </Td>
                    <Td fontSize="xs">{p.date?.slice(0, 10)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </StatCard>

      <Text fontSize="xs" color="lucera.textMuted" mt={6} textAlign="center">
        ¿Quieres cambiar de plan? Escríbenos por WhatsApp y el equipo de Lucera
        te ayuda.
      </Text>
    </DashboardLayout>
  );
}
