import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { Seo } from "@/components/Seo";
import { countriesCities } from "@/lib/mockData";
import { toast } from "@/lib/toast";
import { apiFetch } from "@/lib/apiClient";
import { relationToApi, countryEsToApi } from "@/lib/apiMappings";
import {
  PLAN_TIERS,
  emptyChild,
  type ChildForm,
} from "@/lib/guardianForm";
import type { Relationship } from "@/lib/mockData";
import type {
  GuardianApi,
  GuardianCreatePayload,
  PatientApi,
  PatientCreatePayload,
  PlanApi,
} from "@/lib/apiTypes";

export default function Register() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [plan, setPlan] = useState("free");
  const [childForms, setChildForms] = useState<ChildForm[]>([]);
  const [loading, setLoading] = useState(false);

  const addChild = () => setChildForms((prev) => [...prev, emptyChild()]);
  const removeChild = (i: number) =>
    setChildForms((prev) => prev.filter((_, idx) => idx !== i));
  const updateChild = (i: number, patch: Partial<ChildForm>) =>
    setChildForms((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const payload: GuardianCreatePayload = {
      name: String(fd.get("name")),
      phone: String(fd.get("phone")),
      email: String(fd.get("email")),
      relationship: relationToApi[fd.get("relationship") as Relationship],
      idNumber: String(fd.get("idNumber") || "") || undefined,
      country: countryEsToApi[country] ?? (country || undefined),
      province: String(fd.get("province") || "") || undefined,
      city: String(fd.get("city") || "") || undefined,
      address: String(fd.get("address") || "") || undefined,
      gender: gender || undefined,
      plan: (plan || undefined) as PlanApi | undefined,
      medico_cabecera_nombre:
        String(fd.get("medico_cabecera_nombre") || "") || undefined,
      medico_cabecera_celular:
        String(fd.get("medico_cabecera_celular") || "") || undefined,
    };

    const validChildren = childForms.filter(
      (c) => c.name.trim() && c.birthDate
    );

    setLoading(true);
    try {
      const created = await apiFetch<GuardianApi>("/api/guardians", null, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      let childFailures = 0;
      for (const c of validChildren) {
        const childPayload: PatientCreatePayload = {
          guardianId: created.id,
          name: c.name.trim(),
          birthDate: c.birthDate,
          weightKg: c.weightKg ? Number(c.weightKg) : undefined,
          idNumber: c.idNumber.trim() || undefined,
          school: c.school.trim() || undefined,
          allergies: c.allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          conditions: c.conditions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
        try {
          await apiFetch<PatientApi>("/api/patients", null, {
            method: "POST",
            body: JSON.stringify(childPayload),
          });
        } catch {
          childFailures++;
        }
      }

      if (childFailures > 0) {
        toast.error(
          `Cuenta creada, pero ${childFailures} hijo(s) no se pudieron registrar`,
          { description: "Podrás agregarlos más tarde desde tu cuenta." }
        );
      } else {
        toast.success("Registro exitoso. Ya puedes iniciar sesión.");
      }
      navigate("/dashboard");
    } catch (err) {
      const isDuplicate =
        err instanceof Error && err.message.startsWith("Error 409");
      toast.error("No se pudo completar el registro", {
        description: isDuplicate
          ? "Ya existe una cuenta con ese correo o teléfono."
          : err instanceof Error
          ? err.message
          : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="crema.50">
      <Seo
        title="Registrarse"
        description="Crea tu cuenta en Lucera y recibe orientación pediátrica por WhatsApp con seguimiento de un pediatra. Planes para cada familia en Panamá."
        path="/register"
      />
      {/* Navbar */}
      <Flex
        as="nav"
        position="sticky"
        top={0}
        zIndex={50}
        bg="white"
        borderBottomWidth="1px"
        borderColor="lucera.border"
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
      >
        <HStack
          as={RouterLink}
          to="/"
          spacing={3}
          style={{ textDecoration: "none" }}
        >
          <Box
            h={10}
            w={10}
            borderRadius="lg"
            bg="white"
            overflow="hidden"
            display="grid"
            placeItems="center"
            borderWidth="1px"
            borderColor="lucera.border"
          >
            <Image
              src={logoSymbol}
              alt="Lucera"
              boxSize="36px"
              objectFit="contain"
            />
          </Box>
          <Heading size="md" fontFamily="heading" color="vino.500">
            Lucera
          </Heading>
        </HStack>
        <Button
          as={RouterLink}
          to="/"
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
        >
          Volver al inicio
        </Button>
      </Flex>

      {/* Form */}
      <Container maxW="2xl" py={{ base: 8, md: 12 }}>
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="lucera.border"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
        >
          <VStack spacing={1} mb={6} align="flex-start">
            <Heading size="lg" fontFamily="heading">
              Registro de acudiente
            </Heading>
            <Text fontSize="sm" color="lucera.textMuted">
              Completa tus datos para crear tu cuenta en Lucera.
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            {/* Tus datos */}
            <Text fontSize="sm" fontWeight={700} color="vino.500" mb={1}>
              Tus datos
            </Text>
            <Text fontSize="xs" color="lucera.textMuted" mb={3}>
              Para personalizar la orientación de tus hijos.
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl gridColumn={{ md: "span 2" }} isRequired>
                <FormLabel>Nombre completo</FormLabel>
                <Input name="name" placeholder="Tu nombre" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Teléfono (WhatsApp)</FormLabel>
                <Input name="phone" placeholder="+507 6XXX-XXXX" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cédula / documento</FormLabel>
                <Input name="idNumber" placeholder="8-123-4567" />
              </FormControl>
              <FormControl>
                <FormLabel>Parentesco</FormLabel>
                <Select name="relationship" defaultValue="Madre">
                  {["Madre", "Padre", "Tutor", "Abuelo/a"].map((r) => (
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
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="Prefiero no decir"
                >
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="other">Otro</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>País</FormLabel>
                <Select
                  name="country"
                  placeholder="Selecciona…"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {Object.keys(countriesCities).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Provincia / Departamento</FormLabel>
                <Input name="province" placeholder="Provincia / departamento" />
              </FormControl>
              <FormControl gridColumn={{ md: "span 2" }}>
                <FormLabel>Ciudad</FormLabel>
                <Input name="city" placeholder="Ciudad" />
              </FormControl>
              <FormControl gridColumn={{ md: "span 2" }}>
                <FormLabel>Dirección</FormLabel>
                <Input
                  name="address"
                  placeholder="Calle, casa/apto, referencia"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Pediatra de cabecera (opcional)</FormLabel>
                <Input
                  name="medico_cabecera_nombre"
                  placeholder="Nombre del pediatra"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Celular del pediatra</FormLabel>
                <Input name="medico_cabecera_celular" placeholder="Celular" />
              </FormControl>
            </SimpleGrid>

            {/* Elige tu plan */}
            <Divider my={5} borderColor="lucera.borderSoft" />
            <Text fontSize="sm" fontWeight={700} color="vino.500" mb={1}>
              Elige tu plan
            </Text>
            <Text fontSize="xs" color="lucera.textMuted" mb={3}>
              Puedes cambiarlo luego.
            </Text>
            <VStack align="stretch" spacing={2}>
              {PLAN_TIERS.map((t) => {
                const active = plan === t.value;
                return (
                  <Flex
                    key={t.value}
                    as="button"
                    type="button"
                    onClick={() => setPlan(t.value)}
                    justify="space-between"
                    align="center"
                    px={4}
                    py={3}
                    borderWidth="1px"
                    borderRadius="md"
                    textAlign="left"
                    borderColor={active ? "vino.500" : "lucera.border"}
                    bg={active ? "naranja.50" : "white"}
                    _hover={active ? undefined : { bg: "crema.50" }}
                    transition="all 120ms"
                  >
                    <Box>
                      <Text fontWeight={700} fontSize="sm">
                        {t.label}
                      </Text>
                      <Text fontSize="xs" color="lucera.textMuted">
                        {t.hint}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight={700} color="vino.500">
                        ${t.price}
                      </Text>
                      <Text fontSize="xs" color="lucera.textMuted">
                        {t.period}
                      </Text>
                    </Box>
                  </Flex>
                );
              })}
            </VStack>

            {/* Tus hijos */}
            <Divider my={5} borderColor="lucera.borderSoft" />
            <Text fontSize="sm" fontWeight={700} color="vino.500" mb={1}>
              Tus hijos
            </Text>
            <Text fontSize="xs" color="lucera.textMuted" mb={3}>
              Opcional — puedes agregarlos ahora o más tarde; Lucera también irá
              completando estos datos durante la conversación.
            </Text>
            <VStack align="stretch" spacing={3}>
              {childForms.map((c, i) => (
                <Box
                  key={i}
                  borderWidth="1px"
                  borderStyle="dashed"
                  borderColor="lucera.border"
                  borderRadius="md"
                  p={3}
                >
                  <Flex justify="flex-end" mb={1}>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<Trash2 size={12} />}
                      onClick={() => removeChild(i)}
                    >
                      quitar
                    </Button>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <FormControl gridColumn={{ md: "span 2" }} isRequired>
                      <FormLabel>Nombre</FormLabel>
                      <Input
                        placeholder="Nombre del hijo/a"
                        value={c.name}
                        onChange={(e) =>
                          updateChild(i, { name: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <Input
                        type="date"
                        value={c.birthDate}
                        onChange={(e) =>
                          updateChild(i, { birthDate: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Peso (kg)</FormLabel>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={c.weightKg}
                        onChange={(e) =>
                          updateChild(i, { weightKg: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Cédula / documento</FormLabel>
                      <Input
                        placeholder="Documento del paciente"
                        value={c.idNumber}
                        onChange={(e) =>
                          updateChild(i, { idNumber: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Centro educativo</FormLabel>
                      <Input
                        placeholder="Escuela o colegio"
                        value={c.school}
                        onChange={(e) =>
                          updateChild(i, { school: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl gridColumn={{ md: "span 2" }}>
                      <FormLabel>Alergias (separadas por coma)</FormLabel>
                      <Input
                        placeholder="Ej: Penicilina (o ninguna)"
                        value={c.allergies}
                        onChange={(e) =>
                          updateChild(i, { allergies: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl gridColumn={{ md: "span 2" }}>
                      <FormLabel>Condiciones / antecedentes</FormLabel>
                      <Input
                        placeholder="Opcional"
                        value={c.conditions}
                        onChange={(e) =>
                          updateChild(i, { conditions: e.target.value })
                        }
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>
              ))}
              <Button
                variant="outline"
                colorScheme="vino"
                leftIcon={<Plus size={16} />}
                onClick={addChild}
              >
                Agregar hijo
              </Button>
              <Text fontSize="xs" color="lucera.textMuted" textAlign="center">
                Puedes dejarlo vacío y continuar.
              </Text>
            </VStack>

            <Text
              fontSize="xs"
              color="lucera.textMuted"
              mt={5}
              textAlign="center"
            >
              Al registrarte aceptas nuestros{" "}
              <Text
                as="a"
                href="https://pdfobject.com/pdf/sample.pdf"
                target="_blank"
                rel="noopener noreferrer"
                color="vino.500"
                fontWeight={600}
                _hover={{ textDecoration: "underline" }}
              >
                términos y condiciones
              </Text>
              .
            </Text>

            <Button
              type="submit"
              colorScheme="vino"
              w="100%"
              mt={4}
              size="lg"
              isLoading={loading}
              loadingText="Creando cuenta…"
            >
              Crear cuenta
            </Button>

            <Text fontSize="sm" color="lucera.textMuted" mt={4} textAlign="center">
              ¿Ya tienes cuenta?{" "}
              <Text
                as={RouterLink}
                to="/dashboard"
                color="vino.500"
                fontWeight={600}
                _hover={{ textDecoration: "underline" }}
              >
                Iniciar sesión
              </Text>
            </Text>
          </form>
        </Box>
      </Container>
    </Box>
  );
}
