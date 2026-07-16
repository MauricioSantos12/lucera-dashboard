import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import { LoadingState } from "@/components/LoadingState";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type {
  SpecialtyApi,
  NameInPayload,
  DeleteResponse,
  PaginatedResponse,
} from "@/lib/apiTypes";
import {
  Box,
  Button,
  Flex,
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
  SimpleGrid,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Search, Stethoscope, Plus, Pencil, Trash2 } from "lucide-react";

export default function Specialties() {
  const { user, token, getValidToken } = useAuth();
  const isAdmin = user?.rol === "Admin";
  const canEdit = user?.rol !== "Invitado" && isAdmin;

  // /api/specialties/all trae { id, name } (necesario para editar/eliminar);
  // /api/specialties (string[]) es solo para selects, no para administrar.
  const {
    data: specialtiesData,
    loading,
    error,
    refetch,
  } = useFetch<PaginatedResponse<SpecialtyApi>>(
    token ? "/api/specialties/all?page=1&page_limit=100" : null
  );
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
  const filtered = useMemo(
    () =>
      specialties.filter((s) =>
        `${s.id} ${s.name}`.toLowerCase().includes(q.toLowerCase())
      ),
    [specialties, q]
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<SpecialtyApi | null>(null);
  const [toDelete, setToDelete] = useState<SpecialtyApi | null>(null);
  const [saving, setSaving] = useState(false);

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
      <Flex gap={3} mb={4} align="end" wrap="wrap">
        <Box flex={1} minW={{ md: "220px" }} maxW={{ md: "360px" }}>
          <Text fontSize="xs" fontWeight={600} mb={1}>
            Buscar
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Search size={16} />
            </InputLeftElement>
            <Input
              placeholder="Nombre de la especialidad…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              bg="lucera.surface"
            />
          </InputGroup>
        </Box>
        {canEdit && (
          <Button
            colorScheme="vino"
            leftIcon={<Plus size={16} />}
            onClick={() => openEdit(null)}
          >
            Nueva especialidad
          </Button>
        )}
      </Flex>

      {loading && !specialtiesData ? (
        <LoadingState label="Cargando especialidades…" />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={3}>
            {filtered.map((s) => (
              <StatCard key={s.id} p={3}>
                <Flex align="center" gap={3}>
                  <Flex
                    h={9}
                    w={9}
                    flexShrink={0}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    bg="naranja.50"
                    color="naranja.500"
                  >
                    <Icon as={Stethoscope} boxSize={4} />
                  </Flex>
                  <Box minW={0} flex={1}>
                    <Text fontSize="sm" fontWeight={700} noOfLines={2}>
                      {s.name}
                    </Text>
                  </Box>
                  {canEdit && (
                    <Flex flexShrink={0} gap={0.5}>
                      <IconButton
                        aria-label="Editar"
                        size="xs"
                        variant="ghost"
                        icon={<Pencil size={12} />}
                        onClick={() => openEdit(s)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        size="xs"
                        variant="ghost"
                        color="peligro.500"
                        icon={<Trash2 size={12} />}
                        onClick={() => setToDelete(s)}
                      />
                    </Flex>
                  )}
                </Flex>
              </StatCard>
            ))}
          </SimpleGrid>
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
          <Text mt={4} fontSize="xs" color="lucera.textMuted">
            {filtered.length} de {specialties.length} especialidades
          </Text>
        </>
      )}

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
            <Button type="submit" colorScheme="vino" isLoading={saving}>
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
