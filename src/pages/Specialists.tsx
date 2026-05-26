import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { especialistas as seed, Especialista } from "@/lib/mockData";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  useDisclosure,
  TableContainer,
} from "@chakra-ui/react";
import { Search, Plus, Pencil, Trash2, Stethoscope } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { toast } from "@/lib/toast";
import { centros } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";

const estadoTone = (e: Especialista["estado"]) =>
  e === "activo" ? "green" : e === "vacaciones" ? "blue" : "gray";

export default function Specialists() {
  const { user } = useAuth();
  const showCentros = user?.rol === "Admin" || user?.rol === "Médico";
  const [data, setData] = useState<Especialista[]>(seed);
  const [especialidad, setEspecialidad] = useState("todas");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Especialista | null>(null);
  const [toDelete, setToDelete] = useState<Especialista | null>(null);
  const [selectedCentros, setSelectedCentros] = useState<string[]>([]);

  const centrosOptions = centros.map((c) => ({ value: c.id, label: c.nombre }));

  const especialidades = Array.from(new Set(data.map((e) => e.especialidad)));

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((e) => {
      const okQ = `${e.nombre} ${e.especialidad} ${e.id}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okEsp = especialidad === "todas" || e.especialidad === especialidad;
      return okQ && okEsp;
    });
  }, [data, q, especialidad]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (e: Especialista | null) => {
    setEditing(e);
    setSelectedCentros(
      e?.hospitales.map((h) => centros.find((c) => c.nombre === h)?.id ?? h) ??
        []
    );
    onOpen();
  };

  const onSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Especialista = {
      ...(editing ?? {
        id: `M-${300 + data.length}`,
        hospitales: [],
        consultasMes: 0,
        registroIdoneidad: "",
      }),
      nombre: String(fd.get("nombre")),
      especialidad: String(fd.get("especialidad")),
      licencia: String(fd.get("licencia")),
      registroIdoneidad: String(fd.get("licencia")),
      email: String(fd.get("email")),
      modalidad: fd.get("modalidad") as Especialista["modalidad"],
      estado: fd.get("estado") as Especialista["estado"],
      horarios: String(fd.get("horarios")),
      hospitales: selectedCentros.map(
        (id) => centros.find((c) => c.id === id)?.nombre ?? id
      ),
    };
    setData(
      editing
        ? data.map((x) => (x.id === editing.id ? next : x))
        : [next, ...data]
    );
    toast.success(editing ? "Médico actualizado" : "Médico creado");
    onClose();
    setEditing(null);
  };

  return (
    <DashboardLayout title="Especialistas" subtitle="">
      <StatCard>
        <Flex direction={{ base: "column", md: "row" }} gap={3} mb={4}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <Search size={16} />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nombre o ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <Select
            w={{ base: "100%", md: "260px" }}
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
          >
            <option value="todas">Todas las especialidades</option>
            {especialidades.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
          <Button
            colorScheme="vino"
            variant={"solid"}
            leftIcon={<Plus size={16} />}
            onClick={() => openEdit(null)}
          >
            Nuevo médico
          </Button>
        </Flex>

        <TableContainer
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="md"
        >
          <Table size="sm">
            <Thead bg="crema.100">
              <Tr>
                <Th>ID</Th>
                <Th>Médico</Th>
                <Th display={{ base: "none", md: "table-cell" }}>
                  Especialidad
                </Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Idoneidad</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Email</Th>
                <Th>Estado</Th>
                <Th display={{ base: "none", md: "table-cell" }} isNumeric>
                  Consultas/mes
                </Th>
                <Th textAlign="right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((e) => (
                <Tr key={e.id} _hover={{ bg: "crema.50" }}>
                  <Td fontFamily="mono" fontSize="xs" color="lucera.textMuted">
                    {e.id}
                  </Td>
                  <Td>
                    <HStack>
                      <Flex
                        h={8}
                        w={8}
                        borderRadius="full"
                        bg="naranja.50"
                        align="center"
                        justify="center"
                      >
                        <Stethoscope size={14} color="#ef7d54" />
                      </Flex>
                      <Text fontSize="sm" fontWeight={600}>
                        {e.nombre}
                      </Text>
                    </HStack>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontSize="sm"
                  >
                    {e.especialidad}
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontFamily="mono"
                    fontSize="xs"
                  >
                    {e.registroIdoneidad}
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontSize="xs"
                    color="lucera.textMuted"
                  >
                    {e.email}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={estadoTone(e.estado)}
                      textTransform="capitalize"
                    >
                      {e.estado}
                    </Badge>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    isNumeric
                    fontWeight={700}
                  >
                    {e.consultasMes}
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      aria-label="Editar"
                      size="sm"
                      variant="ghost"
                      icon={<Pencil size={14} />}
                      onClick={() => openEdit(e)}
                    />
                    <IconButton
                      aria-label="Eliminar"
                      size="sm"
                      variant="ghost"
                      color="peligro.500"
                      icon={<Trash2 size={14} />}
                      onClick={() => setToDelete(e)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {data.length} especialistas
        </Text>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </StatCard>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editing ? "Editar médico" : "Nuevo médico"}
          </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(e.currentTarget);
            }}
          >
            <ModalBody>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl gridColumn="span 2" isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input name="nombre" defaultValue={editing?.nombre} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Especialidad</FormLabel>
                  <Input
                    name="especialidad"
                    defaultValue={editing?.especialidad}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Idoneidad MINSA</FormLabel>
                  <Input name="licencia" defaultValue={editing?.licencia} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={editing?.email}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Modalidad</FormLabel>
                  <Select
                    name="modalidad"
                    defaultValue={editing?.modalidad ?? "Ambas"}
                  >
                    {["Virtual", "Presencial", "Ambas"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Horarios</FormLabel>
                  <Input
                    name="horarios"
                    defaultValue={editing?.horarios ?? "Lun-Vie 08:00-14:00"}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="estado"
                    defaultValue={editing?.estado ?? "activo"}
                  >
                    <option value="activo">Activo</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="inactivo">Inactivo</option>
                  </Select>
                </FormControl>
                {showCentros && (
                  <FormControl gridColumn="span 2">
                    <FormLabel>Centros de atención</FormLabel>
                    <MultiSelect
                      options={centrosOptions}
                      value={selectedCentros}
                      onChange={setSelectedCentros}
                      placeholder="Seleccionar centros…"
                    />
                  </FormControl>
                )}
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={2} onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="vino">
                Guardar
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar médico"
        description={
          <>
            ¿Eliminar a <strong>{toDelete?.nombre}</strong>? Se cancelarán sus
            franjas futuras.
          </>
        }
        onConfirm={() => {
          if (toDelete) {
            setData(data.filter((x) => x.id !== toDelete.id));
            toast.success("Médico eliminado");
          }
        }}
      />
    </DashboardLayout>
  );
}
