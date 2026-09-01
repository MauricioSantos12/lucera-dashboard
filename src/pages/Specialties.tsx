import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import { LoadingState } from "@/components/LoadingState";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import type {
  SpecialtyApi,
  NameInPayload,
  DeleteResponse,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
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
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Search, Stethoscope, Plus, Pencil, Trash2 } from "lucide-react";

export default function Specialties() {
  const { user, token, getValidToken } = useAuth();
  const isAdmin = user?.role === "Admin";
  const canEdit = user?.role !== "Invitado" && isAdmin;

  // /api/specialties/all trae { id, name } (necesario para editar/eliminar);
  // /api/specialties (string[]) es solo para selects, no para administrar.
  const {
    data: specialtiesData,
    loading,
    error,
    refetch,
  } = useFetchAll<SpecialtyApi>(token ? "/api/specialties/all" : null);
  const specialties = useMemo(
    () => specialtiesData?.items ?? [],
    [specialtiesData]
  );

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar las especialidades", {
        description: error,
      });
    }
  }, [error]);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const filtered = useMemo(() => {
    return specialties.filter((s) =>
      `${s.id} ${s.name}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [specialties, q]);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<SpecialtyApi | null>(null);
  const [toDelete, setToDelete] = useState<SpecialtyApi | null>(null);
  const [saving, setSaving] = useState(false);
  // Loading breve para dar feedback al cambiar el filtro o tras crear/editar/eliminar.
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashLoading = useCallback(() => {
    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearching(false), 450);
  }, []);
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);
  // Al cambiar la búsqueda: volver a la primera página y mostrar loading breve.
  useEffect(() => {
    setPage(1);
    flashLoading();
  }, [q, flashLoading]);

  const openEdit = (s: SpecialtyApi | null) => {
    setEditing(s);
    onOpen();
  };

  const handleSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const payload: NameInPayload = { name: String(fd.get("name")) };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      if (editing) {
        await apiFetch(`/api/specialties/${editing.id}`, freshToken, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Especialidad actualizada");
      } else {
        await apiFetch("/api/specialties", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Especialidad creada");
      }
      onClose();
      setEditing(null);
      refetch();
      flashLoading();
    } catch (err) {
      const isDuplicate =
        err instanceof Error && err.message.startsWith("Error 409");
      toast.error(
        editing
          ? "No se pudo actualizar la especialidad"
          : "No se pudo crear la especialidad",
        {
          description: isDuplicate
            ? "Ya existe una especialidad con ese nombre."
            : err instanceof Error
            ? err.message
            : undefined,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Especialidades"
      subtitle="Especialidades médicas soportadas por el triaje"
    >
      <StatCard>
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={3}
          align={{ sm: "center" }}
          justify="space-between"
          mb={4}
        >
          <Box>
            <Heading size="sm" fontFamily="heading">
              Directorio de especialidades
            </Heading>
            <Text fontSize="xs" color="lucera.textMuted">
              {filtered.length} de {specialties.length} especialidades
            </Text>
          </Box>
          <HStack gap={3} w={{ base: "100%", sm: "auto" }}>
            <InputGroup size="sm" maxW={{ sm: "260px" }}>
              <InputLeftElement pointerEvents="none">
                <Search size={14} />
              </InputLeftElement>
              <Input
                placeholder="Buscar especialidad…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
            {canEdit && (
              <Button
                size="sm"
                colorScheme="brand"
                leftIcon={<Plus size={16} />}
                onClick={() => openEdit(null)}
                flexShrink={0}
              >
                Nueva
              </Button>
            )}
          </HStack>
        </Flex>

        {(loading && !specialtiesData) || searching ? (
          <LoadingState label="Cargando especialidades…" />
        ) : (
          <>
            <TableContainer
              borderWidth="1px"
              borderColor="lucera.border"
              borderRadius="md"
            >
              <Table size="sm">
                <Thead bg="cream.100">
                  <Tr>
                    <Th>Especialidad</Th>
                    {canEdit && <Th textAlign="right">Acciones</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {paginated.map((s) => (
                    <Tr key={s.id} _hover={{ bg: "cream.50" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Flex
                            h={8}
                            w={8}
                            flexShrink={0}
                            borderRadius="lg"
                            align="center"
                            justify="center"
                            bg="accent.50"
                            color="accent.500"
                          >
                            <Icon as={Stethoscope} boxSize={4} />
                          </Flex>
                          <Text fontSize="sm" fontWeight={600}>
                            {s.name}
                          </Text>
                        </HStack>
                      </Td>
                      {canEdit && (
                        <Td textAlign="right">
                          <IconButton
                            aria-label="Editar"
                            size="sm"
                            variant="ghost"
                            icon={<Pencil size={14} />}
                            onClick={() => openEdit(s)}
                          />
                          <IconButton
                            aria-label="Eliminar"
                            size="sm"
                            variant="ghost"
                            color="danger.500"
                            icon={<Trash2 size={14} />}
                            onClick={() => setToDelete(s)}
                          />
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {filtered.length === 0 && (
              <Text
                mt={6}
                fontSize="sm"
                color="lucera.textMuted"
                textAlign="center"
              >
                No hay resultados.
              </Text>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </StatCard>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(e.currentTarget as HTMLFormElement);
          }}
        >
          <ModalHeader>
            {editing ? "Editar especialidad" : "Nueva especialidad"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                name="name"
                defaultValue={editing?.name}
                placeholder="Ej: Cardiología pediátrica"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={2} onClick={onClose} isDisabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={saving}>
              {editing ? "Actualizar" : "Crear"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar especialidad"
        description={
          <>
            ¿Eliminar <strong>{toDelete?.name}</strong>? Si está en uso por
            algún médico, el backend rechazará el borrado.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(
              `/api/specialties/${toDelete.id}`,
              freshToken,
              { method: "DELETE" }
            );
            toast.success("Especialidad eliminada");
            refetch();
            flashLoading();
          } catch (err) {
            const inUse =
              err instanceof Error && err.message.startsWith("Error 409");
            toast.error("No se pudo eliminar la especialidad", {
              description: inUse
                ? "Está en uso por al menos un médico."
                : err instanceof Error
                ? err.message
                : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
