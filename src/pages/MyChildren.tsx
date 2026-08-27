import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import type { ChildApi } from "@/lib/apiTypes";
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  Heading,
  SimpleGrid,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Baby, Droplet, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion(Box);

// Vista de solo lectura del portal del acudiente. Lee de /portal/children (token
// scope=portal). La gestión de hijos (crear/editar/eliminar) queda para el admin;
// aquí el acudiente solo consulta.
function ageFromBirth(birthDate: string): number | null {
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age < 0 ? null : age;
}

export default function MyChildren() {
  const { token } = useAuth();
  const { data, loading, error } = useFetch<ChildApi[]>(
    token ? "/portal/children" : null
  );
  const children = data ?? [];

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar tus hijos", { description: error });
    }
  }, [error]);

  return (
    <DashboardLayout
      title="Mis hijos"
      subtitle="Niños registrados en tu cuenta de Lucera"
    >
      {loading && !data ? (
        <LoadingState label="Cargando tus hijos…" />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <AnimatePresence mode="popLayout">
              {children.map((n) => {
                const age = ageFromBirth(n.birthDate);
                return (
                  <MotionDiv
                    key={n.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                  >
                    <StatCard>
                      <HStack align="flex-start" spacing={3}>
                        <Flex
                          h={12}
                          w={12}
                          borderRadius="xl"
                          bg="naranja.50"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Baby size={22} color="#f08159" />
                        </Flex>
                        <Box flex={1}>
                          <Heading size="sm" fontFamily="heading">
                            {n.name}
                          </Heading>
                          <Text fontSize="xs" color="lucera.textMuted">
                            {age != null ? `${age} años · ` : ""}Nacido{" "}
                            {n.birthDate}
                          </Text>

                          <SimpleGrid columns={2} spacing={3} mt={4}>
                            <Box>
                              <Text
                                fontSize="10px"
                                textTransform="uppercase"
                                color="lucera.textMuted"
                                letterSpacing="wider"
                              >
                                Peso
                              </Text>
                              <Text fontWeight={700}>
                                {n.weightKg ? `${n.weightKg} kg` : "—"}
                              </Text>
                            </Box>
                            <Box>
                              <Text
                                fontSize="10px"
                                textTransform="uppercase"
                                color="lucera.textMuted"
                                letterSpacing="wider"
                              >
                                Tipo de sangre
                              </Text>
                              {n.bloodType ? (
                                <Badge variant="outline">
                                  <HStack spacing={1}>
                                    <Droplet size={10} color="#b91c1c" />
                                    <Text fontFamily="mono">{n.bloodType}</Text>
                                  </HStack>
                                </Badge>
                              ) : (
                                <Text fontSize="xs" color="lucera.textMuted">
                                  —
                                </Text>
                              )}
                            </Box>
                          </SimpleGrid>

                          <Box
                            mt={3}
                            pt={3}
                            borderTopWidth="1px"
                            borderColor="lucera.borderSoft"
                          >
                            <Text
                              fontSize="10px"
                              textTransform="uppercase"
                              color="lucera.textMuted"
                              letterSpacing="wider"
                              mb={1.5}
                            >
                              Antecedentes
                            </Text>
                            <Wrap spacing={1}>
                              {(n.allergies ?? []).map((a) => (
                                <WrapItem key={a}>
                                  <Badge colorScheme="amarillo">
                                    <HStack spacing={1}>
                                      <AlertTriangle size={10} />
                                      <Text>{a}</Text>
                                    </HStack>
                                  </Badge>
                                </WrapItem>
                              ))}
                              {(n.conditions ?? []).map((c) => (
                                <WrapItem key={c}>
                                  <Badge colorScheme="blue">{c}</Badge>
                                </WrapItem>
                              ))}
                              {!n.allergies?.length &&
                                !n.conditions?.length && (
                                  <Text fontSize="xs" color="lucera.textMuted">
                                    Sin antecedentes
                                  </Text>
                                )}
                            </Wrap>
                          </Box>
                        </Box>
                      </HStack>
                    </StatCard>
                  </MotionDiv>
                );
              })}
            </AnimatePresence>
            {children.length === 0 && (
              <Text
                color="lucera.textMuted"
                gridColumn={{ md: "span 2" }}
                textAlign="center"
                py={6}
              >
                Aún no tienes hijos registrados.
              </Text>
            )}
          </SimpleGrid>

          <Text fontSize="xs" color="lucera.textMuted" mt={6} textAlign="center">
            ¿Necesitas agregar o actualizar los datos de un hijo? Escríbenos por
            WhatsApp y el equipo de Lucera lo gestiona por ti.
          </Text>
        </>
      )}
    </DashboardLayout>
  );
}
