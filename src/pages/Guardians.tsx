import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Acudiente, NinoPaciente, Relacion, EstadoCuenta, paisesCiudades } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import {
  relationToEs,
  relationToApi,
  statusToEs,
  statusToApi,
  planToEs,
  planToApi,
  countryApiToEs,
  countryEsToApi,
} from "@/lib/apiMappings";
import type {
  GuardianApi,
  GuardianPatchPayload,
  GuardianCreatePayload,
  InsuranceRef,
  PlanApi,
  DeleteResponse,
} from "@/lib/apiTypes";
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
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { ExportButton } from "@/components/ExportButton";
import { toast } from "@/lib/toast";

const estadoTone = (e: Acudiente["estado"]) =>
  e === "activa" ? "green" : e === "suspendida" ? "yellow" : "red";

function guardianToAcudiente(g: GuardianApi): Acudiente {
  return {
    id: g.id,
    telefono: g.phone,
    email: g.email,
    nombre: g.name,
    relacion: relationToEs[g.relationship] ?? "Tutor",
    pais: countryApiToEs[g.country] ?? g.country,
    ciudad: g.city,
    seguro: g.insurance?.name as Acudiente["seguro"],
    seguroId: g.insurance ? String(g.insurance.id) : undefined,
    estado: statusToEs[g.status] ?? "activa",
    plan: planToEs[g.plan] ?? "Gratuito",
    registrado: g.registeredAt,
    ninos: g.children.map(
      (c): NinoPaciente => ({
        id: c.id,
        nombre: c.name,
        fechaNacimiento: c.birthDate,
        tipoSangre: (c.bloodType ?? undefined) as NinoPaciente["tipoSangre"],
        pesoKg: c.weightKg ?? undefined,
        condiciones: c.conditions,
        alergias: c.allergies,
      })
    ),
  };
}

