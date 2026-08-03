import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  Textarea,
  Text,
} from "@chakra-ui/react";
import { AuthUser, useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "@/lib/toast";
import type { ChatApi, ChatNotePayload } from "@/lib/apiTypes";

interface ChatNoteModalProps {
  // Cuando es distinto de null, el modal está abierto para ese chat.
  chat: ChatApi | null;
  onClose: () => void;
  onSaved?: () => void;
  user: AuthUser;
}

// Modal para agregar/editar el comentario final del médico sobre un chat.
// Hace PATCH /api/chats/{id}/note; el backend guarda doctorNote, reviewedBy y
// reviewedAt (quién revisó y cuándo).
export function ChatNoteModal({
  chat,
  onClose,
  onSaved,
  user,
}: ChatNoteModalProps) {
  const { getValidToken } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = async (form: HTMLFormElement) => {
    if (!chat) return;
    const fd = new FormData(form);
    const doctorNote = String(fd.get("doctorNote") || "").trim();
    if (!doctorNote) {
      toast.error("Escribe un comentario antes de guardar");
      return;
    }
    const payload: ChatNotePayload = {
      note: doctorNote,
      reviewed_by: user?.id || user?.refId,
    };

    setSaving(true);
    try {
      const freshToken = await getValidToken();
      await apiFetch<ChatApi>(`/api/chats/${chat.id}/note`, freshToken, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Comentario guardado");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error("No se pudo guardar el comentario", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!chat?.doctorNote;

  return (
    <Modal isOpen={!!chat} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditing ? "Editar comentario" : "Agregar comentario"}
        </ModalHeader>
        <ModalCloseButton />
        {chat && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(e.currentTarget);
            }}
          >
            <ModalBody>
              <Text fontSize="sm" color="lucera.textMuted" mb={3}>
                Comentario final sobre la consulta de{" "}
                <strong>{chat.patient}</strong> ({chat.guardian}). Quedará
                registrado con tu nombre y la fecha de revisión.
              </Text>
              <FormControl isRequired>
                <FormLabel>Comentario del médico</FormLabel>
                <Textarea
                  name="doctorNote"
                  rows={5}
                  placeholder="Escribe aquí tu observación final…"
                  defaultValue={chat.doctorNote ?? ""}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                mr={2}
                onClick={onClose}
                isDisabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" colorScheme="vino" isLoading={saving}>
                Guardar
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
