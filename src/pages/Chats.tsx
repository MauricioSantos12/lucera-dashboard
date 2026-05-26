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
  Heading,
} from "@chakra-ui/react";
import { Search, Phone, Bot, User, Stethoscope, Lock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { TriageBadge } from "@/components/TriageBadge";

const estadoTone = (e: ChatSesion["estado"]) =>
  e === "activa" ? "green" : e === "esperando" ? "yellow" : "gray";

export default function Chats() {
  const [selected, setSelected] = useState<ChatSesion>(chats[0]);
  const [q, setQ] = useState("");
  const [filterTriaje, setFilterTriaje] = useState("todos");

  const filtered = chats.filter((c) => {
    const okQ = `${c.paciente} ${c.telefono} ${c.id}`
      .toLowerCase()
      .includes(q.toLowerCase());
    const okT = filterTriaje === "todos" || c.triaje === filterTriaje;
    return okQ && okT;
  });

  return (
    <DashboardLayout
      title="Monitoreo de chats"
      subtitle="Conversaciones de WhatsApp"
    >
      <Flex
        gap={4}
        h={{ base: "auto", lg: "calc(100vh - 220px)" }}
        minH={{ lg: "600px" }}
        direction={{ base: "column", lg: "row" }}
      >
        {/* Lista */}
        <Flex
          direction="column"
          w={{ base: "100%", lg: "33%" }}
          bg="lucera.surface"
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="xl"
          overflow="hidden"
        >
          <VStack
            p={4}
            spacing={3}
            borderBottomWidth="1px"
            borderColor="lucera.border"
            align="stretch"
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="Buscar paciente o teléfono…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
            <Select
              value={filterTriaje}
              onChange={(e) => setFilterTriaje(e.target.value)}
            >
              <option value="todos">Todos los triajes</option>
              <option value="emergencia">🔴 Emergencia (Rojo)</option>
              <option value="urgente">🟡 Urgente (Amarillo)</option>
              <option value="general">🟢 General (Verde)</option>
            </Select>
          </VStack>
          <Box flex={1} overflowY="auto">
            {filtered.map((c) => (
              <Box
                key={c.id}
                as="button"
                w="100%"
                textAlign="left"
                px={4}
                py={3}
                borderBottomWidth="1px"
                borderColor="lucera.borderSoft"
                bg={selected.id === c.id ? "vino.50" : "transparent"}
                borderLeftWidth={selected.id === c.id ? "2px" : "0"}
                borderLeftColor="vino.500"
                _hover={{ bg: selected.id === c.id ? "vino.50" : "crema.50" }}
                onClick={() => setSelected(c)}
              >
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight={600} fontSize="sm" noOfLines={1}>
                    {c.paciente}
                  </Text>
                  <Text
                    fontSize="10px"
                    color="lucera.textMuted"
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {c.hora}
                  </Text>
                </Flex>
                <Text
                  fontSize="xs"
                  color="lucera.textMuted"
                  noOfLines={1}
                  mb={2}
                >
                  {c.ultimoMensaje}
                </Text>
                <HStack spacing={1.5}>
                  <TriageBadge level={c.triaje} />
                  <Badge
                    colorScheme={estadoTone(c.estado)}
                    textTransform="capitalize"
                    fontSize="10px"
                  >
                    {c.estado}
                  </Badge>
                </HStack>
              </Box>
            ))}
          </Box>
        </Flex>

        {/* Conversación */}
        <Flex
          direction="column"
          flex={1}
          bg="lucera.surface"
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="xl"
          overflow="hidden"
        >
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
                    {selected.telefono} · {selected.acudiente} · {selected.id}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <TriageBadge level={selected.triaje} />
          </Flex>

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
      </Flex>
    </DashboardLayout>
  );
}
