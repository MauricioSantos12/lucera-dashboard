import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { acudientes as seed, Acudiente, paisesCiudades, segurosMedicos } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  SimpleGrid,
  Text,
  useDisclosure,
  TableContainer,
} from "@chakra-ui/react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Phone,
  Mail,
  Baby,
  Download,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { toast } from "@/lib/toast";
import { exportToExcel } from "@/lib/exportToExcel";

const estadoTone = (e: Acudiente["estado"]) =>
  e === "activa" ? "green" : e === "suspendida" ? "yellow" : "red";

export default function Guardians() {
  const { user } = useAuth();
  const canEdit = user?.rol !== "Invitado";
  const canExport = user?.rol !== "Invitado" && user?.rol !== "Ventas";
  const [data, setData] = useState<Acudiente[]>(seed);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Acudiente | null>(null);
  const [toDelete, setToDelete] = useState<Acudiente | null>(null);
  const [pais, setPais] = useState("");

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((a) => {
      const okQ = `${a.nombre} ${a.id} ${a.email} ${a.telefono} ${a.ciudad}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okE = estado === "todos" || a.estado === estado;
      return okQ && okE;
    });
  }, [data, q, estado]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (a: Acudiente | null) => {
    setEditing(a);
    setPais(a?.pais ?? "");
    onOpen();
  };

  const handleSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Acudiente = {
      ...(editing ?? {
        id: `AC-${1100 + data.length}`,
        registrado: new Date().toISOString().slice(0, 10),
        ninos: [],
      }),
      nombre: String(fd.get("nombre")),
      email: String(fd.get("email")),
      telefono: String(fd.get("telefono")),
      relacion: fd.get("relacion") as Acudiente["relacion"],
      pais: String(fd.get("pais")),
      ciudad: String(fd.get("ciudad")),
      seguro: (fd.get("seguro") as Acudiente["seguro"]) || undefined,
      seguroId: String(fd.get("seguroId") || "") || undefined,
      estado: fd.get("estado") as Acudiente["estado"],
      plan: fd.get("plan") as Acudiente["plan"],
    };
    setData(
      editing
        ? data.map((a) => (a.id === editing.id ? next : a))
        : [next, ...data]
    );
    toast.success(editing ? "Acudiente actualizado" : "Acudiente creado");
    onClose();
    setEditing(null);
  };

  return (
    <DashboardLayout title="Acudientes (Tutores)" subtitle="Cuentas titulares">
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
              placeholder="Buscar por nombre, teléfono, ciudad…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <Select
            w={{ base: "100%", md: "180px" }}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activa">Activos</option>
            <option value="suspendida">Suspendidos</option>
            <option value="baja">De baja</option>
          </Select>
          <Button
            variant="solid"
            leftIcon={<Download size={16} />}
            isDisabled={!canExport}
            onClick={() =>
              exportToExcel(
                filtered.map((a) => ({
                  ID: a.id,
                  Nombre: a.nombre,
                  Email: a.email,
                  Teléfono: a.telefono,
                  Relación: a.relacion,
                  País: a.pais,
                  Ciudad: a.ciudad,
                  Seguro: a.seguro ?? "",
                  "ID Seguro": a.seguroId ?? "",
                  Plan: a.plan,
                  Estado: a.estado,
                  Niños: a.ninos.length,
                  Registrado: a.registrado,
                })),
                "acudientes-lucera",
                "Acudientes"
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
              Nuevo acudiente
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
                <Th>Acudiente</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Contacto</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>País / Ciudad</Th>
                <Th>Niños</Th>
                <Th>Plan</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Seguro</Th>
                <Th>Estado</Th>
                {canEdit && <Th textAlign="right">Acciones</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((a) => (
                <Tr key={a.id} _hover={{ bg: "crema.50" }}>
                  <Td fontFamily="mono" fontSize="xs" color="lucera.textMuted">
                    {a.id}
                  </Td>
                  <Td>
                    <HStack>
                      <Flex
                        h={8}
                        w={8}
                        borderRadius="full"
                        bg="vino.50"
                        align="center"
                        justify="center"
                      >
                        <UsersIcon size={14} color="#6d122b" />
                      </Flex>
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          {a.nombre}
                        </Text>
                        <Text fontSize="xs" color="lucera.textMuted">
                          {a.relacion}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }}>
                    <HStack fontSize="xs">
                      <Phone size={10} />
                      <Text>{a.telefono}</Text>
                    </HStack>
                    <HStack fontSize="xs" color="lucera.textMuted">
                      <Mail size={10} />
                      <Text>{a.email}</Text>
                    </HStack>
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontSize="sm"
                  >
                    <Text fontSize="xs" color="lucera.textMuted">{a.pais}</Text>
                    <Text>{a.ciudad}</Text>
                  </Td>
                  <Td>
                    <Badge variant="outline">
                      <HStack spacing={1}>
                        <Baby size={10} />
                        <Text>{a.ninos.length}</Text>
                      </HStack>
                    </Badge>
                  </Td>
                  <Td>
                    <Badge variant="outline">{a.plan}</Badge>
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }} fontSize="xs">
                    {a.seguro ? (
                      <>
                        <Text fontWeight={600}>{a.seguro}</Text>
                        <Text color="lucera.textMuted">{a.seguroId}</Text>
                      </>
                    ) : (
                      <Text color="lucera.textMuted">—</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={estadoTone(a.estado)}
                      textTransform="capitalize"
                    >
                      {a.estado}
                    </Badge>
                  </Td>
                  {canEdit && (
                    <Td textAlign="right">
                      <IconButton
                        aria-label="Editar"
                        size="sm"
                        variant="ghost"
                        icon={<Pencil size={14} />}
                        onClick={() => openEdit(a)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        size="sm"
                        variant="ghost"
                        color="peligro.500"
                        icon={<Trash2 size={14} />}
                        onClick={() => setToDelete(a)}
                      />
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {data.length} acudientes
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
            {editing ? "Editar acudiente" : "Nuevo acudiente"}
          </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(e.currentTarget);
            }}
          >
            <ModalBody>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl gridColumn="span 2" isRequired>
                  <FormLabel>Nombre completo</FormLabel>
                  <Input name="nombre" defaultValue={editing?.nombre} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Teléfono (WhatsApp)</FormLabel>
                  <Input name="telefono" defaultValue={editing?.telefono} />
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
                  <FormLabel>Relación</FormLabel>
                  <Select
                    name="relacion"
                    defaultValue={editing?.relacion ?? "Madre"}
                  >
                    {["Madre", "Padre", "Tutor", "Abuelo/a"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>País</FormLabel>
                  <Select
                    name="pais"
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    placeholder="Seleccionar país"
                  >
                    {Object.keys(paisesCiudades).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Ciudad</FormLabel>
                  <Select
                    name="ciudad"
                    defaultValue={editing?.ciudad}
                    placeholder="Seleccionar ciudad"
                  >
                    {(paisesCiudades[pais] ?? []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Seguro médico</FormLabel>
                  <Select
                    name="seguro"
                    defaultValue={editing?.seguro ?? ""}
                    placeholder="Sin seguro"
                  >
                    {segurosMedicos.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>ID del seguro</FormLabel>
                  <Input name="seguroId" placeholder="Número de póliza" defaultValue={editing?.seguroId} />
                </FormControl>
                <FormControl>
                  <FormLabel>Plan</FormLabel>
                  <Select
                    name="plan"
                    defaultValue={editing?.plan ?? "Gratuito"}
                  >
                    {["Gratuito", "Premium Mensual", "Premium Anual"].map(
                      (p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="estado"
                    defaultValue={editing?.estado ?? "activa"}
                  >
                    <option value="activa">Activa</option>
                    <option value="suspendida">Suspendida</option>
                    <option value="baja">Baja</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={onClose} mr={2}>
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
        title="Eliminar acudiente"
        description={
          <>
            ¿Seguro que deseas eliminar a <strong>{toDelete?.nombre}</strong>?
            Esta acción también desvincula a {toDelete?.ninos.length ?? 0}{" "}
            niño(s) y no se puede deshacer.
          </>
        }
        onConfirm={() => {
          if (toDelete) {
            setData(data.filter((x) => x.id !== toDelete.id));
            toast.success("Acudiente eliminado");
          }
        }}
      />
    </DashboardLayout>
  );
}
