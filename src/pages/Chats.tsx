import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { chats, ChatSesion } from "@/lib/mockData";
import {
  Box,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  VStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Button,
} from "@chakra-ui/react";
import {
  Search,
  Phone,
  Bot,
  User,
  Stethoscope,
  Lock,
  Eye,
  ArrowLeft,
  FileDown,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { TriageBadge } from "@/components/TriageBadge";

const estadoTone = (e: ChatSesion["estado"]) =>
  e === "activa" ? "green" : e === "esperando" ? "yellow" : "gray";

export default function Chats() {
  const [selected, setSelected] = useState<ChatSesion | null>(null);
  const [q, setQ] = useState("");
  const [filterTriaje, setFilterTriaje] = useState("todos");

  const filtered = chats.filter((c) => {
    const okQ = `${c.paciente} ${c.telefono} ${c.id}`
      .toLowerCase()
      .includes(q.toLowerCase());
    const okT = filterTriaje === "todos" || c.triaje === filterTriaje;
    return okQ && okT;
  });

  // Vista detalle
  if (selected) {
    return (
      <DashboardLayout
        title="Detalle de conversación"
        subtitle={`${selected.paciente} · ${selected.id}`}
      >
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          mb={4}
          onClick={() => setSelected(null)}
        >
          Volver a la lista
        </Button>

        <Flex
          direction="column"
          bg="lucera.surface"
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="xl"
          overflow="hidden"
          h={{ base: "auto", lg: "calc(100vh - 280px)" }}
          minH={{ lg: "500px" }}
        >
          {/* Header */}
          <Flex
            p={4}
            borderBottomWidth="1px"
            borderColor="lucera.border"
            justify="space-between"
            align="center"
          >
            <HStack spacing={3} minW={0}>
              <Flex
                h={10}
                w={10}
                borderRadius="full"
                bg="naranja.50"
                align="center"
                justify="center"
              >
                <User size={18} color="#ef7d54" />
              </Flex>
              <Box minW={0}>
                <Text fontWeight={700} fontSize="sm" noOfLines={1}>
                  {selected.paciente}
                </Text>
                <HStack fontSize="xs" color="lucera.textMuted">
                  <Phone size={10} />
                  <Text>
                    {selected.telefono} · {selected.acudiente}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <HStack>
              <TriageBadge level={selected.triaje} />
              <Badge
                colorScheme={estadoTone(selected.estado)}
                textTransform="capitalize"
              >
                {selected.estado}
              </Badge>
            </HStack>
          </Flex>

          {/* Mensajes */}
          <Box flex={1} overflowY="auto" p={4} bg="crema.50">
            <VStack spacing={3} maxW="2xl" mx="auto" align="stretch">
              {selected.mensajes.map((m, i) => {
                const isUser = m.rol === "acudiente";
                const isBot = m.rol === "bot";
                return (
                  <Flex
                    key={i}
                    gap={2}
                    justify={isUser ? "flex-end" : "flex-start"}
                  >
                    {!isUser && (
                      <Flex
                        h={7}
                        w={7}
                        borderRadius="full"
                        align="center"
                        justify="center"
                        flexShrink={0}
                        bg={isBot ? "vino.50" : "naranja.50"}
                        color={isBot ? "vino.500" : "naranja.500"}
                      >
                        {isBot ? <Bot size={14} /> : <Stethoscope size={14} />}
                      </Flex>
                    )}
                    <Box
                      maxW="75%"
                      px={4}
                      py={2.5}
                      borderRadius="2xl"
                      boxShadow="sm"
                      fontSize="sm"
                      bg={isUser ? "vino.500" : isBot ? "white" : "naranja.500"}
                      color={
                        isUser || (!isUser && !isBot) ? "white" : "lucera.text"
                      }
                      borderWidth={isBot ? "1px" : 0}
                      borderColor="lucera.border"
                      borderBottomRightRadius={isUser ? "sm" : "2xl"}
                      borderBottomLeftRadius={!isUser ? "sm" : "2xl"}
                    >
                      {!isUser && (
                        <Text
                          fontSize="10px"
                          fontWeight={700}
                          textTransform="uppercase"
                          letterSpacing="wider"
                          mb={1}
                          opacity={0.7}
                        >
                          {isBot ? "Lucera IA" : "Sistema"}
                        </Text>
                      )}
                      <Text>{m.texto}</Text>
                      <Text
                        fontSize="10px"
                        mt={1}
                        opacity={0.7}
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {m.hora}
                      </Text>
                    </Box>
                  </Flex>
                );
              })}
            </VStack>
          </Box>

          {/* Footer */}
          <HStack
            justify="center"
            p={3}
            borderTopWidth="1px"
            borderColor="lucera.border"
            bg="crema.50"
            fontSize="xs"
            color="lucera.textMuted"
            spacing={2}
          >
            <Lock size={12} />
            <Text>
              Vista de monitoreo en solo lectura. Las respuestas las gestiona
              Lucera IA por WhatsApp.
            </Text>
          </HStack>
        </Flex>
      </DashboardLayout>
    );
  }

  // Vista tabla
  return (
    <DashboardLayout
      title="Monitoreo de chats"
      subtitle="Conversaciones de WhatsApp"
    >
      <StatCard>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          mb={4}
          align={{ md: "center" }}
        >
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <Search size={16} />
            </InputLeftElement>
            <Input
              placeholder="Buscar por paciente o teléfono…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <Select
            w={{ base: "100%", md: "240px" }}
            value={filterTriaje}
            onChange={(e) => setFilterTriaje(e.target.value)}
          >
            <option value="todos">Todos los triajes</option>
            <option value="emergencia">🔴 Emergencia</option>
            <option value="urgente">🟡 Urgente</option>
            <option value="general">🟢 General</option>
          </Select>
        </Flex>

        <TableContainer
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="md"
        >
          <Table size="sm">
            <Thead bg="crema.100">
              <Tr>
                <Th>Paciente</Th>
                <Th display={{ base: "none", md: "table-cell" }}>
                  Descripción
                </Th>
                <Th>Categoría</Th>
                <Th>Estado</Th>
                <Th textAlign="center">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((c) => (
                <Tr key={c.id} _hover={{ bg: "crema.50" }}>
                  <Td>
                    <Text fontSize="sm" fontWeight={600}>
                      {c.paciente}
                    </Text>
                    <Text fontSize="xs" color="lucera.textMuted">
                      {c.acudiente}
                    </Text>
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }}>
                    <Text fontSize="xs" color="lucera.textMuted" noOfLines={2}>
                      {c.resumenIA ?? c.ultimoMensaje}
                    </Text>
                  </Td>
                  <Td>
                    <TriageBadge level={c.triaje} />
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={estadoTone(c.estado)}
                      textTransform="capitalize"
                    >
                      {c.estado}
                    </Badge>
                  </Td>
                  <Td textAlign="center">
                    <IconButton
                      aria-label="Ver detalle"
                      size="sm"
                      variant="ghost"
                      icon={<Eye size={16} />}
                      onClick={() => setSelected(c)}
                    />
                    {c.estado === "cerrada" && (
                      <IconButton
                        aria-label="Ver reporte"
                        size="sm"
                        variant="ghost"
                        color="vino.500"
                        icon={<FileDown size={16} />}
                        as="a"
                        href="https://pdfobject.com/pdf/sample.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {chats.length} sesiones
        </Text>
      </StatCard>
    </DashboardLayout>
  );
}
