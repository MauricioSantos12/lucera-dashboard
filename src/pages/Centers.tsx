import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Centro, paisesCiudades } from "@/lib/mockData";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import { centerTypeToEs, countryEsToApi } from "@/lib/apiMappings";
import type {
  CenterApi,
  CenterCreatePayload,
  CenterUpdatePayload,
  DeleteResponse,
} from "@/lib/apiTypes";
import { LoadingState } from "@/components/LoadingState";
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
import { ExportButton } from "@/components/ExportButton";
import { useAuth } from "@/lib/auth";
import { toast } from "@/lib/toast";

const tipoTone: Record<Centro["tipo"], string> = {
  Hospital: "vino",
  Clínica: "naranja",
  Farmacia: "amarillo",
  Laboratorio: "blue",
  Urgencias: "red",
};

// El GET no expone país por centro, solo ciudad. Lo derivamos de
// paisesCiudades (mockData.ts) para poder filtrar por país.
const cityToCountry: Record<string, string> = Object.entries(
  paisesCiudades
).reduce((acc, [pais, ciudades]) => {
  ciudades.forEach((c) => {
    acc[c] = pais;
  });
  return acc;
}, {} as Record<string, string>);

type CentroRow = Centro & { pais: string };

export default function Centers() {
  const { user, token, getValidToken } = useAuth();
  const isAdmin = user?.rol === "Admin";
  const canEdit = isAdmin;
  const canExport = user?.rol !== "Invitado";

  const {
    data: centersData,
    loading: centersLoading,
    error: centersError,
    refetch: refetchCenters,
  } = useFetchAll<CenterApi>(token ? "/api/centers" : null);
  const data = useMemo(
    () =>
      (centersData?.items ?? []).map(
        (c): CentroRow => ({
          id: c.id,
          nombre: c.name,
          tipo: centerTypeToEs[c.type] ?? "Hospital",
          ciudad: c.city,
          pais: cityToCountry[c.city] ?? "Otro",
          direccion: c.address,
          telefono: c.phone,
          horarios: c.hours,
          recomendado: c.recommended,
        })
      ),
    [centersData]
  );

  const paises = useMemo(
    () => [...new Set(data.map((c) => c.pais))].sort(),
    [data]
  );
  const ciudades = useMemo(
    () => [...new Set(data.map((c) => c.ciudad))].sort(),
    [data]
  );

  useEffect(() => {
    if (centersError) {
      toast.error("No se pudieron cargar los centros", {
        description: centersError,
      });
    }
  }, [centersError]);

  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [paisFilter, setPaisFilter] = useState("todos");
  const [ciudadFilter, setCiudadFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<CentroRow | null>(null);
  const [toDelete, setToDelete] = useState<CentroRow | null>(null);
  const [recomendado, setRecomendado] = useState(false);
  const [pais, setPais] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((c) => {
      const okQ = `${c.nombre} ${c.ciudad} ${c.direccion}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okT = tipo === "todos" || c.tipo === tipo;
      const okPais = paisFilter === "todos" || c.pais === paisFilter;
      const okCiudad = ciudadFilter === "todos" || c.ciudad === ciudadFilter;
      return okQ && okT && okPais && okCiudad;
    });
  }, [data, q, tipo, paisFilter, ciudadFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (c: CentroRow | null) => {
    setEditing(c);
    setRecomendado(c?.recomendado ?? false);
    setPais(c?.pais ?? "");
    onOpen();
  };

  const onSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const common = {
      name: String(fd.get("nombre")),
      city: String(fd.get("ciudad")),
      address: String(fd.get("direccion") || "") || undefined,
      phone: String(fd.get("telefono") || "") || undefined,
      tier: String(fd.get("tier") || "") || undefined,
      recommended: recomendado,
    };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      if (editing) {
        const payload: CenterUpdatePayload = common;
        await apiFetch<CenterApi>(`/api/centers/${editing.id}`, freshToken, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Centro actualizado");
      } else {
        const payload: CenterCreatePayload = {
          ...common,
          country: countryEsToApi[pais] ?? (pais || undefined),
        };
        await apiFetch<CenterApi>("/api/centers", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Centro creado");
      }
      onClose();
      setEditing(null);
      refetchCenters();
    } catch (err) {
      toast.error(
        editing ? "No se pudo actualizar el centro" : "No se pudo crear el centro",
        { description: err instanceof Error ? err.message : undefined }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Centros de atención" subtitle="">
      <StatCard>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          mb={4}
          align={{ md: "end" }}
          wrap="wrap"
        >
          <Box flex={1} minW={{ md: "220px" }}>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Buscar
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="Nombre, ciudad o dirección…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Tipo
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
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
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              País
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={paisFilter}
              onChange={(e) => setPaisFilter(e.target.value)}
            >
              <option value="todos">Todos los países</option>
              {paises.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Ciudad
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={ciudadFilter}
              onChange={(e) => setCiudadFilter(e.target.value)}
            >
              <option value="todos">Todas las ciudades</option>
              {ciudades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mb={4} justify="flex-end" wrap="wrap">
          <ExportButton
            isDisabled={!canExport}
            filename="centros-lucera"
            sheetName="Centros"
            data={filtered.map((c) => ({
              ID: c.id,
              Nombre: c.nombre,
              Tipo: c.tipo,
              Ciudad: c.ciudad,
              Dirección: c.direccion,
              Teléfono: c.telefono,
              Horarios: c.horarios,
              Recomendado: c.recomendado ? "Sí" : "No",
            }))}
          />
          {canEdit && (
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

        {centersLoading && !centersData ? (
          <LoadingState label="Cargando centros…" />
        ) : (
          <>
        <TableContainer
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="md"
        >
          <Table size="sm">
            <Thead bg="crema.100">
              <Tr>
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Ciudad</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Dirección</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Teléfono</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Horarios</Th>
                <Th textAlign="center">Recomendado</Th>
                {canEdit && <Th textAlign="right">Acciones</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((c) => (
                <Tr key={c.id} _hover={{ bg: "crema.50" }}>
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
                  {canEdit && (
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
          </>
        )}
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
              {editing && (
                <Text fontSize="xs" color="lucera.textMuted" mb={3}>
                  Tipo ({editing.tipo}) y horarios ({editing.horarios}) no son
                  editables desde el API todavía.
                </Text>
              )}
              <SimpleGrid columns={2} spacing={3}>
                <FormControl gridColumn="span 2" isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input name="nombre" defaultValue={editing?.nombre} />
                </FormControl>
                {!editing && (
                  <FormControl isRequired>
                    <FormLabel>País</FormLabel>
                    <Select
                      name="pais"
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      placeholder="Seleccionar país"
                    >
                      {Object.keys(paisesCiudades).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl isRequired>
                  <FormLabel>Ciudad</FormLabel>
                  <Input name="ciudad" defaultValue={editing?.ciudad} />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Dirección</FormLabel>
                  <Input name="direccion" defaultValue={editing?.direccion} />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input name="telefono" defaultValue={editing?.telefono} />
                </FormControl>
                <FormControl>
                  <FormLabel>Nivel</FormLabel>
                  <Input name="tier" placeholder="Ej: Nivel 1" />
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
              <Button variant="outline" mr={2} onClick={onClose} isDisabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="vino" isLoading={saving}>
                {editing ? "Actualizar" : "Crear"}
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
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(
              `/api/centers/${toDelete.id}`,
              freshToken,
              { method: "DELETE" }
            );
            toast.success("Centro eliminado");
            refetchCenters();
          } catch (err) {
            toast.error("No se pudo eliminar el centro", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
