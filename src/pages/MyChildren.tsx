import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch } from "@/lib/apiClient";
import type {
  ChildApi,
  PortalChildCreatePayload,
  PortalChildUpdatePayload,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Badge,
  Heading,
  SimpleGrid,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Baby, Droplet, AlertTriangle, Pencil, Plus } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion(Box);

// Vista del portal del acudiente. Lee de /portal/children (token scope=portal) y
// permite agregar (POST /portal/children) y editar (PATCH /portal/children/{id}).
// El borrado NO está disponible en el portal (lo gestiona el admin).
function ageFromBirth(birthDate: string): number | null {
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age < 0 ? null : age;
}

// Estado del formulario del hijo (add/edit). bloodType no está en ChildForm del
// alta, por eso se define aquí.
interface ChildForm {
  name: string;
  birthDate: string;
  weightKg: string;
  bloodType: string;
  idNumber: string;
  school: string;
  allergies: string;
  conditions: string;
}

const emptyForm = (): ChildForm => ({
  name: "",
  birthDate: "",
  weightKg: "",
  bloodType: "",
  idNumber: "",
  school: "",
  allergies: "",
  conditions: "",
});

const formFromChild = (c: ChildApi): ChildForm => ({
  name: c.name ?? "",
  birthDate: c.birthDate ?? "",
  weightKg: c.weightKg != null ? String(c.weightKg) : "",
  bloodType: c.bloodType ?? "",
  // idNumber/school no vienen en /portal/children: quedan vacíos y solo se
  // envían si el acudiente los completa (para no borrar lo que no vemos).
  idNumber: "",
  school: "",
  allergies: (c.allergies ?? []).join(", "),
  conditions: (c.conditions ?? []).join(", "),
});

const splitList = (s: string): string[] =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

export default function MyChildren() {
  const { token, getValidToken } = useAuth();
  const { data, loading, error, refetch } = useFetch<ChildApi[]>(
    token ? "/portal/children" : null
  );
  const children = data ?? [];

  // null = cerrado; { child: null } = agregar; { child } = editar.
  const [editing, setEditing] = useState<{ child: ChildApi | null } | null>(
    null
  );
  const [form, setForm] = useState<ChildForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar tus hijos", { description: error });
    }
  }, [error]);

  const openAdd = () => {
    setForm(emptyForm());
    setEditing({ child: null });
  };
  const openEdit = (child: ChildApi) => {
    setForm(formFromChild(child));
    setEditing({ child });
  };
  const close = () => setEditing(null);

  const set = (patch: Partial<ChildForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!form.name.trim() || !form.birthDate) {
      toast.error("Nombre y fecha de nacimiento son obligatorios");
      return;
    }
    const isNew = editing.child === null;

    // Base común. weightKg/bloodType/listas se envían siempre; idNumber/school
    // solo si el acudiente los escribió (no los vemos al editar, no clobbering).
    const payload: PortalChildCreatePayload | PortalChildUpdatePayload = {
      name: form.name.trim(),
      birthDate: form.birthDate,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      bloodType: form.bloodType.trim() || undefined,
      allergies: splitList(form.allergies),
      conditions: splitList(form.conditions),
      ...(form.idNumber.trim() ? { idNumber: form.idNumber.trim() } : {}),
      ...(form.school.trim() ? { school: form.school.trim() } : {}),
    };

    setSaving(true);
    try {
      const t = await getValidToken();
      if (isNew) {
        await apiFetch("/portal/children", t, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Hijo agregado");
      } else {
        await apiFetch(`/portal/children/${editing.child!.id}`, t, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Datos actualizados");
      }
      close();
      refetch();
    } catch (err) {
      toast.error(isNew ? "No se pudo agregar" : "No se pudo actualizar", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Mis hijos"
      subtitle="Niños registrados en tu cuenta de Lucera"
    >
      {loading && !data ? (
        <LoadingState label="Cargando tus hijos…" />
      ) : (
        <>
          <Flex justify="flex-end" mb={4}>
            <Button
              colorScheme="brand"
              leftIcon={<Plus size={16} />}
              onClick={openAdd}
            >
              Agregar hijo
            </Button>
          </Flex>

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
                          bg="accent.50"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Baby size={22} color="#f08159" />
                        </Flex>
                        <Box flex={1}>
                          <Flex justify="space-between" align="flex-start">
                            <Box>
                              <Heading size="sm" fontFamily="heading">
                                {n.name}
                              </Heading>
                              <Text fontSize="xs" color="lucera.textMuted">
                                {age != null ? `${age} años · ` : ""}Nacido{" "}
                                {n.birthDate}
                              </Text>
                            </Box>
                            <IconButton
                              aria-label="Editar hijo"
                              size="sm"
                              variant="ghost"
                              icon={<Pencil size={14} />}
                              onClick={() => openEdit(n)}
                            />
                          </Flex>

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
                                  <Badge colorScheme="gold">
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
            Para eliminar un hijo, escríbenos por WhatsApp y el equipo de Lucera
            lo gestiona por ti.
          </Text>
        </>
      )}

      <Modal isOpen={!!editing} onClose={close} size="lg">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={save}>
          <ModalHeader>
            {editing?.child ? "Editar hijo" : "Agregar hijo"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired gridColumn={{ md: "span 2" }}>
                  <FormLabel>Nombre completo</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <Input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => set({ birthDate: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Peso (kg)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.weightKg}
                    onChange={(e) => set({ weightKg: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tipo de sangre</FormLabel>
                  <Input
                    placeholder="A+, O-, …"
                    value={form.bloodType}
                    onChange={(e) => set({ bloodType: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Cédula / documento</FormLabel>
                  <Input
                    value={form.idNumber}
                    onChange={(e) => set({ idNumber: e.target.value })}
                  />
                </FormControl>
                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel>Centro educativo</FormLabel>
                  <Input
                    value={form.school}
                    onChange={(e) => set({ school: e.target.value })}
                  />
                </FormControl>
                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel>Alergias (separadas por coma)</FormLabel>
                  <Input
                    placeholder="Penicilina, maní…"
                    value={form.allergies}
                    onChange={(e) => set({ allergies: e.target.value })}
                  />
                </FormControl>
                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel>Antecedentes (separados por coma)</FormLabel>
                  <Input
                    placeholder="Asma, alergia estacional…"
                    value={form.conditions}
                    onChange={(e) => set({ conditions: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={2} onClick={close} isDisabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={saving}>
              {editing?.child ? "Guardar" : "Agregar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
