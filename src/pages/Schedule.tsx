import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  availability as seed,
  Availability,
  doctors,
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

const slotTone: Record<Availability["status"], string> = {
  disponible: "green",
  reservado: "brand",
  cancelado: "red",
};

export default function Schedule() {
  const { user } = useAuth();
  const doctorName =
    doctors.find((m) => m.id === user?.refId)?.name ??
    user?.name ??
    "Médico";

  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [slots, setSlots] = useState<Availability[]>(
    seed.filter((s) => s.specialistName === doctorName)
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [toDelete, setToDelete] = useState<Availability | null>(null);

  const daySlots = useMemo(
    () =>
      slots
        .filter((s) => s.date === date)
        .sort((a, b) => a.startHour.localeCompare(b.startHour)),
    [slots, date]
  );

  const cycleStatus = (s: Availability) => {
    const next: Availability["status"] =
      s.status === "disponible"
        ? "reservado"
        : s.status === "reservado"
        ? "cancelado"
        : "disponible";
    setSlots(slots.map((x) => (x === s ? { ...x, status: next } : x)));
    toast.success(`Franja → ${next}`);
  };

  const handleAdd = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const newSlot: Availability = {
      date: String(fd.get("date")),
      startHour: String(fd.get("startHour")),
      finishHour: String(fd.get("finishHour")),
      specialistName: doctorName,
      status: "disponible",
      mode: fd.get("mode") as Availability["mode"],
    };
    setSlots([...slots, newSlot]);
    onClose();
    toast.success("Franja añadida");
  };

  const uniqueDays = Array.from(new Set(slots.map((s) => s.date))).sort();

  return (
    <DashboardLayout
      title="Mi agenda"
      subtitle="Define tu disponibilidad para consultas virtuales y presenciales"
    >
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        <StatCard>
          <HStack mb={1}>
            <CalendarDays size={16} color="#6c122b" />
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
            {uniqueDays.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={d === date ? "solid" : "outline"}
                colorScheme="brand"
                onClick={() => setDate(d)}
                justifyContent="flex-start"
              >
                {d}
              </Button>
            ))}
          </VStack>
          <VStack align="stretch" mt={4} spacing={2} fontSize="xs">
            <HStack>
              <Box h="10px" w="10px" borderRadius="full" bg="success.500" />
              <Text>Disponible</Text>
            </HStack>
            <HStack>
              <Box h="10px" w="10px" borderRadius="full" bg="brand.500" />
              <Text>Reservado por paciente</Text>
            </HStack>
            <HStack>
              <Box h="10px" w="10px" borderRadius="full" bg="danger.500" />
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
              colorScheme="accent"
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
                  bg={`${slotTone[s.status]}.50`}
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
                  <Badge variant="outline">{s.mode ?? "Virtual"}</Badge>
                  <Badge
                    colorScheme={slotTone[s.status]}
                    textTransform="capitalize"
                  >
                    {s.status}
                  </Badge>
                  <HStack ml="auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cycleStatus(s)}
                    >
                      Cambiar estado
                    </Button>
                    <IconButton
                      aria-label="Eliminar"
                      size="sm"
                      variant="ghost"
                      color="danger.500"
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
                  <Input name="date" type="date" defaultValue={date} />
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
                  <Select name="mode" defaultValue="Virtual">
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
              <Button type="submit" colorScheme="brand">
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
              {toDelete?.date} a las {toDelete?.startHour} hasta{" "}
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
