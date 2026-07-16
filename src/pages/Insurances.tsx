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
  InsuranceRef,
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
import { Search, ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";

export default function Insurances() {
  const { user, token, getValidToken } = useAuth();
  const isAdmin = user?.rol === "Admin";
  const canEdit = user?.rol !== "Invitado" && isAdmin;

  const {
    data: insurancesData,
    loading,
    error,
    refetch,
  } = useFetch<PaginatedResponse<InsuranceRef>>(
    token ? "/api/insurances?page=1&page_limit=100" : null
  );
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );

  useEffect(() => {
    if (error) {
      toast.error("No se pudieron cargar los seguros médicos", {
        description: error,
      });
    }
  }, [error]);

  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      insurances.filter((i) =>
        `${i.id} ${i.name}`.toLowerCase().includes(q.toLowerCase())
      ),
    [insurances, q]
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<InsuranceRef | null>(null);
  const [toDelete, setToDelete] = useState<InsuranceRef | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (i: InsuranceRef | null) => {
    setEditing(i);
    onOpen();
  };

  const handleSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const payload: NameInPayload = { name: String(fd.get("name")) };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      if (editing) {
        await apiFetch(`/api/insurances/${editing.id}`, freshToken, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Seguro médico actualizado");
      } else {
        await apiFetch("/api/insurances", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Seguro médico creado");
      }
      onClose();
      setEditing(null);
      refetch();
    } catch (err) {
      const isDuplicate =
        err instanceof Error && err.message.startsWith("Error 409");
      toast.error(
        editing
          ? "No se pudo actualizar el seguro médico"
          : "No se pudo crear el seguro médico",
        {
          description: isDuplicate
            ? "Ya existe un seguro médico con ese nombre."
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
      title="Seguros médicos"
      subtitle="Directorio de aseguradoras soportadas"
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
              placeholder="Nombre del seguro médico…"
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
            Nuevo seguro
          </Button>
        )}
      </Flex>

      {loading && !insurancesData ? (
        <LoadingState label="Cargando seguros médicos…" />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={3}>
            {filtered.map((i) => (
              <StatCard key={i.id} p={3}>
                <Flex align="center" gap={3}>
                  <Flex
                    h={9}
                    w={9}
                    flexShrink={0}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    bg="vino.50"
                    color="vino.500"
                  >
                    <Icon as={ShieldCheck} boxSize={4} />
                  </Flex>
                  <Box minW={0} flex={1}>
                    <Text fontSize="sm" fontWeight={700} noOfLines={2}>
                      {i.name}
                    </Text>
                  </Box>
                  {canEdit && (
                    <Flex flexShrink={0} gap={0.5}>
                      <IconButton
                        aria-label="Editar"
                        size="xs"
                        variant="ghost"
                        icon={<Pencil size={12} />}
                        onClick={() => openEdit(i)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        size="xs"
                        variant="ghost"
                        color="peligro.500"
                        icon={<Trash2 size={12} />}
                        onClick={() => setToDelete(i)}
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
            {filtered.length} de {insurances.length} seguros médicos
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
            {editing ? "Editar seguro médico" : "Nuevo seguro médico"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input name="name" defaultValue={editing?.name} placeholder="Ej: MAPFRE" />
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
        title="Eliminar seguro médico"
        description={
          <>
            ¿Eliminar <strong>{toDelete?.name}</strong> del directorio? Es un
            borrado suave: se desactiva y deja de aparecer en las listas.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(
              `/api/insurances/${toDelete.id}`,
              freshToken,
              { method: "DELETE" }
            );
            toast.success("Seguro médico eliminado");
            refetch();
          } catch (err) {
            toast.error("No se pudo eliminar el seguro médico", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
