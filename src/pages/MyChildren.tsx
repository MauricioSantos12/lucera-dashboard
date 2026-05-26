import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { acudientes, NinoPaciente } from "@/lib/mockData";
import {
  Box, Button, Flex, FormControl, FormLabel, HStack, IconButton, Input, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, SimpleGrid,
  Text, Badge, useDisclosure, Heading, VStack, Wrap, WrapItem,
} from "@chakra-ui/react";
import { Baby, Droplet, AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion(Box);

export default function MyChildren() {
  const { user } = useAuth();
  const ac = acudientes.find(a => a.id === user?.refId) ?? acudientes[0];
  const [ninos, setNinos] = useState<NinoPaciente[]>(ac.ninos);
  const [editing, setEditing] = useState<NinoPaciente | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [toDelete, setToDelete] = useState<NinoPaciente | null>(null);

  const openEdit = (n: NinoPaciente | null) => { setEditing(n); onOpen(); };

  const onSave = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const alergias = String(fd.get("alergias") || "").split(",").map(s => s.trim()).filter(Boolean);
    const condiciones = String(fd.get("condiciones") || "").split(",").map(s => s.trim()).filter(Boolean);
    const next: NinoPaciente = {
      id: editing?.id ?? `N-${Date.now()}`,
      nombre: String(fd.get("nombre")),
      fechaNacimiento: String(fd.get("fechaNacimiento")),
      pesoKg: Number(fd.get("pesoKg")) || undefined,
      tipoSangre: (fd.get("tipoSangre") as NinoPaciente["tipoSangre"]) || undefined,
      alergias, condiciones,
    };
    setNinos(editing ? ninos.map(n => n.id === editing.id ? next : n) : [...ninos, next]);
    toast.success(editing ? "Datos actualizados" : "Hijo/a registrado");
    onClose(); setEditing(null);
  };

  return (
    <DashboardLayout title="Mis hijos" subtitle="Niños registrados en tu cuenta de Lucera">
      <Flex justify="flex-end" mb={4}>
        <Button colorScheme="naranja" leftIcon={<Plus size={16} />} onClick={() => openEdit(null)}>Registrar hijo/a</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <AnimatePresence mode="popLayout">
          {ninos.map(n => {
            const edad = Math.floor((Date.now() - new Date(n.fechaNacimiento).getTime()) / (365.25 * 86400000));
            return (
              <MotionDiv key={n.id} layout
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.18 }}
              >
                <StatCard>
                  <HStack align="flex-start" spacing={3}>
                    <Flex h={12} w={12} borderRadius="xl" bg="naranja.50" align="center" justify="center" flexShrink={0}><Baby size={22} color="#ef7d54" /></Flex>
                    <Box flex={1}>
                      <Flex justify="space-between" align="flex-start">
                        <Box>
                          <Heading size="sm" fontFamily="heading">{n.nombre}</Heading>
                          <Text fontSize="xs" color="lucera.textMuted">{edad} años · Nacido {n.fechaNacimiento}</Text>
                        </Box>
                        <HStack spacing={1}>
                          <IconButton aria-label="Editar" size="sm" variant="ghost" icon={<Pencil size={14} />} onClick={() => openEdit(n)} />
                          <IconButton aria-label="Eliminar" size="sm" variant="ghost" color="peligro.500" icon={<Trash2 size={14} />} onClick={() => setToDelete(n)} />
                        </HStack>
                      </Flex>

                      <SimpleGrid columns={2} spacing={3} mt={4}>
                        <Box>
                          <Text fontSize="10px" textTransform="uppercase" color="lucera.textMuted" letterSpacing="wider">Peso</Text>
                          <Text fontWeight={700}>{n.pesoKg ? `${n.pesoKg} kg` : "—"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="10px" textTransform="uppercase" color="lucera.textMuted" letterSpacing="wider">Tipo de sangre</Text>
                          {n.tipoSangre
                            ? <Badge variant="outline"><HStack spacing={1}><Droplet size={10} color="#b91c1c" /><Text fontFamily="mono">{n.tipoSangre}</Text></HStack></Badge>
                            : <Text fontSize="xs" color="lucera.textMuted">—</Text>}
                        </Box>
                      </SimpleGrid>

                      <Box mt={3} pt={3} borderTopWidth="1px" borderColor="lucera.borderSoft">
                        <Text fontSize="10px" textTransform="uppercase" color="lucera.textMuted" letterSpacing="wider" mb={1.5}>Antecedentes</Text>
                        <Wrap spacing={1}>
                          {(n.alergias ?? []).map(a => <WrapItem key={a}><Badge colorScheme="amarillo"><HStack spacing={1}><AlertTriangle size={10} /><Text>{a}</Text></HStack></Badge></WrapItem>)}
                          {(n.condiciones ?? []).map(c => <WrapItem key={c}><Badge colorScheme="blue">{c}</Badge></WrapItem>)}
                          {(!n.alergias?.length && !n.condiciones?.length) && <Text fontSize="xs" color="lucera.textMuted">Sin antecedentes</Text>}
                        </Wrap>
                      </Box>
                    </Box>
                  </HStack>
                </StatCard>
              </MotionDiv>
            );
          })}
        </AnimatePresence>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? "Editar hijo/a" : "Registrar nuevo hijo/a"}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={(e) => { e.preventDefault(); onSave(e.currentTarget); }}>
            <ModalBody>
              <Text fontSize="xs" color="lucera.textMuted" mb={3}>Estos datos permiten a Lucera IA calcular dosis y dar recomendaciones más seguras.</Text>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl gridColumn="span 2" isRequired><FormLabel>Nombre completo</FormLabel><Input name="nombre" defaultValue={editing?.nombre} /></FormControl>
                <FormControl isRequired><FormLabel>Fecha de nacimiento</FormLabel><Input name="fechaNacimiento" type="date" defaultValue={editing?.fechaNacimiento} /></FormControl>
                <FormControl><FormLabel>Peso (kg)</FormLabel><Input name="pesoKg" type="number" step="0.1" min="0" defaultValue={editing?.pesoKg} /></FormControl>
                <FormControl gridColumn="span 2"><FormLabel>Tipo de sangre</FormLabel>
                  <Select name="tipoSangre" defaultValue={editing?.tipoSangre ?? ""} placeholder="Sin especificar">
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormControl>
                <FormControl gridColumn="span 2"><FormLabel>Alergias (separadas por coma)</FormLabel><Input name="alergias" placeholder="Penicilina, Maní…" defaultValue={editing?.alergias?.join(", ")} /></FormControl>
                <FormControl gridColumn="span 2"><FormLabel>Condiciones médicas (separadas por coma)</FormLabel><Input name="condiciones" placeholder="Asma leve…" defaultValue={editing?.condiciones?.join(", ")} /></FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={2} onClick={onClose}>Cancelar</Button>
              <Button type="submit" colorScheme="vino">Guardar</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar registro"
        description={<>¿Eliminar el perfil de <strong>{toDelete?.nombre}</strong>? Se perderá su historial clínico vinculado.</>}
        onConfirm={() => { if (toDelete) { setNinos(ninos.filter(x => x.id !== toDelete.id)); toast.success("Registro eliminado"); } }}
      />
    </DashboardLayout>
  );
}
