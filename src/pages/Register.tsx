import { useState } from "react";
import {
  Box,
  Button,
  Container,
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
import { ArrowLeft } from "lucide-react";
import logoSymbol from "@/assets/lucera-symbol.jpg";
import { paisesCiudades, segurosMedicos } from "@/lib/mockData";
import { toast } from "@/lib/toast";

export default function Register() {
  const navigate = useNavigate();
  const [pais, setPais] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Registro exitoso. Ya puedes iniciar sesión.");
    navigate("/dashboard");
  };

  return (
    <Box minH="100vh" bg="crema.50">
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
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl gridColumn="span 2" isRequired>
                <FormLabel>Nombre completo</FormLabel>
                <Input name="nombre" placeholder="Ej: María Mendoza" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Teléfono (WhatsApp)</FormLabel>
                <Input name="telefono" placeholder="+507 6XXX-XXXX" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" placeholder="correo@ejemplo.com" />
              </FormControl>
              <FormControl>
                <FormLabel>Relación con el niño</FormLabel>
                <Select name="relacion" defaultValue="Madre">
                  {["Madre", "Padre", "Tutor", "Abuelo/a"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>País</FormLabel>
                <Select
                  name="pais"
                  placeholder="Seleccionar país"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                >
                  {Object.keys(paisesCiudades).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Ciudad</FormLabel>
                <Select name="ciudad" placeholder="Seleccionar ciudad">
                  {(paisesCiudades[pais] ?? []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Seguro médico</FormLabel>
                <Select name="seguro" placeholder="Sin seguro">
                  {segurosMedicos.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>ID del seguro</FormLabel>
                <Input name="seguroId" placeholder="Número de póliza" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input name="password" type="password" placeholder="Mínimo 6 caracteres" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirmar contraseña</FormLabel>
                <Input name="confirmPassword" type="password" placeholder="Repetir contraseña" />
              </FormControl>
            </SimpleGrid>

            <Text fontSize="xs" color="lucera.textMuted" mt={4} textAlign="center">
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
