import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { acudientes, pagos } from "@/lib/mockData";
import {
  Box, Button, Flex, HStack, SimpleGrid, Text, Badge, Heading, List, ListItem, ListIcon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, useDisclosure,
} from "@chakra-ui/react";
import { Check, CreditCard, Crown, Sparkles } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

const planes = [
  { key: "Gratuito", precio: 0, periodo: "siempre", features: ["3 consultas IA/mes", "Triaje básico", "Directorio de centros"] },
  { key: "Premium Mensual", precio: 9.99, periodo: "mes", features: ["Consultas IA ilimitadas", "Resumen clínico para tu pediatra", "Historial multi-niño", "Soporte prioritario"] },
  { key: "Premium Anual", precio: 89.99, periodo: "año", features: ["Todo Premium Mensual", "2 meses gratis", "Recordatorios de vacunas", "Llamada con pediatra (1/año)"] },
];

function getEndDate(fecha: string, plan: string): string {
  const start = new Date(fecha);
  if (plan === "Premium Anual") start.setFullYear(start.getFullYear() + 1);
  else start.setMonth(start.getMonth() + 1);
  return start.toISOString().slice(0, 10);
}

export default function MySubscription() {
  const { user } = useAuth();
  const ac = acudientes.find(a => a.id === user?.refId) ?? acudientes[0];
  const misPagos = pagos.filter(p => p.acudiente === ac.nombre);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleChangePlan = (planKey: string) => {
    setSelectedPlan(planKey);
    onOpen();
  };

  const confirmChange = () => {
    toast.success(`Cambio a ${selectedPlan} solicitado`);
    onClose();
    setSelectedPlan(null);
  };

  return (
    <DashboardLayout title="Mi suscripción" subtitle="Plan actual y método de pago">
      <Box bgGradient="linear(135deg, vino.700 0%, vino.500 60%, naranja.600 100%)" color="white" borderRadius="xl" p={6} mb={6}>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Badge bg="whiteAlpha.300" color="white" mb={2}>Plan actual</Badge>
            <Heading size="lg" fontFamily="heading" color="white">
              <HStack>
                <Text>{ac.plan}</Text>
                {ac.plan !== "Gratuito" && <Crown size={20} color="#f8cc37" />}
              </HStack>
            </Heading>
            <Text opacity={0.7} fontSize="sm" mt={1}>Activo desde {ac.registrado}</Text>
          </Box>
          <CreditCard size={32} color="rgba(255,255,255,0.4)" />
        </Flex>
      </Box>

      <Heading size="sm" mb={3} fontFamily="heading">Cambiar plan</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        {planes.map(p => {
          const actual = p.key === ac.plan;
          return (
            <StatCard key={p.key} display="flex" flexDirection="column" boxShadow={actual ? "0 0 0 2px var(--chakra-colors-vino-500)" : undefined}>
              <Flex justify="space-between" align="center" mb={2}>
                <Heading size="sm" fontFamily="heading">{p.key}</Heading>
                {actual && <Badge colorScheme="vino">Actual</Badge>}
              </Flex>
              <Box mb={4}>
                <Heading size="xl" fontFamily="heading" sx={{ fontVariantNumeric: "tabular-nums" }} display="inline">${p.precio}</Heading>
                <Text as="span" fontSize="xs" color="lucera.textMuted">/{p.periodo}</Text>
              </Box>
              <List spacing={1.5} flex={1} mb={4}>
                {p.features.map(f => (
                  <ListItem key={f} fontSize="sm"><ListIcon as={Check} color="exito.500" />{f}</ListItem>
                ))}
              </List>
              <Button
                isDisabled={actual}
                colorScheme="naranja"
                onClick={() => handleChangePlan(p.key)}
                leftIcon={!actual ? <Sparkles size={14} /> : undefined}
              >
                {actual ? "Plan actual" : "Cambiar"}
              </Button>
            </StatCard>
          );
        })}
      </SimpleGrid>

      <StatCard>
        <Heading size="sm" mb={3} fontFamily="heading">Historial de pagos</Heading>
        {misPagos.length === 0 ? (
          <Text fontSize="sm" color="lucera.textMuted">Aún no tienes pagos registrados.</Text>
        ) : (
          <TableContainer borderWidth="1px" borderColor="lucera.border" borderRadius="md">
            <Table size="sm">
              <Thead bg="crema.100">
                <Tr>
                  <Th>ID</Th>
                  <Th>Plan</Th>
                  <Th>Método</Th>
                  <Th>Tipo</Th>
                  <Th isNumeric>Monto</Th>
                  <Th>Estado</Th>
                  <Th>Fecha inicio</Th>
                  <Th>Fecha fin</Th>
                </Tr>
              </Thead>
              <Tbody>
                {misPagos.map(p => (
                  <Tr key={p.id} _hover={{ bg: "crema.50" }}>
                    <Td fontFamily="mono" fontSize="xs" color="lucera.textMuted">{p.id}</Td>
                    <Td fontSize="sm">{p.plan}</Td>
                    <Td><Badge variant="outline">{p.metodo}</Badge></Td>
                    <Td fontSize="sm">{p.tipoPago ?? "Crédito"}</Td>
                    <Td isNumeric fontWeight={700}>{formatCurrency(p.monto)}</Td>
                    <Td><Badge colorScheme={p.estado === "confirmado" ? "green" : p.estado === "pendiente" ? "yellow" : "gray"} textTransform="capitalize">{p.estado}</Badge></Td>
                    <Td fontSize="xs">{p.fecha.slice(0, 10)}</Td>
                    <Td fontSize="xs">{getEndDate(p.fecha, p.plan)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </StatCard>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar cambio de plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              ¿Estás seguro que deseas cambiar tu plan a <strong>{selectedPlan}</strong>?
            </Text>
            <Text fontSize="xs" color="lucera.textMuted" mt={2}>
              El cambio se aplicará de inmediato y se ajustará tu próximo cobro.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={2} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="vino" onClick={confirmChange}>Confirmar cambio</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
