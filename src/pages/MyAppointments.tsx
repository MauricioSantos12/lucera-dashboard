import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { chats, ChatSesion } from "@/lib/mockData";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { Bot, User, Stethoscope, Lock } from "lucide-react";
import { TriageBadge } from "@/components/TriageBadge";

export default function MyAppointments() {
  const { user } = useAuth();
  const acNombre = user?.nombre ?? "";
  const mias = chats.filter(c => c.acudiente === acNombre);
  const list = mias.length ? mias : chats.slice(0, 2);
  const [selected, setSelected] = useState<ChatSesion>(list[0]);

  return (
    <DashboardLayout title="Mis consultas" subtitle="Historial de conversaciones con Lucera IA (solo lectura)">
      <Flex gap={4} h={{ base: "auto", lg: "calc(100vh - 220px)" }} minH={{ lg: "600px" }} direction={{ base: "column", lg: "row" }}>
        <Flex direction="column" w={{ base: "100%", lg: "33%" }} bg="lucera.surface" borderWidth="1px" borderColor="lucera.border" borderRadius="xl" overflow="hidden">
          <Box p={4} borderBottomWidth="1px" borderColor="lucera.border">
            <Text fontWeight={700} fontSize="sm">{list.length} consulta(s)</Text>
            <Text fontSize="xs" color="lucera.textMuted">Para nuevas consultas, usa WhatsApp.</Text>
          </Box>
          <Box flex={1} overflowY="auto">
            {list.map(c => (
              <Box
                key={c.id} as="button" w="100%" textAlign="left" px={4} py={3}
                borderBottomWidth="1px" borderColor="lucera.borderSoft"
                bg={selected.id === c.id ? "vino.50" : "transparent"}
                _hover={{ bg: "crema.50" }}
                onClick={() => setSelected(c)}
              >
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight={600} fontSize="sm">{c.paciente}</Text>
                  <Text fontSize="10px" color="lucera.textMuted" sx={{ fontVariantNumeric: "tabular-nums" }}>{c.hora}</Text>
                </Flex>
                <Text fontSize="xs" color="lucera.textMuted" noOfLines={1} mb={2}>{c.ultimoMensaje}</Text>
                <TriageBadge level={c.triaje} />
              </Box>
            ))}
          </Box>
        </Flex>

        <Flex direction="column" flex={1} bg="lucera.surface" borderWidth="1px" borderColor="lucera.border" borderRadius="xl" overflow="hidden">
          <Flex p={4} borderBottomWidth="1px" borderColor="lucera.border" justify="space-between" align="center">
            <Box>
              <Text fontWeight={700} fontSize="sm">{selected.paciente}</Text>
              <Text fontSize="xs" color="lucera.textMuted">{selected.id} · {selected.inicio}</Text>
            </Box>
            <TriageBadge level={selected.triaje} />
          </Flex>

          <Box flex={1} overflowY="auto" p={4} bg="crema.50">
            <VStack spacing={3} maxW="2xl" mx="auto" align="stretch">
              {selected.mensajes.map((m, i) => {
                const isUser = m.rol === "acudiente";
                const isBot = m.rol === "bot";
                return (
                  <Flex key={i} gap={2} justify={isUser ? "flex-end" : "flex-start"}>
                    {!isUser && (
                      <Flex h={7} w={7} borderRadius="full" align="center" justify="center" flexShrink={0}
                        bg={isBot ? "vino.50" : "naranja.50"} color={isBot ? "vino.500" : "naranja.500"}>
                        {isBot ? <Bot size={14} /> : <Stethoscope size={14} />}
                      </Flex>
                    )}
                    <Box
                      maxW="75%" px={4} py={2.5} borderRadius="2xl" boxShadow="sm" fontSize="sm"
                      bg={isUser ? "vino.500" : isBot ? "white" : "naranja.500"}
                      color={isUser || (!isUser && !isBot) ? "white" : "lucera.text"}
                      borderWidth={isBot ? "1px" : 0} borderColor="lucera.border"
                    >
                      {!isUser && (
                        <Text fontSize="10px" fontWeight={700} textTransform="uppercase" letterSpacing="wider" mb={1} opacity={0.7}>
                          {isBot ? "Lucera IA" : "Sistema"}
                        </Text>
                      )}
                      <Text>{m.texto}</Text>
                      <Text fontSize="10px" mt={1} opacity={0.7} sx={{ fontVariantNumeric: "tabular-nums" }}>{m.hora}</Text>
                    </Box>
                    {isUser && <Flex h={7} w={7} borderRadius="full" bg="vino.50" color="vino.500" align="center" justify="center"><User size={14} /></Flex>}
                  </Flex>
                );
              })}
            </VStack>
          </Box>

          <HStack justify="center" p={3} borderTopWidth="1px" borderColor="lucera.border" bg="crema.50" fontSize="xs" color="lucera.textMuted" spacing={2}>
            <Lock size={12} />
            <Text>Esta vista es solo lectura. Para enviar mensajes utiliza WhatsApp con Lucera IA.</Text>
          </HStack>
        </Flex>
      </Flex>
    </DashboardLayout>
  );
}
