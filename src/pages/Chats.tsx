import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatSession } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import {
  triageFromApi,
  attentionFromApi,
  chatStatusFromApi,
  chatRoleFromApi,
  relationshipFromApi,
} from "@/lib/apiMappings";
import type {
  ChatApi,
  GuardianApi,
  PatientApi,
  InsuranceRef,
  UserApi,
} from "@/lib/apiTypes";
import { toast } from "@/lib/toast";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Input,
  InputGroup,
  Select,
  InputLeftElement,
  Text,
  Avatar,
  Badge,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  type BadgeProps,
} from "@chakra-ui/react";
import { StatCard } from "@/components/StatCard";
import {
  Search,
  Baby,
  Phone,
  Bot,
  Clock,
  Users as UsersIcon,
  Lock,
  ChevronDown,
  ExternalLink,
  Pencil,
  Plus,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { TriageBadge } from "@/components/TriageBadge";
import { LoadingState } from "@/components/LoadingState";
import { GuardianEditModal } from "@/components/GuardianEditModal";
import { PatientEditModal } from "@/components/PatientEditModal";
import { ChatNoteModal } from "@/components/ChatNoteModal";

const triageColors: Record<ChatApi["triage"], string> = {
  general: "#2f9e6b",
  urgent: "#f6ca35",
  emergency: "#b91c1c",
};

const statusTone: Record<ChatSession["status"], BadgeProps["colorScheme"]> = {
  activa: "green",
  esperando: "yellow",
  cerrada: "gray",
};

// Etiqueta compacta para cada grupo de filtros.
function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      fontSize="10px"
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="wider"
      color="lucera.textMuted"
      mb={2}
    >
      {children}
    </Text>
  );
}

// Pastilla (pill) de filtro reutilizable, con color activo configurable.
function FilterPill({
  active,
  activeColor,
  onClick,
  children,
}: {
  active: boolean;
  activeColor: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      px={3}
      py={1.5}
      borderRadius="full"
      fontSize="xs"
      fontWeight={600}
      borderWidth="1px"
      whiteSpace="nowrap"
      bg={active ? activeColor : "white"}
      borderColor={active ? activeColor : "lucera.border"}
      color={active ? "white" : "lucera.textMuted"}
      _hover={
        active ? undefined : { bg: "cream.50", borderColor: "lucera.textMuted" }
      }
      transition="all 120ms"
    >
      {children}
    </Box>
  );
}

function chatApiToSession(c: ChatApi): ChatSession {
  return {
    id: c.id,
    guardian: c.guardian,
    patient: c.patient,
    phone: c.phone,
    triage: triageFromApi[c.triage],
    attentionType: attentionFromApi[c.attentionType] ?? "Virtual",
    aiSummary: c.aiSummary ?? undefined,
    rating: c.rating ?? undefined,
    lastMessage: c.lastMessage,
    time: c.time,
    startedAt: c.startedAt,
    closedAt: c.closedAt ?? undefined,
    messages: c.messages.map((m) => ({
      role: chatRoleFromApi[m.role] ?? "sistema",
      text: m.text,
      time: m.time,
      alerts: m.alerts,
    })),
    status: chatStatusFromApi[c.status] ?? "cerrada",
    derivation: c.derivation,
  };
}

function InfoSection({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box mb={5}>
      <HStack spacing={2} mb={2} justify="space-between">
        <HStack spacing={2}>
          <Icon size={14} color="#6c122b" />
          <Text
            fontSize="10px"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing="wider"
            color="lucera.textMuted"
          >
            {title}
          </Text>
        </HStack>
        {action}
      </HStack>
      <VStack align="stretch" spacing={1.5}>
        {children}
      </VStack>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <HStack justify="space-between" fontSize="xs" align="flex-start">
      <Text color="lucera.textMuted" flexShrink={0}>
        {label}
      </Text>
      <Box fontWeight={600} textAlign="right">
        {value}
      </Box>
    </HStack>
  );
}

