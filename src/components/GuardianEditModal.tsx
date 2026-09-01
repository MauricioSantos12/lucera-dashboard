import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { useFetchAll } from "@/hooks/useFetchAll";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import { Relationship, AccountStatus } from "@/lib/mockData";
import { useGeo } from "@/hooks/useGeo";
import {
  relationshipFromApi,
  relationshipToApi,
  statusFromApi,
  statusToApi,
  planFromApi,
  countryFromApi,
  countryToApi,
  genderToValue,
} from "@/lib/apiMappings";
import type {
  GuardianApi,
  GuardianPatchPayload,
  InsuranceRef,
  PlanApi,
} from "@/lib/apiTypes";

interface GuardianEditModalProps {
  // Cuando es distinto de null, el modal está abierto para ese acudiente.
  guardian: GuardianApi | null;
  onClose: () => void;
  onSaved?: () => void;
}

// Modal de edición de acudiente reutilizable: hace el PATCH contra el backend.
// El email y el teléfono no se pueden editar vía API.
export function GuardianEditModal({
  guardian,
  onClose,
  onSaved,
}: GuardianEditModalProps) {
  const { getValidToken } = useAuth();
  const { data: insurancesData } = useFetchAll<InsuranceRef>(
    guardian ? "/api/insurances" : null
  );
  const insurances = useMemo(
    () => insurancesData?.items ?? [],
    [insurancesData]
  );

  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [saving, setSaving] = useState(false);
  const { countryNames, statesOf } = useGeo();

  useEffect(() => {
    setCountry(
      guardian ? countryFromApi[guardian.country] ?? guardian.country : ""
    );
    setProvince(guardian?.province ?? "");
  }, [guardian]);

  const handleSave = async (form: HTMLFormElement) => {
    if (!guardian) return;
    const fd = new FormData(form);
    const insuranceId = String(fd.get("insurance") || "");
    const policyNumber = String(fd.get("policyNumber") || "");
    const address = String(fd.get("address") || "") || undefined;

    // El email no se puede editar → no viaja en el PATCH.
    const payload: GuardianPatchPayload = {
      name: String(fd.get("name")),
      country: countryToApi[country] ?? (country || undefined),
      city: String(fd.get("city")),
      province: province || undefined,
      address: address,
      relationship: relationshipToApi[fd.get("relationship") as Relationship],
      status: statusToApi[fd.get("status") as AccountStatus],
      plan: (String(fd.get("plan") || "") || undefined) as PlanApi | undefined,
      insuranceId: insuranceId ? Number(insuranceId) : undefined,
      policyNumber: policyNumber || undefined,
      gender: String(fd.get("gender") || "") || undefined,
    };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      await apiFetch<GuardianApi>(
        `/api/guardians/${guardian.id}`,
        freshToken,
        { method: "PATCH", body: JSON.stringify(payload) }
      );
      toast.success("Acudiente actualizado");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error("No se pudo actualizar el acudiente", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!guardian} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar acudiente</ModalHeader>
        <ModalCloseButton />
        {guardian && (
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
                  <Input name="name" defaultValue={guardian.name} />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono (WhatsApp)</FormLabel>
                  <Input
                    value={guardian.phone}
                    isReadOnly
                    bg="cream.50"
                  />
                  <Text fontSize="xs" color="lucera.textMuted" mt={1}>
                    El teléfono no se puede editar vía API.
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={guardian.email}
                    isReadOnly
                    bg="cream.50"
                  />
                  <Text fontSize="xs" color="lucera.textMuted" mt={1}>
                    El correo no se puede editar.
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Relación</FormLabel>
                  <Select
                    name="relationship"
                    defaultValue={relationshipFromApi[guardian.relationship] ?? "Madre"}
                  >
                    {["Madre", "Padre", "Tutor", "Abuelo/a", "Otro"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Género</FormLabel>
                  <Select
                    name="gender"
                    defaultValue={genderToValue(guardian.gender)}
                    placeholder="Seleccionar género"
                  >
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                    <option value="other">Otro</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>País</FormLabel>
                  <Select
                    name="country"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setProvince("");
                    }}
                    placeholder="Seleccionar país"
                  >
                    {countryNames.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Provincia</FormLabel>
                  <Select
                    name="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Seleccionar provincia"
                    isDisabled={!country}
                  >
                    {statesOf(country).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Ciudad</FormLabel>
                  <Input
                    name="city"
                    placeholder="Ciudad / distrito"
                    defaultValue={guardian.city}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="address"
                    placeholder="Calle, edificio, referencia…"
                    defaultValue={guardian.address ?? undefined}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Seguro médico</FormLabel>
                  <Select
                    name="insurance"
                    defaultValue={guardian.insurance?.id ?? ""}
                    placeholder="Sin seguro"
                  >
                    {insurances.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Número de póliza</FormLabel>
                  <Input
                    name="policyNumber"
                    placeholder="Opcional"
                    defaultValue={guardian.insurance?.policyNumber ?? undefined}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Plan</FormLabel>
                  <Select name="plan" defaultValue={guardian.plan}>
                    {(
                      ["free", "premium_monthly", "premium_annual"] as const
                    ).map((p) => (
                      <option key={p} value={p}>
                        {planFromApi[p]}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="status"
                    defaultValue={statusFromApi[guardian.status] ?? "activa"}
                  >
                    <option value="activa">Activa</option>
                    <option value="suspendida">Suspendida</option>
                    <option value="baja">Baja</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                onClick={onClose}
                mr={2}
                isDisabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={saving}>
                Actualizar
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
