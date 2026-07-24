import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatSession } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import {
  chatTriageToLevel,
  chatAttentionToEs,
  chatStatusToEstado,
  chatRoleToEs,
  relationToEs,
} from "@/lib/apiMappings";
import type { ChatApi, GuardianApi, PatientApi } from "@/lib/apiTypes";
import { toast } from "@/lib/toast";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  type BadgeProps,
} from "@chakra-ui/react";
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
  type LucideIcon,
} from "lucide-react";
import { TriageBadge } from "@/components/TriageBadge";
import { LoadingState } from "@/components/LoadingState";

const triageColors: Record<ChatApi["triage"], string> = {
  general: "#2f9e6b",
  urgent: "#f8cc37",
  emergency: "#b91c1c",
};

const statusTone: Record<ChatSession["status"], BadgeProps["colorScheme"]> = {
  activa: "green",
  esperando: "yellow",
  cerrada: "gray",
};

function chatApiToSession(c: ChatApi): ChatSession {
  return {
    id: c.id,
    guardian: c.guardian,
    patient: c.patient,
    phone: c.phone,
    triage: chatTriageToLevel[c.triage],
    attentionType: chatAttentionToEs[c.attentionType] ?? "Virtual",
    aiSummary: c.aiSummary ?? undefined,
    rating: c.rating ?? undefined,
    lastMessage: c.lastMessage,
    time: c.time,
    startedAt: c.startedAt,
    closedAt: c.closedAt ?? undefined,
    messages: c.messages.map((m) => ({
      role: chatRoleToEs[m.role] ?? "sistema",
      text: m.text,
      time: m.time,
      alerts: m.alerts,
    })),
    status: chatStatusToEstado[c.status] ?? "cerrada",
  };
}

function InfoSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <Box mb={5}>
      <HStack spacing={2} mb={2}>
        <Icon size={14} color="#6d122b" />
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
  } = useFetchAll<ChatApi>(token ? "/api/chats" : null);
  const { data: guardiansData } = useFetchAll<GuardianApi>(
    token ? "/api/guardians" : null
  );
  const { data: patientsData } = useFetchAll<PatientApi>(
    token ? "/api/patients" : null
  );

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

  const dispositionOf = (c: ChatSession): "urgencias" | "casa" | "derivacion" =>
    c.triage === "emergencia"
      ? "urgencias"
      : c.attentionType === "Presencial"
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
    return okQ && okStartDate && okEndDate;
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
      <Flex
        direction={"column"}
        gap={3}
        mb={4}
        align={{ md: "start" }}
        wrap="wrap"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={1}
          align={"start"}
          justify={"start"}
        >
          <Box flex={1} minW={{ md: "320px" }}>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Buscar
            </Text>
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
          <HStack
            spacing={2}
            flexDir={"row"}
            alignItems={"flex-start"}
            flexWrap={"wrap"}
          >
            <Box flex={1}>
              <Text
                fontSize="xs"
                fontWeight={600}
                mb={1}
                color="lucera.textMuted"
              >
                Desde
              </Text>
              <Input
                type="date"
                size="sm"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Box>
            <Box flex={1}>
              <Text
                fontSize="xs"
                fontWeight={600}
                mb={1}
                color="lucera.textMuted"
              >
                Hasta
              </Text>
              <Input
                type="date"
                size="sm"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Box>
          </HStack>
        </Flex>
        <Flex direction={"column"} gap={1} align={{ md: "start" }}>
          <Text fontSize="xs" fontWeight={600}>
            Por estado
          </Text>
          <HStack spacing={1} wrap="wrap">
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
              <Box
                key={t.key}
                as="button"
                type="button"
                onClick={() => setTab(t.key)}
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight={600}
                bg={tab === t.key ? "exito.500" : "crema.100"}
                color={tab === t.key ? "white" : "lucera.textMuted"}
                transition="all 120ms"
              >
                {t.label} ({t.count})
              </Box>
            ))}
          </HStack>
        </Flex>
        <Flex direction={"column"} gap={1} align={{ md: "start" }}>
          <Text fontSize="xs" fontWeight={600}>
            Por clasificación
          </Text>
          <HStack spacing={1} wrap="wrap">
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
              <Box
                key={d.key}
                as="button"
                type="button"
                onClick={() => setDisposition(d.key)}
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight={600}
                bg={disposition === d.key ? "vino.500" : "crema.100"}
                color={disposition === d.key ? "white" : "lucera.textMuted"}
                transition="all 120ms"
              >
                {d.label}
                {"count" in d ? ` (${d.count})` : ""}
              </Box>
            ))}
          </HStack>
        </Flex>
      </Flex>
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
                    bg={active ? "crema.100" : "white"}
                    _hover={{ bg: "crema.50" }}
                  >
                    <HStack justify="space-between" align="flex-start" mb={1}>
                      <HStack spacing={2} minW={0}>
                        <Avatar
                          size="sm"
                          name={c.guardian}
                          bg="vino.500"
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
        <Flex direction="column" flex={1} minW={0} bg="crema.50">
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
                    bg="vino.500"
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
                              _hover={{ color: "vino.500" }}
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
                          bg={isUser ? "exito.500" : "white"}
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

            <InfoSection icon={UsersIcon} title="Acudiente">
              <InfoRow label="Nombre" value={selected.guardian} />
              <InfoRow label="Teléfono" value={selected.phone} />
              <InfoRow
                label="Relación"
                value={
                  selectedGuardian
                    ? relationToEs[selectedGuardian.relationship]
                    : "—"
                }
              />
              <InfoRow label="Ciudad" value={selectedGuardian?.city ?? "—"} />
            </InfoSection>

            <InfoSection icon={Baby} title="Paciente">
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
    </DashboardLayout>
  );
}
