import { useState } from "react";
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
} from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import { genderToValue } from "@/lib/apiMappings";
import type {
  PatientApi,
  PatientPatchPayload,
  BloodType,
} from "@/lib/apiTypes";

interface PatientEditModalProps {
  // Cuando es distinto de null, el modal está abierto para ese paciente.
  patient: PatientApi | null;
  onClose: () => void;
  onSaved?: () => void;
}

// Modal de edición de paciente/niño reutilizable: hace el PATCH contra el backend.
export function PatientEditModal({
  patient,
  onClose,
  onSaved,
}: PatientEditModalProps) {
  const { getValidToken } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = async (form: HTMLFormElement) => {
    if (!patient) return;
    const fd = new FormData(form);
    const allergies = String(fd.get("allergies") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const conditions = String(fd.get("conditions") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const weightKg = Number(fd.get("weightKg")) || undefined;
    const bloodType = (fd.get("bloodType") as BloodType) || undefined;
    const address = String(fd.get("address") || "") || undefined;
    const school = String(fd.get("school") || "") || undefined;

    const payload: PatientPatchPayload = {
      name: String(fd.get("name")),
      birthDate: String(fd.get("birthDate")),
      weightKg,
      bloodType,
      conditions,
      allergies,
      address,
      school,
      gender: String(fd.get("gender") || "") || undefined,
    };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      await apiFetch<PatientApi>(`/api/patients/${patient.id}`, freshToken, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Niño actualizado");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error("No se pudo actualizar el niño", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!patient} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar niño</ModalHeader>
        <ModalCloseButton />
        {patient && (
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
                  <Input name="name" defaultValue={patient.name} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <Input
                    name="birthDate"
                    type="date"
                    defaultValue={patient.birthDate}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Peso (kg)</FormLabel>
                  <Input
                    name="weightKg"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={patient.weightKg ?? undefined}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tipo de sangre</FormLabel>
                  <Select
                    name="bloodType"
                    defaultValue={patient.bloodType ?? ""}
                    placeholder="Sin especificar"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Género</FormLabel>
                  <Select
                    name="gender"
                    defaultValue={genderToValue(patient.gender)}
                    placeholder="Seleccionar género"
                  >
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                    <option value="other">Otro</option>
                  </Select>
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Alergias (separadas por coma)</FormLabel>
                  <Input
                    name="allergies"
                    placeholder="Penicilina, Maní…"
                    defaultValue={patient.allergies?.join(", ")}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Condiciones médicas (separadas por coma)</FormLabel>
                  <Input
                    name="conditions"
                    placeholder="Asma leve…"
                    defaultValue={patient.conditions?.join(", ")}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="address"
                    placeholder="Calle, edificio, referencia…"
                    defaultValue={patient.address ?? undefined}
                  />
                </FormControl>
                <FormControl gridColumn="span 2">
                  <FormLabel>Centro educativo</FormLabel>
                  <Input
                    name="school"
                    placeholder="Nombre del colegio / escuela"
                    defaultValue={patient.school ?? undefined}
                  />
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
              <Button type="submit" colorScheme="vino" isLoading={saving}>
                Actualizar
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
