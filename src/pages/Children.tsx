import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { acudientes, NinoPaciente } from "@/lib/mockData";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
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
  Badge,
  Text,
  TableContainer,
  Wrap,
  WrapItem,
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
  useDisclosure,
} from "@chakra-ui/react";
import {
  Search,
  Baby,
  Droplet,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Download,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { toast } from "@/lib/toast";
import { exportToExcel } from "@/lib/exportToExcel";
import { useAuth } from "@/lib/auth";

type Row = NinoPaciente & {
  edad: number;
  acudienteId: string;
  acudienteNombre: string;
  relacion: string;
  telefono: string;
};

function buildRows(source: typeof acudientes): Row[] {
  return source.flatMap((a) =>
    a.ninos.map((n) => ({
      ...n,
      edad: Math.floor(
        (Date.now() - new Date(n.fechaNacimiento).getTime()) /
          (365.25 * 86400000)
      ),
      acudienteId: a.id,
      acudienteNombre: a.nombre,
      relacion: a.relacion,
      telefono: a.telefono,
    }))
  );
}

export default function Children() {
  const { user } = useAuth();
  const canEdit = user?.rol !== "Invitado";
  const canExport = user?.rol !== "Invitado" && user?.rol !== "Ventas";
  const perPage = 10;
  const [data, setData] = useState<Row[]>(buildRows(acudientes));
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("todos");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Row | null>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((r) => {
      const okQ = `${r.nombre} ${r.acudienteNombre} ${r.id}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okF =
        filter === "todos" ||
        (filter === "alergias" && (r.alergias?.length ?? 0) > 0) ||
        (filter === "condiciones" && (r.condiciones?.length ?? 0) > 0) ||
        (filter === "lactantes" && r.edad < 2) ||
        (filter === "preescolar" && r.edad >= 2 && r.edad < 6) ||
        (filter === "escolar" && r.edad >= 6);
      return okQ && okF;
    });
  }, [data, q, filter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (r: Row | null) => {
    setEditing(r);
    onOpen();
  };

  const handleSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const alergias = String(fd.get("alergias") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const condiciones = String(fd.get("condiciones") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const fechaNacimiento = String(fd.get("fechaNacimiento"));
    const edad = Math.floor(
      (Date.now() - new Date(fechaNacimiento).getTime()) / (365.25 * 86400000)
    );

    const next: Row = {
      id: editing?.id ?? `N-${Date.now()}`,
      nombre: String(fd.get("nombre")),
      fechaNacimiento,
      pesoKg: Number(fd.get("pesoKg")) || undefined,
      tipoSangre:
        (fd.get("tipoSangre") as NinoPaciente["tipoSangre"]) || undefined,
      alergias,
      condiciones,
      edad,
      acudienteId: editing?.acudienteId ?? String(fd.get("acudienteId")),
      acudienteNombre:
        editing?.acudienteNombre ??
        acudientes.find((a) => a.id === String(fd.get("acudienteId")))
          ?.nombre ??
        "",
      relacion:
        editing?.relacion ??
        acudientes.find((a) => a.id === String(fd.get("acudienteId")))
          ?.relacion ??
        "",
      telefono:
        editing?.telefono ??
        acudientes.find((a) => a.id === String(fd.get("acudienteId")))
          ?.telefono ??
        "",
    };

    setData(
      editing
        ? data.map((r) => (r.id === editing.id ? next : r))
        : [next, ...data]
    );
    toast.success(editing ? "Niño actualizado" : "Niño registrado");
    onClose();
    setEditing(null);
  };

  return (
    <DashboardLayout
      title="Niños (Pacientes pediátricos)"
      subtitle="Pacientes registrados"
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
              placeholder="Buscar por nombre del niño o acudiente…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <Select
            w={{ base: "100%", md: "240px" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="todos">Todos los niños</option>
            <option value="lactantes">Lactantes (0-1)</option>
            <option value="preescolar">Preescolar (2-5)</option>
            <option value="escolar">Escolar (6+)</option>
            <option value="alergias">Con alergias</option>
            <option value="condiciones">Con condiciones</option>
          </Select>
          <Button
            variant="solid"
            leftIcon={<Download size={16} />}
            isDisabled={!canExport}
            onClick={() =>
              exportToExcel(
                filtered.map((r) => ({
                  ID: r.id,
                  Nombre: r.nombre,
                  "F. Nacimiento": r.fechaNacimiento,
                  Edad: r.edad,
                  "Peso (kg)": r.pesoKg ?? "",
                  "Tipo Sangre": r.tipoSangre ?? "",
                  Alergias: (r.alergias ?? []).join(", "),
                  Condiciones: (r.condiciones ?? []).join(", "),
                  Acudiente: r.acudienteNombre,
                  Teléfono: r.telefono,
                })),
                "ninos-lucera",
                "Niños"
              )
            }
          >
            Exportar
          </Button>
          {canEdit && (
            <Button
              colorScheme="vino"
              variant="solid"
              leftIcon={<Plus size={16} />}
              onClick={() => openEdit(null)}
            >
              Nuevo niño
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
                <Th>Niño/a</Th>
                <Th display={{ base: "none", md: "table-cell" }}>
                  F. nacimiento
                </Th>
                <Th>Edad</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Peso</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Sangre</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>
                  Alergias / Condiciones
                </Th>
                <Th>Acudiente</Th>
                {canEdit && <Th textAlign="right">Acciones</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((r) => (
                <Tr key={r.id} _hover={{ bg: "crema.50" }}>
                  <Td fontFamily="mono" fontSize="xs" color="lucera.textMuted">
                    {r.id}
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
                        <Baby size={14} color="#ef7d54" />
                      </Flex>
                      <Text fontSize="sm" fontWeight={600}>
                        {r.nombre}
                      </Text>
                    </HStack>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontSize="xs"
                  >
                    {r.fechaNacimiento}
                  </Td>
                  <Td fontSize="sm" textAlign="center">
                    {r.edad}
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontSize="sm"
                    textAlign="center"
                  >
                    {r.pesoKg ? `${r.pesoKg}` : "—"}
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }}>
                    {r.tipoSangre ? (
                      <Badge variant="outline">
                        <HStack spacing={1}>
                          <Droplet size={10} color="#b91c1c" />
                          <Text fontFamily="mono">{r.tipoSangre}</Text>
                        </HStack>
                      </Badge>
                    ) : (
                      <Text fontSize="xs" color="lucera.textMuted">
                        —
                      </Text>
                    )}
                  </Td>
                  <Td display={{ base: "none", lg: "table-cell" }}>
                    <Wrap spacing={1}>
                      {(r.alergias ?? []).map((a) => (
                        <WrapItem key={a}>
                          <Badge colorScheme="amarillo">
                            <HStack spacing={1}>
                              <AlertTriangle size={10} />
                              <Text>{a}</Text>
                            </HStack>
                          </Badge>
                        </WrapItem>
                      ))}
                      {(r.condiciones ?? []).map((c) => (
                        <WrapItem key={c}>
                          <Badge colorScheme="blue">{c}</Badge>
                        </WrapItem>
                      ))}
                      {(r.alergias?.length ?? 0) === 0 &&
                        (r.condiciones?.length ?? 0) === 0 && (
                          <Text fontSize="xs" color="lucera.textMuted">
                            Sin antecedentes
                          </Text>
                        )}
                    </Wrap>
                  </Td>
                  <Td fontSize="xs">
                    <Text fontWeight={600}>{r.acudienteNombre}</Text>
                    <Text color="lucera.textMuted">
                      {r.relacion} · {r.telefono}
                    </Text>
                  </Td>
                  {canEdit && (
                    <Td textAlign="right">
                      <IconButton
                        aria-label="Editar"
                        size="sm"
                        variant="ghost"
                        icon={<Pencil size={14} />}
                        onClick={() => openEdit(r)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        size="sm"
                        variant="ghost"
                        color="peligro.500"
                        icon={<Trash2 size={14} />}
                        onClick={() => setToDelete(r)}
                      />
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {data.length} niños registrados
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
          <ModalHeader>{editing ? "Editar niño" : "Nuevo niño"}</ModalHeader>
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
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <Input
                    name="fechaNacimiento"
                    type="date"
                    defaultValue={editing?.fechaNacimiento}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Peso (kg)</FormLabel>
                  <Input
                    name="pesoKg"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={editing?.pesoKg}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tipo de sangre</FormLabel>
                  <Select
                    name="tipoSangre"
                    defaultValue={editing?.tipoSangre ?? ""}
                    placeholder="Sin especificar"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
                {!editing && (
                  <FormControl isRequired>
                    <FormLabel>Acudiente</FormLabel>
                    <Select
                      name="acudienteId"
                      placeholder="Seleccionar acudiente"
                    >
                      {acudientes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre} ({a.id})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl gridColumn="span 2">
                  <FormLabel>Alergias (separadas por coma)</FormLabel>
                  <Input
                    name="alergias"
                    placeholder="Penicilina, Maní…"
                    defaultValue={editing?.alergias?.join(", ")}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>
                    Condiciones médicas (separadas por coma)
                  </FormLabel>
                  <Input
                    name="condiciones"
                    placeholder="Asma leve…"
                    defaultValue={editing?.condiciones?.join(", ")}
                  />
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
        title="Eliminar niño"
        description={
          <>
            ¿Seguro que deseas eliminar a <strong>{toDelete?.nombre}</strong>?
            Se perderá su historial clínico vinculado y no se puede deshacer.
          </>
        }
        onConfirm={() => {
          if (toDelete) {
            setData(data.filter((x) => x.id !== toDelete.id));
            toast.success("Niño eliminado");
          }
        }}
      />
    </DashboardLayout>
  );
}