// ⚠️ Endpoint pesado: trae todos los mensajes de cada chat en una sola llamada.
//
// ⚠️ Nota de seguridad: para el rol Acudiente, este componente filtra sus
// propios chats SOLO en el navegador (busca su registro en /api/guardians
// por email y compara teléfono). El access_token de este login sigue
// teniendo acceso completo a /api/chats, /api/guardians y /api/patients —
// el backend no aplica scoping por acudiente en esta ruta de login (eso
// solo existe en los endpoints separados /portal/* con un token scope=portal).
// Si se necesita aislamiento real, el acudiente debería entrar por
// /auth/guardian/login + /portal/chats en vez de esta pantalla.
export default function Chats() {
  const { token, user } = useAuth();
  const isGuardianRole = user?.role === "Acudiente";
  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
    refetch: refetchChats,
  } = useFetchAll<ChatApi>(token ? "/api/chats" : null);
  const { data: guardiansData, refetch: refetchGuardians } =
    useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const { data: patientsData, refetch: refetchPatients } =
    useFetchAll<PatientApi>(token ? "/api/patients" : null);
  const { data: insurancesData } = useFetchAll<InsuranceRef>(
    token ? "/api/insurances" : null
  );

  // Modales de edición embebidos en la propia vista de Chats.
  const [editingGuardian, setEditingGuardian] = useState<GuardianApi | null>(
    null
  );
  const [editingPatient, setEditingPatient] = useState<PatientApi | null>(null);
  // Chat al que se le va a agregar/editar el comentario final del médico.
  const [noteChat, setNoteChat] = useState<ChatApi | null>(null);
  // Admin y Médico pueden dejar el comentario final del chat.
  const canReview = user?.role === "Admin" || user?.role === "Médico";

  // Staff del panel, para mostrar el NOMBRE de quien revisó (reviewedBy trae el
  // id). Solo lo cargan admin/médico (los que ven el comentario).
  const { data: usersData } = useFetchAll<UserApi>(
    token && canReview ? "/api/users" : null
  );
  const reviewerName = useMemo(() => {
    const byId = new Map<string, string>();
    (usersData?.items ?? []).forEach((u) => byId.set(u.id, u.name));
    if (user?.id && user?.name) byId.set(user.id, user.name);
    if (user?.refId && user?.name) byId.set(user.refId, user.name);
    return (id?: string | null) => (id ? byId.get(id) ?? id : "—");
  }, [usersData, user?.id, user?.name, user?.refId]);

  // Tras editar un acudiente/niño se recargan TODOS los datos (acudientes,
  // pacientes y chats) para reflejar los cambios. El chat abierto se conserva:
  // selectedId vive en el estado y useFetchAll no borra la data durante el
  // refetch, así que se vuelve a mostrar automáticamente.
  const reloadAfterEdit = () => {
    refetchGuardians();
    refetchPatients();
    refetchChats();
  };

  const ownGuardian = useMemo(() => {
    if (!isGuardianRole) return undefined;
    return (guardiansData?.items ?? []).find((g) => g.email === user?.email);
  }, [isGuardianRole, guardiansData, user?.email]);

  const rawChats = useMemo(() => {
    const items = chatsData?.items ?? [];
    if (!isGuardianRole) return items;
    if (!ownGuardian) return [];
    return items.filter((c) => c.phone === ownGuardian.phone);
  }, [chatsData, isGuardianRole, ownGuardian]);
  const chats = useMemo(() => rawChats.map(chatApiToSession), [rawChats]);

  const guardianByPhone = useMemo(() => {
    const map = new Map<string, GuardianApi>();
    (guardiansData?.items ?? []).forEach((g) => map.set(g.phone, g));
    return map;
  }, [guardiansData]);

  const patientByKey = useMemo(() => {
    const map = new Map<string, PatientApi>();
    (patientsData?.items ?? []).forEach((p) =>
      map.set(`${p.phone}__${p.name}`, p)
    );
    return map;
  }, [patientsData]);

  useEffect(() => {
    if (chatsError) {
      toast.error("No se pudieron cargar los chats", {
        description: chatsError,
      });
    }
  }, [chatsError]);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Deep-link: al llegar con ?chat=<id> (p. ej. desde el detalle de un
  // acudiente), se preselecciona ese chat una vez cargada la lista.
  useEffect(() => {
    const chatId = searchParams.get("chat");
    if (!chatId) return;
    if (rawChats.some((c) => c.id === chatId)) {
      setSelectedId(chatId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, rawChats, setSearchParams]);
  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tab, setTab] = useState<"todas" | "activas" | "cerradas">("todas");
  // Filtro por disposición del paciente (mutuamente excluyente): urgencias
  // (triaje emergencia) → derivación (presencial) → casa (virtual).
  const [disposition, setDisposition] = useState<
    "todas" | "urgencias" | "casa" | "derivacion"
  >("todas");
  // El chat no trae aseguradora; se resuelve por el acudiente (vía teléfono).
  const [insuranceFilter, setInsuranceFilter] = useState("todas");

  const insuranceOf = (c: ChatSession): string | null =>
    guardianByPhone.get(c.phone)?.insurance?.name ?? null;

  // Opciones del filtro: catálogo completo de aseguradoras (/api/insurances),
  // no solo las presentes en los chats.
  const insuranceOptions = useMemo(
    () => (insurancesData?.items ?? []).map((i) => i.name).sort(),
    [insurancesData]
  );

  const dispositionOf = (c: ChatSession): "urgencias" | "casa" | "derivacion" =>
    c.derivation === "emergency"
      ? "urgencias"
      : c.derivation === "appointment"
      ? "derivacion"
      : "casa";

  // Búsqueda + rango de fechas (sobre c.startedAt), sin la pestaña todavía —
  // así los 3 contadores (total/activas/cerradas) reflejan el desglose real
  // dentro del filtro, sin importar qué pestaña esté seleccionada.
  const searchAndDateFiltered = chats.filter((c) => {
    const okQ = `${c.guardian} ${c.patient} ${c.phone}`
      .toLowerCase()
      .includes(q.toLowerCase());
    const date = c.startedAt.slice(0, 10);
    const okStartDate = !startDate || date >= startDate;
    const okEndDate = !endDate || date <= endDate;
    const okInsurance =
      insuranceFilter === "todas"
        ? true
        : insuranceFilter === "sin_seguro"
        ? !insuranceOf(c)
        : insuranceOf(c) === insuranceFilter;
    return okQ && okStartDate && okEndDate && okInsurance;
  });

  const counts = {
    total: searchAndDateFiltered.length,
    activas: searchAndDateFiltered.filter((c) => c.status !== "cerrada").length,
    cerradas: searchAndDateFiltered.filter((c) => c.status === "cerrada")
      .length,
  };

  const dispositionCounts = {
    urgencias: searchAndDateFiltered.filter(
      (c) => dispositionOf(c) === "urgencias"
    ).length,
    casa: searchAndDateFiltered.filter((c) => dispositionOf(c) === "casa")
      .length,
    derivacion: searchAndDateFiltered.filter(
      (c) => dispositionOf(c) === "derivacion"
    ).length,
  };

  const filtered = searchAndDateFiltered.filter((c) => {
    const okTab =
      tab === "todas" ||
      (tab === "activas" ? c.status !== "cerrada" : c.status === "cerrada");
    const okDisposition =
      disposition === "todas" || dispositionOf(c) === disposition;
    return okTab && okDisposition;
  });

  const selected = chats.find((c) => c.id === selectedId) ?? null;
  const selectedRaw = rawChats.find((c) => c.id === selectedId) ?? null;
  const selectedGuardian = selectedRaw
    ? guardianByPhone.get(selectedRaw.phone)
    : undefined;
  const selectedPatient = selectedRaw
    ? patientByKey.get(`${selectedRaw.phone}__${selectedRaw.patient}`)
    : undefined;

  return (
    <DashboardLayout
      title={isGuardianRole ? "Mis consultas" : "Monitoreo de chats"}
      subtitle={
        isGuardianRole
          ? "Tus conversaciones de WhatsApp con Lucera IA"
          : "Conversaciones de WhatsApp"
      }
    >
      <StatCard mb={4}>
        {/* Búsqueda + rango de fechas */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align={{ md: "flex-end" }}
        >
          <Box flex={1} minW={{ md: "240px" }}>
            <FilterLabel>Buscar</FilterLabel>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Search size={14} />
              </InputLeftElement>
              <Input
                placeholder="Acudiente, paciente o teléfono…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
          </Box>
          <HStack spacing={3} align="flex-end">
            <Box>
              <FilterLabel>Desde</FilterLabel>
              <Input
                type="date"
                size="sm"
                w={{ base: "100%", md: "150px" }}
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Box>
            <Box>
              <FilterLabel>Hasta</FilterLabel>
              <Input
                type="date"
                size="sm"
                w={{ base: "100%", md: "150px" }}
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Box>
            <Box>
              <FilterLabel>Aseguradora</FilterLabel>
              <Select
                size="sm"
                w={{ base: "100%", md: "180px" }}
                value={insuranceFilter}
                onChange={(e) => setInsuranceFilter(e.target.value)}
              >
                <option value="todas">Todas las aseguradoras</option>
                {insuranceOptions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
                <option value="sin_seguro">Sin seguro</option>
              </Select>
            </Box>
          </HStack>
        </Flex>

        <Divider my={4} borderColor="lucera.borderSoft" />

        {/* Filtros por estado y clasificación */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 10 }}
          wrap="wrap"
        >
          <Box>
            <FilterLabel>Estado</FilterLabel>
            <HStack spacing={2} wrap="wrap">
              {(
                [
                  { key: "todas", label: "Todas", count: counts.total },
                  { key: "activas", label: "Activas", count: counts.activas },
                  {
                    key: "cerradas",
                    label: "Cerradas",
                    count: counts.cerradas,
                  },
                ] as const
              ).map((t) => (
                <FilterPill
                  key={t.key}
                  active={tab === t.key}
                  activeColor="success.500"
                  onClick={() => setTab(t.key)}
                >
                  {t.label} ({t.count})
                </FilterPill>
              ))}
            </HStack>
          </Box>

          <Box>
            <FilterLabel>Clasificación</FilterLabel>
            <HStack spacing={2} wrap="wrap">
              {(
                [
                  { key: "todas", label: "Todas" },
                  {
                    key: "urgencias",
                    label: "Urgencias",
                    count: dispositionCounts.urgencias,
                  },
                  {
                    key: "casa",
                    label: "Casa",
                    count: dispositionCounts.casa,
                  },
                  {
                    key: "derivacion",
                    label: "Derivación",
                    count: dispositionCounts.derivacion,
                  },
                ] as const
              ).map((d) => (
                <FilterPill
                  key={d.key}
                  active={disposition === d.key}
                  activeColor="brand.500"
                  onClick={() => setDisposition(d.key)}
                >
                  {d.label}
                  {"count" in d ? ` (${d.count})` : ""}
                </FilterPill>
              ))}
            </HStack>
          </Box>
        </Flex>
      </StatCard>
      <Flex
        direction={{ base: "column", lg: "row" }}
        h={{ base: "auto", lg: "calc(100vh - 220px)" }}
        minH={{ lg: "600px" }}
        borderWidth="1px"
        borderColor="lucera.border"
        borderRadius="xl"
        overflow="hidden"
        bg="lucera.surface"
      >
        {/* Columna izquierda: lista de chats */}
        <Flex
          direction="column"
          w={{ base: "100%", lg: "300px" }}
          flexShrink={0}
          borderRightWidth={{ base: 0, lg: "1px" }}
          borderBottomWidth={{ base: "1px", lg: 0 }}
          borderColor="lucera.border"
          maxH={{ base: "360px", lg: "none" }}
        >
          <VStack align="stretch" spacing={0} overflowY="auto" flex={1}>
            {chatsLoading && !chatsData ? (
              <LoadingState label="Cargando chats…" />
            ) : (
              filtered.map((c) => {
                const raw = rawChats.find((r) => r.id === c.id);
                const active = c.id === selectedId;
                return (
                  <Box
                    key={c.id}
                    as="button"
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    textAlign="left"
                    p={3}
                    borderBottomWidth="1px"
                    borderColor="lucera.borderSoft"
                    bg={active ? "cream.100" : "white"}
                    _hover={{ bg: "cream.50" }}
                  >
                    <HStack justify="space-between" align="flex-start" mb={1}>
                      <HStack spacing={2} minW={0}>
                        <Avatar
                          size="sm"
                          name={c.guardian}
                          bg="brand.500"
                          color="white"
                        />
                        <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                          {c.guardian}
                        </Text>
                      </HStack>
                      <VStack spacing={1} align="flex-end" flexShrink={0}>
                        <Text fontSize="10px" color="lucera.textMuted">
                          {c.time}
                        </Text>
                        <Box
                          h="8px"
                          w="8px"
                          borderRadius="full"
                          bg={raw ? triageColors[raw.triage] : "gray.300"}
                        />
                      </VStack>
                    </HStack>
                    <HStack
                      fontSize="xs"
                      color="lucera.textMuted"
                      spacing={1}
                      mb={1.5}
                    >
                      <Baby size={11} />
                      <Text noOfLines={1}>
                        {c.patient} · {c.lastMessage}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Badge
                        fontSize="10px"
                        colorScheme={statusTone[c.status]}
                        textTransform="capitalize"
                      >
                        {c.status}
                      </Badge>
                      <Text fontSize="10px" color="lucera.textMuted">
                        {c.messages.length} msj
                      </Text>
                    </HStack>
                  </Box>
                );
              })
            )}
            {!chatsLoading && filtered.length === 0 && (
              <Text
                p={4}
                fontSize="sm"
                color="lucera.textMuted"
                textAlign="center"
              >
                {isGuardianRole && !ownGuardian
                  ? "No encontramos tu cuenta de acudiente con este correo."
                  : "No hay chats que coincidan."}
              </Text>
            )}
          </VStack>
        </Flex>

        {/* Columna central: conversación */}
        <Flex direction="column" flex={1} minW={0} bg="cream.50">
          {selected ? (
            <>
              <Flex
                p={4}
                borderBottomWidth="1px"
                borderColor="lucera.border"
                bg="white"
                align="center"
                justify="space-between"
              >
                <HStack spacing={3} minW={0}>
                  <Avatar
                    size="sm"
                    name={selected.guardian}
                    bg="brand.500"
                    color="white"
                  />
                  <Box minW={0}>
                    {isGuardianRole ? (
                      <Text fontWeight={700} fontSize="sm" noOfLines={1}>
                        {selected.guardian}
                      </Text>
                    ) : (
                      <Menu placement="bottom-start">
                        <MenuButton
                          as="button"
                          type="button"
                          style={{ textAlign: "left" }}
                        >
                          <HStack spacing={1} minW={0}>
                            <Text
                              fontWeight={700}
                              fontSize="sm"
                              noOfLines={1}
                              _hover={{ color: "brand.500" }}
                            >
                              {selected.guardian}
                            </Text>
                            <ChevronDown size={14} />
                          </HStack>
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            icon={<ExternalLink size={14} />}
                            onClick={() => navigate("/guardians")}
                          >
                            Ver cuenta del acudiente
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                    <HStack fontSize="xs" color="lucera.textMuted" spacing={1}>
                      <Phone size={10} />
                      <Text noOfLines={1}>
                        {selected.phone} · {selected.patient} ·{" "}
                        {selected.status}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
                <TriageBadge level={selected.triage} />
              </Flex>

              <Box flex={1} overflowY="auto" p={4}>
                <VStack spacing={3} maxW="2xl" mx="auto" align="stretch">
                  {selected.messages.map((m, i) => {
                    const isUser = m.role === "acudiente";
                    return (
                      <Flex
                        key={i}
                        justify={isUser ? "flex-end" : "flex-start"}
                      >
                        <Box
                          maxW="75%"
                          px={4}
                          py={2.5}
                          borderRadius="2xl"
                          boxShadow="sm"
                          fontSize="sm"
                          bg={isUser ? "success.500" : "white"}
                          color={isUser ? "white" : "lucera.text"}
                          borderWidth={!isUser ? "1px" : 0}
                          borderColor="lucera.border"
                          borderBottomRightRadius={isUser ? "sm" : "2xl"}
                          borderBottomLeftRadius={!isUser ? "sm" : "2xl"}
                        >
                          <Text>{m.text}</Text>
                          <Text
                            fontSize="10px"
                            mt={1}
                            opacity={0.7}
                            sx={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {m.time}
                          </Text>
                        </Box>
                      </Flex>
                    );
                  })}
                </VStack>
              </Box>

              <HStack
                justify="center"
                p={3}
                borderTopWidth="1px"
                borderColor="lucera.border"
                bg="white"
                fontSize="xs"
                color="lucera.textMuted"
                spacing={2}
              >
                <Lock size={12} />
                <Text>
                  Vista de monitoreo en solo lectura. Las respuestas las
                  gestiona Lucera IA por WhatsApp.
                </Text>
              </HStack>
            </>
          ) : (
            <Flex
              flex={1}
              align="center"
              justify="center"
              color="lucera.textMuted"
              fontSize="sm"
            >
              Selecciona un chat para ver el detalle.
            </Flex>
          )}
        </Flex>

        {/* Columna derecha: información del chat */}
        {selected && (
          <Box
            w={{ base: "100%", lg: "280px" }}
            flexShrink={0}
            borderLeftWidth={{ base: 0, lg: "1px" }}
            borderTopWidth={{ base: "1px", lg: 0 }}
            borderColor="lucera.border"
            overflowY="auto"
            bg="white"
            p={4}
          >
            <InfoSection icon={Clock} title="Sesión">
              <InfoRow
                label="Estado"
                value={
                  <Badge
                    colorScheme={statusTone[selected.status]}
                    textTransform="capitalize"
                  >
                    {selected.status}
                  </Badge>
                }
              />
              <InfoRow
                label="Clasificación"
                value={<TriageBadge level={selected.triage} />}
              />
              <InfoRow
                label="Tipo de atención"
                value={selected.attentionType}
              />
              <InfoRow label="Abierta" value={selected.startedAt} />
              <InfoRow label="Actualizada" value={selected.time} />
              <InfoRow label="Cerrada" value={selected.closedAt ?? "—"} />
            </InfoSection>

            <InfoSection
              icon={UsersIcon}
              title="Acudiente"
              action={
                user?.role === "Admin" && selectedGuardian ? (
                  <IconButton
                    aria-label="Editar acudiente"
                    icon={<Pencil size={13} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setEditingGuardian(selectedGuardian)}
                  />
                ) : undefined
              }
            >
              <InfoRow label="Nombre" value={selected.guardian} />
              <InfoRow label="Teléfono" value={selected.phone} />
              <InfoRow
                label="Relación"
                value={
                  selectedGuardian
                    ? relationshipFromApi[selectedGuardian.relationship]
                    : "—"
                }
              />
              <InfoRow label="Ciudad" value={selectedGuardian?.city ?? "—"} />
            </InfoSection>

            <InfoSection
              icon={Baby}
              title="Paciente"
              action={
                user?.role === "Admin" && selectedPatient ? (
                  <IconButton
                    aria-label="Editar niño"
                    icon={<Pencil size={13} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setEditingPatient(selectedPatient)}
                  />
                ) : undefined
              }
            >
              <InfoRow label="Nombre" value={selected.patient} />
              <InfoRow
                label="Edad"
                value={selectedPatient ? `${selectedPatient.age} años` : "—"}
              />
              <InfoRow
                label="Nacimiento"
                value={selectedPatient?.birthDate ?? "—"}
              />
              <InfoRow
                label="Peso"
                value={
                  selectedPatient?.weightKg
                    ? `${selectedPatient.weightKg} kg`
                    : "—"
                }
              />
              <InfoRow
                label="Alergias"
                value={
                  selectedPatient?.allergies?.length
                    ? selectedPatient.allergies.join(", ")
                    : "Ninguna"
                }
              />
            </InfoSection>

            {/* Comentario final del médico/admin */}
            {canReview && selectedRaw && (
              <InfoSection
                icon={FileText}
                title="Comentario final"
                action={
                  selectedRaw.doctorNote ? (
                    <IconButton
                      aria-label="Editar comentario"
                      icon={<Pencil size={13} />}
                      size="xs"
                      variant="ghost"
                      onClick={() => setNoteChat(selectedRaw)}
                    />
                  ) : undefined
                }
              >
                {selectedRaw.doctorNote ? (
                  <Box>
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {selectedRaw.doctorNote}
                    </Text>
                    <Text fontSize="10px" color="lucera.textMuted" mt={1.5}>
                      Revisado por {reviewerName(selectedRaw.reviewedBy)}
                      {selectedRaw.reviewedAt
                        ? ` · ${selectedRaw.reviewedAt}`
                        : ""}
                    </Text>
                  </Box>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="brand"
                    leftIcon={<Plus size={14} />}
                    onClick={() => setNoteChat(selectedRaw)}
                  >
                    Agregar comentario
                  </Button>
                )}
              </InfoSection>
            )}

            {selected.aiSummary && (
              <InfoSection icon={Bot} title="Resumen IA">
                <Text fontSize="xs" color="lucera.textMuted">
                  {selected.aiSummary}
                </Text>
              </InfoSection>
            )}
          </Box>
        )}
      </Flex>

      <GuardianEditModal
        guardian={editingGuardian}
        onClose={() => setEditingGuardian(null)}
        onSaved={reloadAfterEdit}
      />
      <PatientEditModal
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onSaved={reloadAfterEdit}
      />
      <ChatNoteModal
        chat={noteChat}
        onClose={() => setNoteChat(null)}
        onSaved={refetchChats}
        user={user}
      />
    </DashboardLayout>
  );
}
