import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { specialists as seed, Specialist } from "@/lib/mockData";
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
import { Search, Plus, Pencil, Trash2, Stethoscope, Download } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { toast } from "@/lib/toast";
import { exportToExcel } from "@/lib/exportToExcel";
import { centers } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";

const statusTone = (e: Specialist["status"]) =>
  e === "activo" ? "green" : e === "vacaciones" ? "blue" : "gray";

export default function Specialists() {
  const { user } = useAuth();
  const showCenters = user?.role === "Admin" || user?.role === "Médico";
  const canEdit = user?.role !== "Invitado";
  const canExport = user?.role !== "Invitado" && user?.role !== "Ventas";
  const [data, setData] = useState<Specialist[]>(seed);
  const [specialtyFilter, setSpecialtyFilter] = useState("todas");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Specialist | null>(null);
  const [toDelete, setToDelete] = useState<Specialist | null>(null);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  const centerOptions = centers.map((c) => ({ value: c.id, label: c.name }));

  const specialties = Array.from(new Set(data.map((e) => e.specialty)));

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((e) => {
      const okQ = `${e.name} ${e.specialty} ${e.id}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okEsp = specialtyFilter === "todas" || e.specialty === specialtyFilter;
      return okQ && okEsp;
    });
  }, [data, q, specialtyFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (e: Specialist | null) => {
    setEditing(e);
    setSelectedCenters(
      e?.hospitals.map((h) => centers.find((c) => c.name === h)?.id ?? h) ??
        []
    );
    onOpen();
  };

  const onSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Specialist = {
      ...(editing ?? {
        id: `M-${300 + data.length}`,
        hospitals: [],
        monthlyConsultations: 0,
        licenseRegistration: "",
      }),
      name: String(fd.get("name")),
      specialty: String(fd.get("specialty")),
      license: String(fd.get("license")),
      licenseRegistration: String(fd.get("license")),
      email: String(fd.get("email")),
      mode: fd.get("mode") as Specialist["mode"],
      status: fd.get("status") as Specialist["status"],
      hours: String(fd.get("hours")),
      hospitals: selectedCenters.map(
        (id) => centers.find((c) => c.id === id)?.name ?? id
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
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="todas">Todas las especialidades</option>
            {specialties.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
          <Button
            variant="solid"
            leftIcon={<Download size={16} />}
            isDisabled={!canExport}
            onClick={() =>
              exportToExcel(
                filtered.map((e) => ({
                  ID: e.id,
                  Nombre: e.name,
                  Especialidad: e.specialty,
                  Idoneidad: e.licenseRegistration,
                  Email: e.email,
                  Modalidad: e.mode,
                  Estado: e.status,
                  "Consultas/mes": e.monthlyConsultations,
                  Hospitales: e.hospitals.join(", "),
                })),
                "especialistas-lucera",
                "Especialistas"
              )
            }
          >
            Exportar
          </Button>
          {canEdit && (
            <Button
              colorScheme="vino"
              variant={"solid"}
              leftIcon={<Plus size={16} />}
              onClick={() => openEdit(null)}
            >
              Nuevo médico
            </Button>
          )}
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
                {canEdit && <Th textAlign="right">Acciones</Th>}
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
                        {e.name}
                      </Text>
                    </HStack>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontSize="sm"
                  >
                    {e.specialty}
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontFamily="mono"
                    fontSize="xs"
                  >
                    {e.licenseRegistration}
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
                      colorScheme={statusTone(e.status)}
                      textTransform="capitalize"
                    >
                      {e.status}
                    </Badge>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    isNumeric
                    fontWeight={700}
                  >
                    {e.monthlyConsultations}
                  </Td>
                  {canEdit && (
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
                  )}
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
                  <Input name="name" defaultValue={editing?.name} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Especialidad</FormLabel>
                  <Input
                    name="specialty"
                    defaultValue={editing?.specialty}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Idoneidad MINSA</FormLabel>
                  <Input name="license" defaultValue={editing?.license} />
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
                    name="mode"
                    defaultValue={editing?.mode ?? "Ambas"}
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
                    name="hours"
                    defaultValue={editing?.hours ?? "Lun-Vie 08:00-14:00"}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="status"
                    defaultValue={editing?.status ?? "activo"}
                  >
                    <option value="activo">Activo</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="inactivo">Inactivo</option>
                  </Select>
                </FormControl>
                {showCenters && (
                  <FormControl gridColumn="span 2">
                    <FormLabel>Centros de atención</FormLabel>
                    <MultiSelect
                      options={centerOptions}
                      value={selectedCenters}
                      onChange={setSelectedCenters}
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
            ¿Eliminar a <strong>{toDelete?.name}</strong>? Se cancelarán sus
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
