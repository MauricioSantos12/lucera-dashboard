import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { medications as seed, Medication } from "@/lib/mockData";
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

const catTone: Record<Medication["category"], string> = {
  Analgésico: "brand",
  Antipirético: "accent",
  Antihistamínico: "blue",
  Antibiótico: "red",
  Antitusivo: "gold",
  Otros: "gray",
};

const cats: Medication["category"][] = [
  "Analgésico",
  "Antipirético",
  "Antihistamínico",
  "Antibiótico",
  "Antitusivo",
  "Otros",
];

export default function Medications() {
  const { user } = useAuth();
  const canEdit = user?.role !== "Invitado";
  const canExport = user?.role !== "Invitado" && user?.role !== "Ventas";
  const [data, setData] = useState<Medication[]>(seed);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Medication | null>(null);
  const [toDelete, setToDelete] = useState<Medication | null>(null);
  const [recommendable, setRecommendable] = useState(true);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((m) => {
      const okQ = `${m.name} ${m.genericName} ${m.brand ?? ""}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okC = cat === "todas" || m.category === cat;
      const okE = status === "todos" || m.status === status;
      return okQ && okC && okE;
    });
  }, [data, q, cat, status]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (m: Medication | null) => {
    setEditing(m);
    setRecommendable(m?.recommendable ?? true);
    onOpen();
  };

  const onSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Medication = {
      id: editing?.id ?? `MED-${data.length + 1}`,
      name: String(fd.get("name")),
      genericName: String(fd.get("genericName")),
      brand: String(fd.get("brand") || "") || undefined,
      category: fd.get("category") as Medication["category"],
      status: fd.get("status") as Medication["status"],
      dosePerKg: String(fd.get("dosePerKg") || "") || undefined,
      notes: String(fd.get("notes") || "") || undefined,
      recommendable,
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
        bg="gold.50"
        borderWidth="1px"
        borderColor="gold.300"
      >
        <AlertIcon color="gold.700" />
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
                  Nombre: m.name,
                  Genérico: m.genericName,
                  Marca: m.brand ?? "",
                  Categoría: m.category,
                  Estado: m.status,
                  "Dosis/kg": m.dosePerKg ?? "",
                  "Recomendable IA": m.recommendable ? "Sí" : "No",
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
              colorScheme="brand"
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
            <Thead bg="cream.100">
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
                <Tr key={m.id} _hover={{ bg: "cream.50" }}>
                  <Td>
                    <HStack>
                      <Flex
                        h={8}
                        w={8}
                        borderRadius="full"
                        bg="accent.50"
                        align="center"
                        justify="center"
                      >
                        <Pill size={14} color="#f08159" />
                      </Flex>
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          {m.name}
                        </Text>
                        {m.brand && (
                          <Text fontSize="xs" color="lucera.textMuted">
                            {m.brand}
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
                    {m.genericName}
                  </Td>
                  <Td>
                    <Badge colorScheme={catTone[m.category]}>
                      {m.category}
                    </Badge>
                  </Td>
                  {/* <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontFamily="mono"
                    fontSize="xs"
                  >
                    {m.dosePerKg ?? "—"}
                  </Td> */}
                  <Td>
                    <Badge
                      colorScheme={m.status === "disponible" ? "green" : "gray"}
                    >
                      {m.status}
                    </Badge>
                  </Td>
                  <Td textAlign="center">
                    {m.recommendable ? (
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
                        color="danger.500"
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
                  <Input name="name" defaultValue={editing?.name} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Genérico</FormLabel>
                  <Input name="genericName" defaultValue={editing?.genericName} />
                </FormControl>
                <FormControl>
                  <FormLabel>Marca</FormLabel>
                  <Input name="brand" defaultValue={editing?.brand} />
                </FormControl>
                <FormControl>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    name="category"
                    defaultValue={editing?.category ?? "Analgésico"}
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
                    name="dosePerKg"
                    placeholder="10-15 mg/kg cada 6h"
                    defaultValue={editing?.dosePerKg}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Notas</FormLabel>
                  <Input name="notes" defaultValue={editing?.notes} />
                </FormControl>
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="status"
                    defaultValue={editing?.status ?? "disponible"}
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
                    isChecked={recommendable}
                    onChange={(e) => setRecommendable(e.target.checked)}
                    colorScheme="accent"
                  />
                </FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={2} onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="brand">
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
            ¿Eliminar <strong>{toDelete?.name}</strong> del catálogo? La IA
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
