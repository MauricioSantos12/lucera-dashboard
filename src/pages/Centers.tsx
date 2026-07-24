import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Center, countriesCities } from "@/lib/mockData";
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

const typeTone: Record<Center["type"], string> = {
  Hospital: "vino",
  Clínica: "naranja",
  Farmacia: "amarillo",
  Laboratorio: "blue",
  Urgencias: "red",
};

// El GET no expone país por centro, solo ciudad. Lo derivamos de
// countriesCities (mockData.ts) para poder filtrar por país.
const cityToCountry: Record<string, string> = Object.entries(
  countriesCities
).reduce((acc, [country, cities]) => {
  cities.forEach((c) => {
    acc[c] = country;
  });
  return acc;
}, {} as Record<string, string>);

type CenterRow = Center & { country: string };

export default function Centers() {
  const { user, token, getValidToken } = useAuth();
  const isAdmin = user?.role === "Admin";
  const canEdit = isAdmin;
  const canExport = user?.role !== "Invitado";

  const {
    data: centersData,
    loading: centersLoading,
    error: centersError,
    refetch: refetchCenters,
  } = useFetchAll<CenterApi>(token ? "/api/centers" : null);
  const data = useMemo(
    () =>
      (centersData?.items ?? []).map(
        (c): CenterRow => ({
          id: c.id,
          name: c.name,
          type: centerTypeToEs[c.type] ?? "Hospital",
          city: c.city,
          country: cityToCountry[c.city] ?? "Otro",
          address: c.address,
          phone: c.phone,
          hours: c.hours,
          recommended: c.recommended,
        })
      ),
    [centersData]
  );

  const countries = useMemo(
    () => [...new Set(data.map((c) => c.country))].sort(),
    [data]
  );
  const cities = useMemo(
    () => [...new Set(data.map((c) => c.city))].sort(),
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
  const [type, setType] = useState("todos");
  const [countryFilter, setCountryFilter] = useState("todos");
  const [cityFilter, setCityFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<CenterRow | null>(null);
  const [toDelete, setToDelete] = useState<CenterRow | null>(null);
  const [recommended, setRecommended] = useState(false);
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((c) => {
      const okQ = `${c.name} ${c.city} ${c.address}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okT = type === "todos" || c.type === type;
      const okCountry = countryFilter === "todos" || c.country === countryFilter;
      const okCity = cityFilter === "todos" || c.city === cityFilter;
      return okQ && okT && okCountry && okCity;
    });
  }, [data, q, type, countryFilter, cityFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (c: CenterRow | null) => {
    setEditing(c);
    setRecommended(c?.recommended ?? false);
    setCountry(c?.country ?? "");
    onOpen();
  };

  const onSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const common = {
      name: String(fd.get("name")),
      city: String(fd.get("city")),
      address: String(fd.get("address") || "") || undefined,
      phone: String(fd.get("phone") || "") || undefined,
      tier: String(fd.get("tier") || "") || undefined,
      recommended: recommended,
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
          country: countryEsToApi[country] ?? (country || undefined),
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
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              {(Object.keys(typeTone) as Center["type"][]).map((t) => (
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
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="todos">Todos los países</option>
              {countries.map((p) => (
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
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="todos">Todas las ciudades</option>
              {cities.map((c) => (
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
              Nombre: c.name,
              Tipo: c.type,
              Ciudad: c.city,
              Dirección: c.address,
              Teléfono: c.phone,
              Horarios: c.hours,
              Recomendado: c.recommended ? "Sí" : "No",
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
                        {c.name}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={typeTone[c.type]}>{c.type}</Badge>
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontSize="sm"
                  >
                    {c.city}
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontSize="xs"
                    color="lucera.textMuted"
                  >
                    {c.address}
                  </Td>
                  <Td
                    display={{ base: "none", md: "table-cell" }}
                    fontFamily="mono"
                    fontSize="xs"
                  >
                    {c.phone}
                  </Td>
                  <Td
                    display={{ base: "none", lg: "table-cell" }}
                    fontSize="xs"
                  >
                    {c.hours}
                  </Td>
                  <Td textAlign="center">
                    {c.recommended ? (
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
                  Tipo ({editing.type}) y horarios ({editing.hours}) no son
                  editables desde el API todavía.
                </Text>
              )}
              <SimpleGrid columns={2} spacing={3}>
                <FormControl gridColumn="span 2" isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input name="name" defaultValue={editing?.name} />
                </FormControl>
                {!editing && (
                  <FormControl isRequired>
                    <FormLabel>País</FormLabel>
                    <Select
                      name="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Seleccionar país"
                    >
                      {Object.keys(countriesCities).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl isRequired>
                  <FormLabel>Ciudad</FormLabel>
                  <Input name="city" defaultValue={editing?.city} />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Dirección</FormLabel>
                  <Input name="address" defaultValue={editing?.address} />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input name="phone" defaultValue={editing?.phone} />
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
                    isChecked={recommended}
                    onChange={(e) => setRecommended(e.target.checked)}
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
            ¿Eliminar <strong>{toDelete?.name}</strong> del directorio? La IA
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
