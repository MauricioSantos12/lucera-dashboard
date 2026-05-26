import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  disponibilidad as seed,
  Disponibilidad,
  medicos,
} from "@/lib/mockData";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Badge,
  useDisclosure,
  Heading,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "@/lib/toast";

const slotTone: Record<Disponibilidad["estado"], string> = {
  disponible: "green",
  reservado: "vino",
  cancelado: "red",
};

export default function Schedule() {
  const { user } = useAuth();
  const medicoNombre =
    medicos.find((m) => m.id === user?.refId)?.nombre ??
    user?.nombre ??
    "Médico";

  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [slots, setSlots] = useState<Disponibilidad[]>(
    seed.filter((s) => s.especialista === medicoNombre)
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [toDelete, setToDelete] = useState<Disponibilidad | null>(null);

  const daySlots = useMemo(
    () =>
      slots
        .filter((s) => s.fecha === date)
        .sort((a, b) => a.startHour.localeCompare(b.startHour)),
    [slots, date]
  );

  const cycleEstado = (s: Disponibilidad) => {
    const next: Disponibilidad["estado"] =
      s.estado === "disponible"
        ? "reservado"
        : s.estado === "reservado"
        ? "cancelado"
        : "disponible";
    setSlots(slots.map((x) => (x === s ? { ...x, estado: next } : x)));
    toast.success(`Franja → ${next}`);
  };

  const handleAdd = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const nuevo: Disponibilidad = {
      fecha: String(fd.get("fecha")),
      startHour: String(fd.get("startHour")),
      finishHour: String(fd.get("finishHour")),
      especialista: medicoNombre,
      estado: "disponible",
      modalidad: fd.get("modalidad") as Disponibilidad["modalidad"],
    };
    setSlots([...slots, nuevo]);
    onClose();
    toast.success("Franja añadida");
  };

  const diasUnicos = Array.from(new Set(slots.map((s) => s.fecha))).sort();

  return (
    <DashboardLayout
      title="Mi agenda"
      subtitle="Define tu disponibilidad para consultas virtuales y presenciales"
    >
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        <StatCard>
          <HStack mb={1}>
            <CalendarDays size={16} color="#6d122b" />
            <Heading size="sm" fontFamily="heading">
              Calendario
            </Heading>
          </HStack>
          <Text fontSize="xs" color="lucera.textMuted" mb={4}>
            Selecciona una fecha o usa los accesos directos.
          </Text>
          <FormControl mb={4}>
            <FormLabel>Fecha</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>
          <Text fontSize="xs" color="lucera.textMuted" mb={2}>
            Días con franjas
          </Text>
          <VStack align="stretch" spacing={1}>
            {diasUnicos.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={d === date ? "solid" : "outline"}
                colorScheme="vino"
                onClick={() => setDate(d)}
                justifyContent="flex-start"
              >
                {d}
              </Button>
            ))}
          </VStack>
          <VStack align="stretch" mt={4} spacing={2} fontSize="xs">
            <HStack>
              <Box h="10px" w="10px" borderRadius="full" bg="exito.500" />
              <Text>Disponible</Text>
            </HStack>
            <HStack>
              <Box h="10px" w="10px" borderRadius="full" bg="vino.500" />
              <Text>Reservado por paciente</Text>
            </HStack>
            <HStack>
              <Box h="10px" w="10px" borderRadius="full" bg="peligro.500" />
              <Text>Cancelado</Text>
            </HStack>
          </VStack>
        </StatCard>

        <StatCard gridColumn={{ lg: "span 2" }}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="sm" fontFamily="heading">
                Franjas del {date}
              </Heading>
              <Text fontSize="xs" color="lucera.textMuted">
                Clic en "Cambiar estado" para alternar.
              </Text>
            </Box>
            <Button
              colorScheme="naranja"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={onOpen}
            >
              Añadir franja
            </Button>
          </Flex>

          {daySlots.length === 0 ? (
            <Flex
              py={12}
              borderWidth="2px"
              borderColor="lucera.border"
              borderStyle="dashed"
              borderRadius="lg"
              align="center"
              justify="center"
              color="lucera.textMuted"
              fontSize="sm"
            >
              Sin franjas para este día. Añade tu disponibilidad.
            </Flex>
          ) : (
            <VStack align="stretch" spacing={2}>
              {daySlots.map((s, i) => (
                <Flex
                  key={i}
                  px={4}
                  py={3}
                  borderWidth="1px"
                  borderColor="lucera.border"
                  borderRadius="lg"
                  align="center"
                  gap={3}
                  bg={`${slotTone[s.estado]}.50`}
                >
                  <Clock size={16} />
                  <Text
                    fontFamily="mono"
                    fontWeight={700}
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {s.startHour}
                  </Text>
                  <Text
                    fontFamily="mono"
                    fontWeight={700}
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    - {s.finishHour}
                  </Text>
                  <Badge variant="outline">{s.modalidad ?? "Virtual"}</Badge>
                  <Badge
                    colorScheme={slotTone[s.estado]}
                    textTransform="capitalize"
                  >
                    {s.estado}
                  </Badge>
                  <HStack ml="auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cycleEstado(s)}
                    >
                      Cambiar estado
                    </Button>
                    <IconButton
                      aria-label="Eliminar"
                      size="sm"
                      variant="ghost"
                      color="peligro.500"
                      icon={<Trash2 size={14} />}
                      onClick={() => setToDelete(s)}
                    />
                  </HStack>
                </Flex>
              ))}
            </VStack>
          )}
        </StatCard>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva franja de disponibilidad</ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd(e.currentTarget);
            }}
          >
            <ModalBody>
              <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Fecha</FormLabel>
                  <Input name="fecha" type="date" defaultValue={date} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Hora de inicio</FormLabel>
                  <Input name="hora" type="time" defaultValue="09:00" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Hora de fin</FormLabel>
                  <Input name="hora" type="time" defaultValue="10:00" />
                </FormControl>
                <FormControl>
                  <FormLabel>Modalidad</FormLabel>
                  <Select name="modalidad" defaultValue="Virtual">
                    <option value="Virtual">Virtual</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Ambas">Ambas</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={2} onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="vino">
                Añadir
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar franja"
        description={
          <>
            ¿Eliminar la franja del{" "}
            <strong>
              {toDelete?.fecha} a las {toDelete?.startHour} hasta{" "}
              {toDelete?.finishHour}
            </strong>
            ? Si estaba reservada, se notificará al paciente.
          </>
        }
        onConfirm={() => {
          if (toDelete) {
            setSlots(slots.filter((x) => x !== toDelete));
            toast.success("Franja eliminada");
          }
        }}
      />
    </DashboardLayout>
  );
}