export default function Guardians() {
  const { user, token, getValidToken } = useAuth();
  // Solo Admin crea/edita/elimina; el resto (Ventas, Médico) es solo lectura.
  const canEdit = user?.rol === "Admin";
  const canExport = user?.rol !== "Invitado";
  const {
    data: guardiansData,
    loading: guardiansLoading,
    error: guardiansError,
    refetch: refetchGuardians,
  } = useFetchAll<GuardianApi>(token ? "/api/guardians" : null);
  const { data: insurancesData } = useFetchAll<InsuranceRef>(
    token ? "/api/insurances" : null
  );
  const seguros = useMemo(() => insurancesData?.items ?? [], [insurancesData]);
  const data = useMemo(
    () => (guardiansData?.items ?? []).map(guardianToAcudiente),
    [guardiansData]
  );

  useEffect(() => {
    if (guardiansError) {
      toast.error("No se pudieron cargar los acudientes", {
        description: guardiansError,
      });
    }
  }, [guardiansError]);

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [paisFilter, setPaisFilter] = useState("todos");
  const [planFilter, setPlanFilter] = useState("todos");
  const [seguroFilter, setSeguroFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<Acudiente | null>(null);
  const [toDelete, setToDelete] = useState<Acudiente | null>(null);
  const [pais, setPais] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    setPage(1);
    return data.filter((a) => {
      const okQ = `${a.nombre} ${a.id} ${a.email} ${a.telefono} ${a.ciudad}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const okE = estado === "todos" || a.estado === estado;
      const okPais = paisFilter === "todos" || a.pais === paisFilter;
      const okPlan = planFilter === "todos" || a.plan === planFilter;
      const okSeguro =
        seguroFilter === "todos" ||
        (seguroFilter === "sin_seguro" ? !a.seguro : a.seguro === seguroFilter);
      return okQ && okE && okPais && okPlan && okSeguro;
    });
  }, [data, q, estado, paisFilter, planFilter, seguroFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (a: Acudiente | null) => {
    setEditing(a);
    setPais(a?.pais ?? "");
    onOpen();
  };

  const handleSave = async (form: HTMLFormElement) => {
    const fd = new FormData(form);

    if (!editing) {
      // name/phone/email son obligatorios; el resto es opcional. Si "plan"
      // es un plan pago, el backend registra el pago correspondiente.
      const seguroIdNew = String(fd.get("seguro") || "");
      const policyNumberNew = String(fd.get("policyNumber") || "");
      const payload: GuardianCreatePayload = {
        name: String(fd.get("nombre")),
        phone: String(fd.get("telefono")),
        email: String(fd.get("email")),
        relationship: relationToApi[fd.get("relacion") as Relacion],
        country: pais || undefined,
        city: String(fd.get("ciudad") || "") || undefined,
        province: pais || undefined,
        status: statusToApi[fd.get("estado") as EstadoCuenta],
        plan: (String(fd.get("plan") || "") || undefined) as
          | PlanApi
          | undefined,
        insuranceId: seguroIdNew ? Number(seguroIdNew) : undefined,
        policyNumber: policyNumberNew || undefined,
      };

      setSaving(true);
      try {
        const freshToken = await getValidToken();
        await apiFetch<GuardianApi>("/api/guardians", freshToken, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Acudiente creado");
        onClose();
        setEditing(null);
        refetchGuardians();
      } catch (err) {
        const isDuplicate =
          err instanceof Error && err.message.startsWith("Error 409");
        toast.error("No se pudo crear el acudiente", {
          description: isDuplicate
            ? "Ya existe un acudiente con ese correo o teléfono."
            : err instanceof Error
            ? err.message
            : undefined,
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    // El PATCH manda todos los campos que tenemos, tal como los acepta el
    // backend (no incluye "phone": no es editable vía API).
    const seguroId = String(fd.get("seguro") || "");
    const policyNumber = String(fd.get("policyNumber") || "");
    const payload: GuardianPatchPayload = {
      name: String(fd.get("nombre")),
      email: String(fd.get("email")),
      country: countryEsToApi[pais] ?? (pais || undefined),
      city: String(fd.get("ciudad")),
      relationship: relationToApi[fd.get("relacion") as Relacion],
      status: statusToApi[fd.get("estado") as EstadoCuenta],
      plan: (String(fd.get("plan") || "") || undefined) as
        | PlanApi
        | undefined,
      insuranceId: seguroId ? Number(seguroId) : undefined,
      policyNumber: policyNumber || undefined,
    };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      await apiFetch<GuardianApi>(`/api/guardians/${editing.id}`, freshToken, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Acudiente actualizado");
      onClose();
      setEditing(null);
      refetchGuardians();
    } catch (err) {
      toast.error("No se pudo actualizar el acudiente", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Acudientes (Tutores)" subtitle="Cuentas titulares">
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
                placeholder="Nombre, teléfono, ciudad…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Estado
            </Text>
            <Select
              w={{ base: "100%", md: "160px" }}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activa">Activos</option>
              <option value="suspendida">Suspendidos</option>
              <option value="baja">De baja</option>
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
              {Object.keys(paisesCiudades).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Plan
            </Text>
            <Select
              w={{ base: "100%", md: "170px" }}
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="todos">Todos los planes</option>
              {["Gratuito", "Premium Mensual", "Premium Anual"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} mb={1}>
              Seguro médico
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={seguroFilter}
              onChange={(e) => setSeguroFilter(e.target.value)}
            >
              <option value="todos">Todos los seguros</option>
              <option value="sin_seguro">Sin seguro</option>
              {seguros.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        <Flex gap={3} mb={4} justify="flex-end" wrap="wrap">
          <ExportButton
            isDisabled={!canExport}
            filename="acudientes-lucera"
            sheetName="Acudientes"
            data={filtered.map((a) => ({
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
            }))}
          />
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

        {guardiansLoading && !guardiansData ? (
          <LoadingState label="Cargando acudientes…" />
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
          </>
        )}
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
                  <Input
                    name="telefono"
                    defaultValue={editing?.telefono}
                    isReadOnly={!!editing}
                    bg={editing ? "crema.50" : undefined}
                  />
                  {editing && (
                    <Text fontSize="xs" color="lucera.textMuted" mt={1}>
                      El teléfono no se puede editar vía API.
                    </Text>
                  )}
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
                    defaultValue={editing?.seguroId ?? ""}
                    placeholder="Sin seguro"
                  >
                    {seguros.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Número de póliza</FormLabel>
                  <Input name="policyNumber" placeholder="Opcional" defaultValue={editing ? undefined : ""} />
                </FormControl>
                <FormControl>
                  <FormLabel>Plan</FormLabel>
                  <Select
                    name="plan"
                    defaultValue={
                      editing ? planToApi[editing.plan] : "free"
                    }
                  >
                    {(["free", "premium_monthly", "premium_annual"] as const).map(
                      (p) => (
                        <option key={p} value={p}>
                          {planToEs[p]}
                        </option>
                      )
                    )}
                  </Select>
                  <Text fontSize="xs" color="lucera.textMuted" mt={1}>
                    Un plan pago registra el pago correspondiente.
                  </Text>
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
              <Button variant="outline" onClick={onClose} mr={2} isDisabled={saving}>
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
        title="Eliminar acudiente"
        description={
          <>
            ¿Seguro que deseas eliminar a <strong>{toDelete?.nombre}</strong>?
            Esta acción desactiva la cuenta: deja de aparecer en el listado,
            pero conserva su historial de chats y pagos.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const freshToken = await getValidToken();
            await apiFetch<DeleteResponse>(
              `/api/guardians/${toDelete.id}`,
              freshToken,
              { method: "DELETE" }
            );
            toast.success("Acudiente eliminado");
            refetchGuardians();
          } catch (err) {
            toast.error("No se pudo eliminar el acudiente", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
