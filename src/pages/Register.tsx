import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ArrowLeft, Plus, Trash2, MessageCircle } from "lucide-react";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { Seo } from "@/components/Seo";
import { toast } from "@/lib/toast";
import { apiFetch } from "@/lib/apiClient";
import { countryEsToApi, countryApiToEs } from "@/lib/apiMappings";
import {
  PLAN_TIERS,
  BILLING_CYCLES,
  isPaidPlan,
  emptyChild,
  type ChildForm,
} from "@/lib/guardianForm";
import type {
  BillingCycle,
  GeoCountry,
  PortalRegisterInfoResponse,
  PortalRegisterPayload,
} from "@/lib/apiTypes";
import { LoadingState } from "@/components/LoadingState";
import { whatsappUrl } from "@/lib/whatsapp";

const WHATSAPP_URL = whatsappUrl();
const MIN_LENGTH = 8;

// Lee el token del fragmento (#token=…), donde lo pone el portal-link (fuera de
// logs/Referer). Puro cliente; nunca viaja al servidor por la URL.
function tokenFromHash(): string | null {
  const hash = window.location.hash.replace(/^#/, "");
  return new URLSearchParams(hash).get("token");
}

// Estado de validación del link.
type LinkState =
  | { kind: "loading" }
  | { kind: "no-token" }
  | { kind: "used" } // ya activada / link consumido
  | { kind: "invalid"; message: string }
  | { kind: "ok"; info: PortalRegisterInfoResponse };

export default function Register() {
  const navigate = useNavigate();
  const token = useMemo(tokenFromHash, []);

  const [link, setLink] = useState<LinkState>({ kind: "loading" });
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [geo, setGeo] = useState<GeoCountry[]>([]);
  const [gender, setGender] = useState("");
  const [plan, setPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [childForms, setChildForms] = useState<ChildForm[]>([]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Precarga: valida el token y trae los datos para el formulario.
  useEffect(() => {
    if (!token) {
      setLink({ kind: "no-token" });
      return;
    }
    let alive = true;
    (async () => {
      try {
        const info = await apiFetch<PortalRegisterInfoResponse>(
          "/portal/register/info",
          null,
          { method: "POST", body: JSON.stringify({ token }) }
        );
        if (!alive) return;
        if (info.hasPassword) {
          setLink({ kind: "used" });
          return;
        }
        setLink({ kind: "ok", info });
        // El catálogo geo (países + provincias). El register token da acceso a
        // /api/geo aunque el acudiente aún no tenga sesión.
        try {
          const catalog = await apiFetch<GeoCountry[]>("/api/geo", token);
          if (alive) setGeo(catalog);
        } catch {
          /* sin catálogo: el país/provincia quedan sin opciones, no bloquea */
        }
      } catch (err) {
        if (!alive) return;
        const msg = err instanceof Error ? err.message : "";
        if (/410|already used|used/i.test(msg)) setLink({ kind: "used" });
        else
          setLink({
            kind: "invalid",
            message: /expir/i.test(msg)
              ? "El link expiró. Pide uno nuevo."
              : "El link no es válido. Pide uno nuevo.",
          });
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  // Derivados del catálogo geo (misma mecánica que el hook useGeo del panel).
  const countryNames = useMemo(() => geo.map((c) => c.name), [geo]);
  const statesOf = useCallback(
    (name: string): string[] => {
      const target = countryApiToEs[name] ?? name;
      return geo.find((c) => c.name === target)?.states ?? [];
    },
    [geo]
  );

  // Al cambiar de país se resetea la provincia (las opciones cambian).
  const onCountryChange = (value: string) => {
    setCountry(value);
    setProvince("");
  };

  const addChild = () => setChildForms((prev) => [...prev, emptyChild()]);
  const removeChild = (i: number) =>
    setChildForms((prev) => prev.filter((_, idx) => idx !== i));
  const updateChild = (i: number, patch: Partial<ChildForm>) =>
    setChildForms((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < MIN_LENGTH) {
      toast.error(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
      return;
    }
    if (password !== confirm) {
      toast.error("La confirmación no coincide con la contraseña");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const validChildren = childForms.filter((c) => c.name.trim() && c.birthDate);

    const payload: PortalRegisterPayload = {
      token,
      password,
      plan_name: plan,
      billing_cycle: isPaidPlan(plan) ? billingCycle : undefined,
      guardian: {
        full_name: String(fd.get("name")),
        id_number: String(fd.get("idNumber") || "") || undefined,
        relationship_type: String(fd.get("relationship") || "") || undefined,
        email: String(fd.get("email") || "") || undefined,
        country: countryEsToApi[country] ?? (country || undefined),
        province: province || undefined,
        city: String(fd.get("city") || "") || undefined,
        address: String(fd.get("address") || "") || undefined,
        gender: gender || undefined,
        medico_nombre: String(fd.get("medico_nombre") || "") || undefined,
        medico_celular: String(fd.get("medico_celular") || "") || undefined,
      },
      children: validChildren.map((c) => ({
        full_name: c.name.trim(),
        birth_date: c.birthDate,
        weight_kg: c.weightKg ? Number(c.weightKg) : undefined,
        id_number: c.idNumber.trim() || undefined,
        school: c.school.trim() || undefined,
        allergies: c.allergies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        conditions: c.conditions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })),
    };

    setLoading(true);
    try {
      await apiFetch("/portal/register", null, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("¡Cuenta activada! Ya puedes iniciar sesión.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error("No se pudo completar el registro", {
        description: /410|used/i.test(msg)
          ? "Este link ya fue usado. Pide uno nuevo."
          : msg || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const info = link.kind === "ok" ? link.info : null;

  return (
    <Box minH="100vh" bg="crema.50">
      <Seo
        noindex
        title="Activar cuenta"
        description="Activa tu cuenta de acudiente en Lucera con el link que recibiste."
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
        <HStack as={RouterLink} to="/" spacing={3} style={{ textDecoration: "none" }}>
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
            <Image src={logoSymbol} alt="Lucera" boxSize="36px" objectFit="contain" />
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

      <Container maxW="2xl" py={{ base: 8, md: 12 }}>
        {/* Estados sin formulario */}
        {link.kind === "loading" && <LoadingState label="Validando tu link…" />}

        {(link.kind === "no-token" || link.kind === "invalid") && (
          <MessageCard
            title="Necesitas un link de invitación"
            body={
              link.kind === "invalid"
                ? link.message
                : "Para crear tu cuenta necesitas el link que te enviamos. Escríbenos por WhatsApp y te lo compartimos."
            }
          />
        )}

        {link.kind === "used" && (
          <MessageCard
            title="Esta cuenta ya está activa"
            body="Tu cuenta ya tiene contraseña. Inicia sesión para continuar."
            action={
              <Button as={RouterLink} to="/dashboard" colorScheme="vino">
                Iniciar sesión
              </Button>
            }
          />
        )}

        {link.kind === "ok" && (
          <Box
            bg="white"
            borderWidth="1px"
            borderColor="lucera.border"
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
          >
            <VStack spacing={1} mb={6} align="flex-start">
              <Heading size="lg" fontFamily="heading">
                Activa tu cuenta
              </Heading>
              <Text fontSize="sm" color="lucera.textMuted">
                Confirma tus datos y define tu contraseña para entrar a Lucera.
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              {/* Tus datos */}
              <Text fontSize="sm" fontWeight={700} color="vino.500" mb={3}>
                Tus datos
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl gridColumn={{ md: "span 2" }} isRequired>
                  <FormLabel>Nombre completo</FormLabel>
                  <Input name="name" defaultValue={info?.name ?? ""} />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono (WhatsApp)</FormLabel>
                  <Input value={info?.phone ?? ""} isReadOnly bg="crema.50" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" type="email" defaultValue={info?.email ?? ""} />
                </FormControl>
                <FormControl>
                  <FormLabel>Cédula / documento</FormLabel>
                  <Input name="idNumber" placeholder="8-123-4567" />
                </FormControl>
                <FormControl>
                  <FormLabel>Parentesco</FormLabel>
                  <Select name="relationship" defaultValue="madre">
                    <option value="madre">Madre</option>
                    <option value="padre">Padre</option>
                    <option value="tutor">Tutor</option>
                    <option value="abuelo">Abuelo/a</option>
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
                    onChange={(e) => onCountryChange(e.target.value)}
                  >
                    {countryNames.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Provincia / Departamento</FormLabel>
                  <Select
                    name="province"
                    placeholder="Selecciona…"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    isDisabled={!country}
                  >
                    {statesOf(country).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel>Ciudad</FormLabel>
                  <Input name="city" placeholder="Ciudad" />
                </FormControl>
                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel>Dirección</FormLabel>
                  <Input name="address" placeholder="Calle, casa/apto, referencia" />
                </FormControl>
                <FormControl>
                  <FormLabel>Pediatra de cabecera (opcional)</FormLabel>
                  <Input name="medico_nombre" placeholder="Nombre del pediatra" />
                </FormControl>
                <FormControl>
                  <FormLabel>Celular del pediatra</FormLabel>
                  <Input name="medico_celular" placeholder="Celular" />
                </FormControl>
              </SimpleGrid>

              {/* Elige tu plan */}
              <Divider my={5} borderColor="lucera.borderSoft" />
              <Text fontSize="sm" fontWeight={700} color="vino.500" mb={3}>
                Elige tu plan
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
                      <Text
                        fontSize="xs"
                        fontWeight={600}
                        color={active ? "vino.500" : "lucera.textMuted"}
                        flexShrink={0}
                      >
                        {t.maxDependents} niño{t.maxDependents > 1 ? "s" : ""}
                      </Text>
                    </Flex>
                  );
                })}
              </VStack>
              {isPaidPlan(plan) && (
                <FormControl mt={3}>
                  <FormLabel fontSize="sm">Ciclo de cobro</FormLabel>
                  <Select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  >
                    {BILLING_CYCLES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Tus hijos */}
              <Divider my={5} borderColor="lucera.borderSoft" />
              <Text fontSize="sm" fontWeight={700} color="vino.500" mb={1}>
                Tus hijos
              </Text>
              <Text fontSize="xs" color="lucera.textMuted" mb={3}>
                Opcional — puedes agregarlos ahora o más tarde.
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
                          onChange={(e) => updateChild(i, { name: e.target.value })}
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
                  isDisabled={childForms.length >= 5}
                >
                  Agregar hijo
                </Button>
              </VStack>

              {/* Contraseña */}
              <Divider my={5} borderColor="lucera.borderSoft" />
              <Text fontSize="sm" fontWeight={700} color="vino.500" mb={3}>
                Tu contraseña
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Contraseña</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                type="submit"
                colorScheme="vino"
                w="100%"
                mt={6}
                size="lg"
                isLoading={loading}
                loadingText="Activando cuenta…"
              >
                Activar cuenta
              </Button>
            </form>
          </Box>
        )}
      </Container>
    </Box>
  );
}

// Tarjeta de mensaje (sin token / inválido / ya activo), con CTA a WhatsApp.
function MessageCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="lucera.border"
      borderRadius="xl"
      p={{ base: 6, md: 8 }}
      textAlign="center"
    >
      <Heading size="md" fontFamily="heading" mb={2}>
        {title}
      </Heading>
      <Text fontSize="sm" color="lucera.textMuted" mb={5}>
        {body}
      </Text>
      {action ?? (
        <Button
          as="a"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          colorScheme="vino"
          leftIcon={<MessageCircle size={16} />}
        >
          Escribir por WhatsApp
        </Button>
      )}
    </Box>
  );
}
