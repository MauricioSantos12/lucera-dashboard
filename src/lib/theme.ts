import { extendTheme, transition, type ThemeConfig } from "@chakra-ui/react";

// Lucera brand palette
//   vino    #6d122b   (primary / brand)
//   naranja #ef7d54   (accent)
//   crema   #f4e3ce   (background / soft surfaces)
//   amarillo#f8cc37   (warning / highlight)
//   white / black

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const colors = {
  vino: {
    50: "#fbeaef",
    100: "#f3c5d1",
    200: "#e89aae",
    300: "#d96f8b",
    400: "#b94464",
    500: "#6d122b", // base
    600: "#5e0f25",
    700: "#4d0c1e",
    800: "#3c0917",
    900: "#28060f",
  },
  naranja: {
    50: "#fdeee7",
    100: "#fbd5c4",
    200: "#f7b89a",
    300: "#f49a72",
    400: "#f08a60",
    500: "#ef7d54", // base
    600: "#d96a44",
    700: "#b85636",
    800: "#8d4127",
    900: "#5d2b1a",
  },
  crema: {
    50: "#fdf8f0",
    100: "#faefdc",
    200: "#f7e8cf",
    300: "#f4e3ce", // base
    400: "#e9d2b1",
    500: "#d8bb8e",
    600: "#b89968",
    700: "#8c7148",
    800: "#5e4a2d",
    900: "#332815",
  },
  amarillo: {
    50: "#fff8e1",
    100: "#feeeb6",
    200: "#fde288",
    300: "#fbd75a",
    400: "#fad146",
    500: "#f8cc37", // base
    600: "#e0b426",
    700: "#b08a18",
    800: "#806211",
    900: "#503c08",
  },
  exito: { 500: "#2f9e6b" },
  alerta: { 500: "#d97706" },
  peligro: { 500: "#b91c1c" },
  info: { 500: "#1e6e8b" },
  // Triage
  triajeVerde: { 500: "#2f9e6b" },
  triajeAmarillo: { 500: "#f8cc37" },
  triajeRojo: { 500: "#b91c1c" },
};

const fonts = {
  heading: `'Coben', 'Fraunces', Georgia, serif`,
  body: `'Figtree', ui-sans-serif, system-ui, sans-serif`,
  mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`,
};

const semanticTokens = {
  colors: {
    "lucera.bg": { default: "white" },
    "lucera.surface": { default: "white" },
    "lucera.surfaceAlt": { default: "#fbeaef" }, // vino 50
    "lucera.border": { default: "#f3c5d1" }, // vino 100
    "lucera.borderSoft": { default: "#fbeaef" },
    "lucera.text": { default: "#28060f" }, // vino 900
    "lucera.textMuted": { default: "#6b4a55" },
    "lucera.brand": { default: "vino.500" },
    "lucera.brandSoft": { default: "vino.50" },
    "lucera.accent": { default: "naranja.500" },
    "lucera.accentSoft": { default: "naranja.50" },
    "lucera.warning": { default: "amarillo.500" },
    "lucera.warningSoft": { default: "amarillo.50" },
    "lucera.success": { default: "exito.500" },
    "lucera.danger": { default: "peligro.500" },
    "lucera.info": { default: "info.500" },
    "lucera.sidebar": { default: "vino.700" },
    "lucera.sidebarFg": { default: "white" },
    "lucera.sidebarHover": { default: "naranja.500" },
    "lucera.sidebarActive": { default: "naranja.500" },
  },
};

const styles = {
  global: {
    "html, body, #root": {
      bg: "lucera.bg",
      color: "lucera.text",
      minHeight: "100%",
    },
    "*::placeholder": { color: "lucera.textMuted" },
    body: { fontFeatureSettings: `"cv02","cv03","cv04","cv11"` },
    ".tabular": { fontVariantNumeric: "tabular-nums" },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 600,
      borderRadius: "lg",
      transition: "all 0.3s ease-in-out",
    },
    defaultProps: { colorScheme: "vino" },
    variants: {
      solid: (props: any) => {
        if (props.colorScheme === "naranja") {
          return {
            bg: "naranja.500",
            color: "white",
            _hover: { bg: "naranja.600" },
            _active: { bg: "naranja.700" },
          };
        }
        if (props.colorScheme === "amarillo") {
          return {
            bg: "amarillo.500",
            color: "vino.900",
            _hover: { bg: "amarillo.600" },
          };
        }
        return {
          bg: "vino.500",
          color: "white",
          _hover: { bg: "naranja.500" },
          _active: { bg: "naranja.600" },
        };
      },
      outline: {
        borderColor: "vino.500",
        color: "vino.500",
        _hover: {
          bg: "naranja.500",
          color: "white",
          borderColor: "naranja.500",
        },
      },
      ghost: {
        color: "vino.500",
        _hover: { bg: "naranja.50", color: "naranja.600" },
      },
      brand: { bg: "vino.500", color: "white", _hover: { bg: "naranja.500" } },
      accent: { bg: "naranja.500", color: "white", _hover: { bg: "vino.500" } },
    },
  },
  Heading: {
    baseStyle: {
      fontFamily: "heading",
      color: "lucera.text",
      letterSpacing: "tight",
    },
  },
  Input: {
    defaultProps: { variant: "outline", focusBorderColor: "vino.500" },
    variants: {
      outline: {
        field: {
          borderColor: "lucera.border",
          bg: "white",
          _hover: { borderColor: "naranja.300" },
        },
      },
    },
  },
  Select: {
    defaultProps: { variant: "outline", focusBorderColor: "vino.500" },
    variants: {
      outline: {
        field: { borderColor: "lucera.border", bg: "white" },
      },
    },
  },
  Textarea: {
    defaultProps: { variant: "outline", focusBorderColor: "vino.500" },
    variants: {
      outline: { borderColor: "lucera.border", bg: "white" },
    },
  },
  Badge: {
    baseStyle: {
      textTransform: "none",
      fontWeight: 600,
      borderRadius: "md",
      px: 2,
      py: "2px",
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: "lucera.surface",
        borderWidth: "1px",
        borderColor: "lucera.border",
        borderRadius: "xl",
        boxShadow: "0 1px 2px rgba(40,6,15,0.04)",
      },
    },
  },
  Tabs: {
    defaultProps: { colorScheme: "vino" },
  },
  Modal: {
    baseStyle: {
      dialog: { borderRadius: "xl", bg: "lucera.surface" },
      header: { fontFamily: "heading" },
    },
  },
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  semanticTokens,
  styles,
  components,
});
