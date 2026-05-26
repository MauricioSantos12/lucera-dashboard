import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { centros as seed, Centro } from "@/lib/mockData";
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
  Text,
  useDisclosure,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { Search, Plus, Building2, Pencil, Trash2, Star } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { useAuth } from "@/lib/auth";
import { toast } from "@/lib/toast";

const tipoTone: Record<Centro["tipo"], string> = {
  Hospital: "vino",
  Clínica: "naranja",
  Farmacia: "amarillo",
  Laboratorio: "blue",
  Urgencias: "red",
};

export default function Centers() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "Admin";
  const [data, setData] = useState<Centro[]>(seed);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Centro | null>(null);
  const [toDelete, setToDelete] = useState<Centro | null>(null);
  const [recomendado, setRecomendado] = useState(false);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((c) => {
      const okQ = `${c.nombre} ${c.ciudad} ${c.direccion}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okT = tipo === "todos" || c.tipo === tipo;
      return okQ && okT;
    });
  }, [data, q, tipo]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (c: Centro | null) => {
    setEditing(c);
    setRecomendado(c?.recomendado ?? false);
    onOpen();
  };

  const onSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Centro = {
      id: editing?.id ?? `C-${10 + data.length}`,
      nombre: String(fd.get("nombre")),
      tipo: fd.get("tipo") as Centro["tipo"],
      ciudad: String(fd.get("ciudad")),
      direccion: String(fd.get("direccion")),
      telefono: String(fd.get("telefono")),
      horarios: String(fd.get("horarios")),
      recomendado,
    };
    setData(
      editing
        ? data.map((x) => (x.id === editing.id ? next : x))
        : [next, ...data]
    );
    toast.success(editing ? "Centro actualizado" : "Centro creado");
    onClose();
    setEditing(null);
  };

  return (
    <DashboardLayout title="Centros de atención" subtitle="">
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
              placeholder="Buscar por nombre, ciudad o dirección…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <Select
            w={{ base: "100%", md: "220px" }}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            {(Object.keys(tipoTone) as Centro["tipo"][]).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          {isAdmin && (
            <Button
              colorScheme="vino"
              variant="solid"
              leftIcon={<Plus size={16} />}
              onClick={() => openEdit(null)}
            >
              Nuevo centro
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
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Ciudad</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Dirección</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Teléfono</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Horarios</Th>
                <Th textAlign="center">Recomendado</Th>
                {isAdmin && <Th textAlign="right">Acciones</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((c) => (
                <Tr key={c.id} _hover={{ bg: "crema.50" }}>
                  <Td fontFamily="mono" fontSize="xs" color="lucera.textMuted">
                    {c.id}
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
                        <Building2 size={14} color="#6d122b" />
                      </Flex>
                      <Text fontSize="sm" fontWeight={600}>
                        {c.nombre}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={tipoTone[c.tipo]}>{c.tipo}</Badge>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontSize="sm"
                  >
                    {c.ciudad}
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontSize="xs"
                    color="lucera.textMuted"
                  >
                    {c.direccion}
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontFamily="mono"
                    fontSize="xs"
                  >
                    {c.telefono}
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontSize="xs"
                  >
                    {c.horarios}
                  </Td>
                  <Td textAlign="center">
                    {c.recomendado ? (
                      <Badge colorScheme="amarillo">
                        <HStack spacing={1}>
                          <Star size={10} fill="currentColor" />
                          <Text>Sí</Text>
                        </HStack>
                      </Badge>
                    ) : (
                      <Text fontSize="xs" color="lucera.textMuted">
                        No
                      </Text>
                    )}
                  </Td>
                  {isAdmin && (
                    <Td textAlign="right">
                      <IconButton
                        aria-label="Editar"
                        size="sm"
                        variant="ghost"
                        icon={<Pencil size={14} />}
                        onClick={() => openEdit(c)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        size="sm"
                        variant="ghost"
                        color="peligro.500"
                        icon={<Trash2 size={14} />}
                        onClick={() => setToDelete(c)}
                      />
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Text mt={3} fontSize="xs" color="lucera.textMuted">
          {filtered.length} de {data.length} centros
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
            {editing ? "Editar centro" : "Nuevo centro"}
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
                <FormControl>
                  <FormLabel>Tipo</FormLabel>
                  <Select name="tipo" defaultValue={editing?.tipo ?? "Clínica"}>
                    {(Object.keys(tipoTone) as Centro["tipo"][]).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Ciudad</FormLabel>
                  <Input name="ciudad" defaultValue={editing?.ciudad} />
                </FormControl>
                <FormControl gridColumn="span 2" isRequired>
                  <FormLabel>Dirección</FormLabel>
                  <Input name="direccion" defaultValue={editing?.direccion} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Teléfono</FormLabel>
                  <Input name="telefono" defaultValue={editing?.telefono} />
                </FormControl>
                <FormControl>
                  <FormLabel>Horarios</FormLabel>
                  <Input
                    name="horarios"
                    defaultValue={editing?.horarios ?? "24/7"}
                  />
                </FormControl>
                <FormControl
                  gridColumn="span 2"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  borderWidth="1px"
                  borderColor="lucera.border"
                  borderRadius="md"
                  p={3}
                >
                  <Box>
                    <FormLabel mb={0}>Recomendado por triaje</FormLabel>
                    <Text fontSize="xs" color="lucera.textMuted">
                      La IA lo sugerirá primero
                    </Text>
                  </Box>
                  <Switch
                    isChecked={recomendado}
                    onChange={(e) => setRecomendado(e.target.checked)}
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
        title="Eliminar centro"
        description={
          <>
            ¿Eliminar <strong>{toDelete?.nombre}</strong> del directorio? La IA
            dejará de derivar pacientes ahí.
          </>
        }
        onConfirm={() => {
          if (toDelete) {
            setData(data.filter((x) => x.id !== toDelete.id));
            toast.success("Centro eliminado");
          }
        }}
      />
    </DashboardLayout>
  );
}
