import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { medicamentos as seed, Medicamento } from "@/lib/mockData";
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
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Badge,
  useDisclosure,
  TableContainer,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  Search,
  Plus,
  Pill,
  CheckCircle2,
  XCircle,
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

const catTone: Record<Medicamento["categoria"], string> = {
  Analgésico: "vino",
  Antipirético: "naranja",
  Antihistamínico: "blue",
  Antibiótico: "red",
  Antitusivo: "amarillo",
  Otros: "gray",
};

const cats: Medicamento["categoria"][] = [
  "Analgésico",
  "Antipirético",
  "Antihistamínico",
  "Antibiótico",
  "Antitusivo",
  "Otros",
];

export default function Medications() {
  const { user } = useAuth();
  const canEdit = user?.rol !== "Invitado";
  const canExport = user?.rol !== "Invitado" && user?.rol !== "Ventas";
  const [data, setData] = useState<Medicamento[]>(seed);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [estado, setEstado] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Medicamento | null>(null);
  const [toDelete, setToDelete] = useState<Medicamento | null>(null);
  const [recomendable, setRecomendable] = useState(true);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((m) => {
      const okQ = `${m.nombre} ${m.generico} ${m.marca ?? ""}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okC = cat === "todas" || m.categoria === cat;
      const okE = estado === "todos" || m.estado === estado;
      return okQ && okC && okE;
    });
  }, [data, q, cat, estado]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (m: Medicamento | null) => {
    setEditing(m);
    setRecomendable(m?.recomendable ?? true);
    onOpen();
  };

  const onSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Medicamento = {
      id: editing?.id ?? `MED-${data.length + 1}`,
      nombre: String(fd.get("nombre")),
      generico: String(fd.get("generico")),
      marca: String(fd.get("marca") || "") || undefined,
      categoria: fd.get("categoria") as Medicamento["categoria"],
      estado: fd.get("estado") as Medicamento["estado"],
      dosisPorKg: String(fd.get("dosisPorKg") || "") || undefined,
      notas: String(fd.get("notas") || "") || undefined,
      recomendable,
    };
    setData(
      editing
        ? data.map((x) => (x.id === editing.id ? next : x))
        : [next, ...data]
    );
    toast.success(editing ? "Medicamento actualizado" : "Medicamento creado");
    onClose();
    setEditing(null);
  };

  return (
    <DashboardLayout
      title="Catálogo de medicamentos"
      subtitle="Medicamentos a recomendar"
    >
      {/* <Alert
        status="warning"
        borderRadius="md"
        mb={4}
        bg="amarillo.50"
        borderWidth="1px"
        borderColor="amarillo.300"
      >
        <AlertIcon color="amarillo.700" />
        <Text fontSize="xs">
          La dosis se calcula con base en el{" "}
          <strong>peso registrado del niño</strong>. Si el acudiente no ha
          registrado el peso, el chatbot menciona el medicamento pero indica que
          la dosis debe ser confirmada por un médico.
        </Text>
      </Alert> */}

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
              placeholder="Buscar por nombre, genérico o marca…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <Select
            w={{ base: "100%", md: "220px" }}
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            w={{ base: "100%", md: "180px" }}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="descontinuado">Descontinuado</option>
          </Select>
          <Button
            variant="solid"
            leftIcon={<Download size={16} />}
            isDisabled={!canExport}
            onClick={() =>
              exportToExcel(
                filtered.map((m) => ({
                  ID: m.id,
                  Nombre: m.nombre,
                  Genérico: m.generico,
                  Marca: m.marca ?? "",
                  Categoría: m.categoria,
                  Estado: m.estado,
                  "Dosis/kg": m.dosisPorKg ?? "",
                  "Recomendable IA": m.recomendable ? "Sí" : "No",
                })),
                "medicamentos-lucera",
                "Medicamentos"
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
              Nuevo
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
                <Th>Medicamento</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Genérico</Th>
                <Th>Categoría</Th>
                {/* <Th display={{ base: "none", lg: "table-cell" }}>
                  Dosis (peso)
                </Th> */}
                <Th>Estado</Th>
                <Th textAlign="center">Recomendable IA</Th>
                {canEdit && <Th textAlign="right">Acciones</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((m) => (
                <Tr key={m.id} _hover={{ bg: "crema.50" }}>
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
                        <Pill size={14} color="#ef7d54" />
                      </Flex>
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          {m.nombre}
                        </Text>
                        {m.marca && (
                          <Text fontSize="xs" color="lucera.textMuted">
                            {m.marca}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontSize="sm"
                    color="lucera.textMuted"
                    fontStyle="italic"
                  >
                    {m.generico}
                  </Td>
                  <Td>
                    <Badge colorScheme={catTone[m.categoria]}>
                      {m.categoria}
                    </Badge>
                  </Td>
                  {/* <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontFamily="mono"
                    fontSize="xs"
                  >
                    {m.dosisPorKg ?? "—"}
                  </Td> */}
                  <Td>
                    <Badge
                      colorScheme={m.estado === "disponible" ? "green" : "gray"}
                    >
                      {m.estado}
                    </Badge>
                  </Td>
                  <Td textAlign="center">
                    {m.recomendable ? (
                      <CheckCircle2
                        size={16}
                        color="#2f9e6b"
                        style={{ display: "inline" }}
                      />
                    ) : (
                      <XCircle
                        size={16}
                        color="#7b5a48"
                        style={{ display: "inline" }}
                      />
                    )}
                  </Td>
                  {canEdit && (
                    <Td textAlign="right">
                      <IconButton
                        aria-label="Editar"
                        size="sm"
                        variant="ghost"
                        icon={<Pencil size={14} />}
                        onClick={() => openEdit(m)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        size="sm"
                        variant="ghost"
                        color="peligro.500"
                        icon={<Trash2 size={14} />}
                        onClick={() => setToDelete(m)}
                      />
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {data.length} medicamentos
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
            {editing ? "Editar medicamento" : "Nuevo medicamento"}
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
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input name="nombre" defaultValue={editing?.nombre} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Genérico</FormLabel>
                  <Input name="generico" defaultValue={editing?.generico} />
                </FormControl>
                <FormControl>
                  <FormLabel>Marca</FormLabel>
                  <Input name="marca" defaultValue={editing?.marca} />
                </FormControl>
                <FormControl>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    name="categoria"
                    defaultValue={editing?.categoria ?? "Analgésico"}
                  >
                    {cats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Dosis por kg</FormLabel>
                  <Input
                    name="dosisPorKg"
                    placeholder="10-15 mg/kg cada 6h"
                    defaultValue={editing?.dosisPorKg}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Notas</FormLabel>
                  <Input name="notas" defaultValue={editing?.notas} />
                </FormControl>
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="estado"
                    defaultValue={editing?.estado ?? "disponible"}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="descontinuado">Descontinuado</option>
                  </Select>
                </FormControl>
                <FormControl
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  borderWidth="1px"
                  borderColor="lucera.border"
                  borderRadius="md"
                  p={3}
                >
                  <FormLabel fontSize="xs" mb={0}>
                    Recomendable IA
                  </FormLabel>
                  <Switch
                    isChecked={recomendable}
                    onChange={(e) => setRecomendable(e.target.checked)}
                    colorScheme="naranja"
                  />
                </FormControl>
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
        title="Eliminar medicamento"
        description={
          <>
            ¿Eliminar <strong>{toDelete?.nombre}</strong> del catálogo? La IA
            dejará de sugerirlo.
          </>
        }
        onConfirm={() => {
          if (toDelete) {
            setData(data.filter((x) => x.id !== toDelete.id));
            toast.success("Medicamento eliminado");
          }
        }}
      />
    </DashboardLayout>
  );
}
