import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import type {
  PatientApi,
  PatientCreatePayload,
  PatientPatchPayload,
  GuardianApi,
  DeleteResponse,
  BloodType,
} from "@/lib/apiTypes";
import {
  Box, Button, Flex, FormControl, FormLabel, HStack, IconButton, Input, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, SimpleGrid,
  Text, Badge, useDisclosure, Heading, VStack, Wrap, WrapItem,
} from "@chakra-ui/react";
import { Baby, Droplet, AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion(Box);

// ⚠️ Nota de seguridad (misma que en Chats.tsx): este login usa /auth/login
// (el mismo flujo de los operadores), cuyo access_token tiene acceso completo
// a /api/* — el filtrado a "solo mis hijos" ocurre SOLO en el navegador. El
// backend sí tiene un flujo aislado por diseño (/auth/guardian/login con
// teléfono+clave → token scope=portal+gid, endpoints /portal/*), pero migrar
// el login del acudiente a ese flujo es un cambio de arquitectura aparte.
export default function MyChildren() {
  const { user, token, getValidToken } = useAuth();

  const { data: guardiansData } = useFetchAll<GuardianApi>(
    token ? "/api/guardians" : null
  );
  const propioAcudiente = useMemo(
    () => (guardiansData?.items ?? []).find((g) => g.email === user?.email),
    [guardiansData, user?.email]
  );

  const {
    data: patientsData,
    loading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients,
  } = useFetchAll<PatientApi>(token ? "/api/patients" : null);

  const misHijos = useMemo(
    () =>
      (patientsData?.items ?? []).filter(
        (p) => p.guardianId === propioAcudiente?.id
      ),
    [patientsData, propioAcudiente]
  );

  useEffect(() => {
    if (patientsError) {
      toast.error("No se pudieron cargar tus hijos", {
        description: patientsError,
      });
    }
  }, [patientsError]);

  const [editing, setEditing] = useState<PatientApi | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [toDelete, setToDelete] = useState<PatientApi | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (n: PatientApi | null) => {
    setEditing(n);
    onOpen();
  };

  const handleSave = async (form: HTMLFormElement) => {
    if (!propioAcudiente) return;
    // Defensa en profundidad: la lista ya viene escopada, pero verificamos
    // de nuevo antes de escribir que el registro es realmente propio.
    if (editing && editing.guardianId !== propioAcudiente.id) {
      toast.error("No puedes editar este registro");
      return;
    }

    const fd = new FormData(form);
    const alergias = String(fd.get("alergias") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const condiciones = String(fd.get("condiciones") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const birthDate = String(fd.get("fechaNacimiento"));
    const weightKg = Number(fd.get("pesoKg")) || undefined;
    const bloodType = (fd.get("tipoSangre") as BloodType) || undefined;

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      if (editing) {
        const payload: PatientPatchPayload = {
          name: String(fd.get("nombre")),
          birthDate,
          weightKg,
          bloodType,
          conditions: condiciones,
          allergies: alergias,
        };
        await apiFetch<PatientApi>(`/api/patients/${editing.id}`, freshToken, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Datos actualizados");
      } else {
        const payload: PatientCreatePayload = {
          guardianId: propioAcudiente.id,
          name: String(fd.get("nombre")),
          birthDate,
          weightKg,
          bloodType,
          conditions: condiciones,
          allergies: alergias,
        };
        await apiFetch<PatientApi>("/api/patients", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Hijo/a registrado");
      }
      onClose();
      setEditing(null);
      refetchPatients();
    } catch (err) {
      toast.error(
        editing ? "No se pudo actualizar" : "No se pudo registrar",
        { description: err instanceof Error ? err.message : undefined }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Mis hijos" subtitle="Niños registrados en tu cuenta de Lucera">
      {guardiansData && !propioAcudiente ? (
        <Text color="lucera.textMuted" textAlign="center" py={10}>
          No encontramos tu cuenta de acudiente con este correo.
        </Text>
      ) : (
        <>
          <Flex justify="flex-end" mb={4}>
            <Button
              colorScheme="naranja"
              leftIcon={<Plus size={16} />}
              onClick={() => openEdit(null)}
              isDisabled={!propioAcudiente}
            >
              Registrar hijo/a
            </Button>
          </Flex>

          {patientsLoading && !patientsData ? (
            <LoadingState label="Cargando tus hijos…" />
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <AnimatePresence mode="popLayout">
                {misHijos.map((n) => (
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
                        <Flex h={12} w={12} borderRadius="xl" bg="naranja.50" align="center" justify="center" flexShrink={0}>
                          <Baby size={22} color="#ef7d54" />
                        </Flex>
                        <Box flex={1}>
                          <Flex justify="space-between" align="flex-start">
                            <Box>
                              <Heading size="sm" fontFamily="heading">{n.name}</Heading>
                              <Text fontSize="xs" color="lucera.textMuted">
                                {n.age} años · Nacido {n.birthDate}
                              </Text>
                            </Box>
                            <HStack spacing={1}>
                              <IconButton aria-label="Editar" size="sm" variant="ghost" icon={<Pencil size={14} />} onClick={() => openEdit(n)} />
                              <IconButton aria-label="Eliminar" size="sm" variant="ghost" color="peligro.500" icon={<Trash2 size={14} />} onClick={() => setToDelete(n)} />
                            </HStack>
                          </Flex>

                          <SimpleGrid columns={2} spacing={3} mt={4}>
                            <Box>
                              <Text fontSize="10px" textTransform="uppercase" color="lucera.textMuted" letterSpacing="wider">Peso</Text>
                              <Text fontWeight={700}>{n.weightKg ? `${n.weightKg} kg` : "—"}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="10px" textTransform="uppercase" color="lucera.textMuted" letterSpacing="wider">Tipo de sangre</Text>
                              {n.bloodType ? (
                                <Badge variant="outline">
                                  <HStack spacing={1}>
                                    <Droplet size={10} color="#b91c1c" />
                                    <Text fontFamily="mono">{n.bloodType}</Text>
                                  </HStack>
                                </Badge>
                              ) : (
                                <Text fontSize="xs" color="lucera.textMuted">—</Text>
                              )}
                            </Box>
                          </SimpleGrid>

                          <Box mt={3} pt={3} borderTopWidth="1px" borderColor="lucera.borderSoft">
                            <Text fontSize="10px" textTransform="uppercase" color="lucera.textMuted" letterSpacing="wider" mb={1.5}>Antecedentes</Text>
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
                              {!n.allergies?.length && !n.conditions?.length && (
                                <Text fontSize="xs" color="lucera.textMuted">Sin antecedentes</Text>
                              )}
                            </Wrap>
                          </Box>
                        </Box>
                      </HStack>
                    </StatCard>
                  </MotionDiv>
                ))}
              </AnimatePresence>
              {misHijos.length === 0 && (
                <Text color="lucera.textMuted" gridColumn={{ md: "span 2" }} textAlign="center" py={6}>
                  Aún no tienes hijos registrados.
                </Text>
              )}
            </SimpleGrid>
          )}
        </>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? "Editar hijo/a" : "Registrar nuevo hijo/a"}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={(e) => { e.preventDefault(); handleSave(e.currentTarget); }}>
            <ModalBody>
              <Text fontSize="xs" color="lucera.textMuted" mb={3}>Estos datos permiten a Lucera IA calcular dosis y dar recomendaciones más seguras.</Text>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl gridColumn="span 2" isRequired><FormLabel>Nombre completo</FormLabel><Input name="nombre" defaultValue={editing?.name} /></FormControl>
                <FormControl isRequired><FormLabel>Fecha de nacimiento</FormLabel><Input name="fechaNacimiento" type="date" defaultValue={editing?.birthDate} /></FormControl>
                <FormControl><FormLabel>Peso (kg)</FormLabel><Input name="pesoKg" type="number" step="0.1" min="0" defaultValue={editing?.weightKg ?? undefined} /></FormControl>
                <FormControl gridColumn="span 2"><FormLabel>Tipo de sangre</FormLabel>
                  <Select name="tipoSangre" defaultValue={editing?.bloodType ?? ""} placeholder="Sin especificar">
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormControl>
                <FormControl gridColumn="span 2"><FormLabel>Alergias (separadas por coma)</FormLabel><Input name="alergias" placeholder="Penicilina, Maní…" defaultValue={editing?.allergies?.join(", ")} /></FormControl>
                <FormControl gridColumn="span 2"><FormLabel>Condiciones médicas (separadas por coma)</FormLabel><Input name="condiciones" placeholder="Asma leve…" defaultValue={editing?.conditions?.join(", ")} /></FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={2} onClick={onClose} isDisabled={saving}>Cancelar</Button>
              <Button type="submit" colorScheme="vino" isLoading={saving}>
                {editing ? "Actualizar" : "Crear"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar registro"
        description={<>¿Eliminar el perfil de <strong>{toDelete?.name}</strong>? Se perderá su historial clínico vinculado y no se puede deshacer.</>}
        onConfirm={async () => {
          if (!toDelete || !propioAcudiente) return;
          if (toDelete.guardianId !== propioAcudiente.id) {
            toast.error("No puedes eliminar este registro");
            return;
          }
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(`/api/patients/${toDelete.id}`, freshToken, {
              method: "DELETE",
            });
            toast.success("Registro eliminado");
            refetchPatients();
          } catch (err) {
            toast.error("No se pudo eliminar el registro", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
