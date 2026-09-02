import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch } from "@/lib/apiClient";
import type {
  ChildApi,
  GuardianApi,
  PortalChildCreatePayload,
  PortalChildUpdatePayload,
  PortalChatSummary,
  PortalChatDetail,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Collapse,
  Divider,
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
  Spinner,
  Text,
  Badge,
  Heading,
  SimpleGrid,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  Baby,
  Droplet,
  AlertTriangle,
  Pencil,
  Plus,
  Trash2,
  MessageSquare,
  Star,
  ChevronDown,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TriageBadge } from "@/components/TriageBadge";
import { triageFromApi } from "@/lib/apiMappings";
import { chatStatusLabel } from "./Children";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion(Box);

// Vista del portal del acudiente (token scope=portal): lista /portal/children y
// permite agregar (POST), editar (PATCH), eliminar (DELETE, baja lógica) y ver
// el historial de consultas de cada hijo (cruzando /portal/chats).
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

  // Tope de hijos según el plan (planMaxDependents de /portal/me). null = sin
  // tope conocido → no se bloquea.
  const { data: me } = useFetch<GuardianApi>(token ? "/portal/me" : null);
  const maxChildren = me?.planMaxDependents ?? null;
  const atLimit = maxChildren != null && children.length >= maxChildren;

  // Consultas del acudiente (solo lectura). Se cruzan con cada hijo por nombre
  // o id (el backend devuelve `patient` como string con el nombre del hijo).
  const { data: chatsData } = useFetch<PortalChatSummary[]>(
    token ? "/portal/chats" : null
  );
  const chats = useMemo(() => chatsData ?? [], [chatsData]);
  const chatsForChild = useCallback(
    (c: ChildApi) =>
      chats.filter((ch) => ch.patient === c.name || ch.patient === c.id),
    [chats]
  );

  // null = cerrado; { child: null } = agregar; { child } = editar.
  const [editing, setEditing] = useState<{ child: ChildApi | null } | null>(
    null
  );
  const [form, setForm] = useState<ChildForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  // Hijo cuyo historial de consultas se está viendo (modal de detalle).
  const [viewing, setViewing] = useState<ChildApi | null>(null);
  // Hijo pendiente de dar de baja (DELETE /portal/children/{id}).
  const [toDelete, setToDelete] = useState<ChildApi | null>(null);
  // Consulta expandida: se trae su detalle (mensajes) de /portal/chats/{sid}.
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [chatDetail, setChatDetail] = useState<PortalChatDetail | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const toggleChat = async (sid: string) => {
    if (openChatId === sid) {
      setOpenChatId(null);
      return;
    }
    setOpenChatId(sid);
    setChatDetail(null);
    setLoadingChat(true);
    try {
      const t = await getValidToken();
      const detail = await apiFetch<PortalChatDetail>(
        `/portal/chats/${sid}`,
        t
      );
      setChatDetail(detail);
    } catch {
      setChatDetail(null);
    } finally {
      setLoadingChat(false);
    }
  };

  // Al cerrar el modal de consultas se resetea la consulta expandida.
  const closeViewing = () => {
    setViewing(null);
    setOpenChatId(null);
    setChatDetail(null);
  };

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar tus hijos", { description: error });
    }
  }, [error]);

  const openAdd = () => {
    if (atLimit) {
      toast.error("Límite del plan alcanzado", {
        description: `Tu plan permite ${maxChildren} ${
          maxChildren === 1 ? "niño" : "niños"
        }. Para agregar más, mejora tu plan escribiéndonos por WhatsApp.`,
      });
      return;
    }
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
    if (isNew && atLimit) {
      toast.error("Límite del plan alcanzado", {
        description: `Tu plan permite ${maxChildren} ${
          maxChildren === 1 ? "niño" : "niños"
        }.`,
      });
      return;
    }

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
          <Flex justify="space-between" align="center" mb={4} gap={3} wrap="wrap">
            {maxChildren != null ? (
              <Text fontSize="sm" color="lucera.textMuted">
                {children.length} de {maxChildren}{" "}
                {maxChildren === 1 ? "niño" : "niños"} de tu plan
              </Text>
            ) : (
              <Box />
            )}
            <Button
              colorScheme="brand"
              leftIcon={<Plus size={16} />}
              onClick={openAdd}
              isDisabled={atLimit}
            >
              Agregar hijo
            </Button>
          </Flex>
          {atLimit && (
            <Text fontSize="xs" color="lucera.textMuted" mb={4}>
              Alcanzaste el límite de niños de tu plan. Para agregar más, mejora
              tu plan escribiéndonos por WhatsApp.
            </Text>
          )}

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
                            <HStack spacing={0.5}>
                              <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<MessageSquare size={13} />}
                                onClick={() => setViewing(n)}
                              >
                                {chatsForChild(n).length}
                              </Button>
                              <IconButton
                                aria-label="Editar hijo"
                                size="sm"
                                variant="ghost"
                                icon={<Pencil size={14} />}
                                onClick={() => openEdit(n)}
                              />
                              <IconButton
                                aria-label="Eliminar hijo"
                                size="sm"
                                variant="ghost"
                                color="danger.500"
                                icon={<Trash2 size={14} />}
                                onClick={() => setToDelete(n)}
                              />
                            </HStack>
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

      {/* Detalle del hijo + historial de consultas (solo lectura). */}
      <Modal
        isOpen={!!viewing}
        onClose={closeViewing}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Baby size={18} color="#f08159" />
              <Text>{viewing?.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {viewing && (
              <>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mb={4}>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Edad
                    </Text>
                    <Text fontWeight={600}>
                      {ageFromBirth(viewing.birthDate) != null
                        ? `${ageFromBirth(viewing.birthDate)} años`
                        : "—"}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Nacimiento
                    </Text>
                    <Text fontWeight={600}>{viewing.birthDate}</Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      color="lucera.textMuted"
                      letterSpacing="wider"
                    >
                      Peso
                    </Text>
                    <Text fontWeight={600}>
                      {viewing.weightKg ? `${viewing.weightKg} kg` : "—"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Divider mb={3} />
                <HStack mb={3} spacing={2}>
                  <MessageSquare size={15} color="#6c122b" />
                  <Text fontSize="sm" fontWeight={700}>
                    Historial de consultas ({chatsForChild(viewing).length})
                  </Text>
                </HStack>

                {chatsForChild(viewing).length === 0 ? (
                  <Text fontSize="sm" color="lucera.textMuted">
                    Este niño aún no tiene consultas registradas.
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    {chatsForChild(viewing).map((c) => {
                      const open = openChatId === c.id;
                      return (
                        <Box
                          key={c.id}
                          borderWidth="1px"
                          borderColor={open ? "brand.500" : "lucera.border"}
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Flex
                            as="button"
                            type="button"
                            onClick={() => toggleChat(c.id)}
                            w="100%"
                            textAlign="left"
                            justify="space-between"
                            align="center"
                            gap={2}
                            p={3}
                            _hover={{ bg: "cream.50" }}
                            transition="all 120ms"
                          >
                            <HStack spacing={2} flexWrap="wrap">
                              <TriageBadge
                                level={
                                  triageFromApi[
                                    c.triage as keyof typeof triageFromApi
                                  ]
                                }
                              />
                              <Badge
                                textTransform="capitalize"
                                variant="outline"
                              >
                                {chatStatusLabel[c.status] ?? c.status}
                              </Badge>
                              {c.rating != null && (
                                <HStack spacing={0.5}>
                                  <Star
                                    size={11}
                                    color="#f6ca35"
                                    fill="#f6ca35"
                                  />
                                  <Text fontSize="xs" fontWeight={600}>
                                    {c.rating}
                                  </Text>
                                </HStack>
                              )}
                            </HStack>
                            <HStack spacing={2} flexShrink={0}>
                              <Text
                                fontSize="xs"
                                color="lucera.textMuted"
                                sx={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                {c.startedAt}
                              </Text>
                              <Box
                                as={ChevronDown}
                                boxSize="16px"
                                color="lucera.textMuted"
                                transform={open ? "rotate(180deg)" : undefined}
                                transition="transform 150ms"
                              />
                            </HStack>
                          </Flex>

                          <Collapse in={open} animateOpacity>
                            <Box
                              px={3}
                              pb={3}
                              borderTopWidth="1px"
                              borderColor="lucera.borderSoft"
                            >
                              {c.aiSummary && (
                                <Text
                                  fontSize="sm"
                                  color="lucera.textMuted"
                                  mt={3}
                                >
                                  {c.aiSummary}
                                </Text>
                              )}
                              {loadingChat && open ? (
                                <HStack py={4} justify="center">
                                  <Spinner size="sm" color="brand.500" />
                                  <Text fontSize="sm" color="lucera.textMuted">
                                    Cargando conversación…
                                  </Text>
                                </HStack>
                              ) : chatDetail && chatDetail.id === c.id ? (
                                chatDetail.messages.length === 0 ? (
                                  <Text
                                    fontSize="sm"
                                    color="lucera.textMuted"
                                    mt={3}
                                  >
                                    Sin mensajes en esta consulta.
                                  </Text>
                                ) : (
                                  <VStack align="stretch" spacing={2} mt={3}>
                                    {chatDetail.messages.map((m, i) => {
                                      const mine = m.from === "guardian";
                                      return (
                                        <Flex
                                          key={i}
                                          justify={
                                            mine ? "flex-end" : "flex-start"
                                          }
                                        >
                                          <Box
                                            maxW="80%"
                                            bg={mine ? "brand.500" : "cream.100"}
                                            color={mine ? "white" : "lucera.text"}
                                            borderRadius="lg"
                                            px={3}
                                            py={2}
                                          >
                                            <Text
                                              fontSize="sm"
                                              whiteSpace="pre-wrap"
                                            >
                                              {m.text}
                                            </Text>
                                            <Text
                                              fontSize="10px"
                                              opacity={0.7}
                                              mt={1}
                                              textAlign="right"
                                            >
                                              {m.at}
                                            </Text>
                                          </Box>
                                        </Flex>
                                      );
                                    })}
                                  </VStack>
                                )
                              ) : null}
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar hijo"
        description={
          <>
            ¿Seguro que deseas eliminar a <strong>{toDelete?.name}</strong>?
            Dejará de aparecer en tus listados y en el selector de WhatsApp. Su
            historial de consultas se conserva.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const t = await getValidToken();
            await apiFetch(`/portal/children/${toDelete.id}`, t, {
              method: "DELETE",
            });
            toast.success("Hijo eliminado");
            refetch();
          } catch (err) {
            toast.error("No se pudo eliminar", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
