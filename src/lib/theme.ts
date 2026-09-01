import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Lucera brand palette (color scales are named by their semantic role):
//   brand   #6c122b  wine — primary / brand
//   accent  #f08159  coral — accent
//   cream   #f5e7d3  soft background surfaces
//   gold    #f6ca35  warning / highlight
//   success / danger / info — status colors
//   triageGreen / triageYellow / triageRed — triage levels

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: "#fbeaef",
    100: "#f3c5d1",
    200: "#e89aae",
    300: "#d96f8b",
    400: "#b94464",
    500: "#6c122b", // base — exact Brandbook
    600: "#5e0f25",
    700: "#4d0c1e",
    800: "#3c0917",
    900: "#28060f",
  },
  accent: {
    50: "#fdeee7",
    100: "#fbd5c4",
    200: "#f7b89a",
    300: "#f49a72",
    400: "#f28e6a",
    500: "#f08159", // base — exact Brandbook
    600: "#d96a44",
    700: "#b85636",
    800: "#8d4127",
    900: "#5d2b1a",
  },
  cream: {
    50: "#fdf8f0",
    100: "#faefdc",
    200: "#f9ecda",
    300: "#f5e7d3", // base — exact Brandbook (brand background)
    400: "#e9d2b1",
    500: "#d8bb8e",
    600: "#b89968",
    700: "#8c7148",
    800: "#5e4a2d",
    900: "#332815",
  },
  gold: {
    50: "#fff8e1",
    100: "#feeeb6",
    200: "#fde288",
    300: "#fbd75a",
    400: "#f8d047",
    500: "#f6ca35", // base — exact Brandbook
    600: "#e0b426",
    700: "#b08a18",
    800: "#806211",
    900: "#503c08",
  },
  success: { 500: "#2f9e6b" },
  warning: { 500: "#d97706" },
  danger: { 500: "#b91c1c" },
  info: { 500: "#1e6e8b" },
  // Triage
  triageGreen: { 500: "#2f9e6b" },
  triageYellow: { 500: "#f8cc37" },
  triageRed: { 500: "#b91c1c" },
};

const fonts = {
  heading: `'Fraunces', Georgia, serif`,
  body: `'Figtree', ui-sans-serif, system-ui, sans-serif`,
  mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`,
};

const semanticTokens = {
  colors: {
    "lucera.bg": { default: "white" },
    "lucera.surface": { default: "white" },
    "lucera.surfaceAlt": { default: "#fbeaef" }, // brand 50
    "lucera.border": { default: "#f3c5d1" }, // brand 100
    "lucera.borderSoft": { default: "#fbeaef" },
    "lucera.text": { default: "#28060f" }, // brand 900
    "lucera.textMuted": { default: "#6b4a55" },
    "lucera.brand": { default: "brand.500" },
    "lucera.brandSoft": { default: "brand.50" },
    "lucera.accent": { default: "accent.500" },
    "lucera.accentSoft": { default: "accent.50" },
    "lucera.warning": { default: "gold.500" },
    "lucera.warningSoft": { default: "gold.50" },
    "lucera.success": { default: "success.500" },
    "lucera.danger": { default: "danger.500" },
    "lucera.info": { default: "info.500" },
    "lucera.sidebar": { default: "brand.700" },
    "lucera.sidebarFg": { default: "white" },
    "lucera.sidebarHover": { default: "accent.500" },
    "lucera.sidebarActive": { default: "accent.500" },
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
    defaultProps: { colorScheme: "brand" },
    variants: {
      solid: (props: { colorScheme?: string }) => {
        if (props.colorScheme === "accent") {
          return {
            bg: "accent.500",
            color: "white",
            _hover: { bg: "accent.600" },
            _active: { bg: "accent.700" },
          };
        }
        if (props.colorScheme === "gold") {
          return {
            bg: "gold.500",
            color: "brand.900",
            _hover: { bg: "gold.600" },
          };
        }
        return {
          bg: "brand.500",
          color: "white",
          _hover: { bg: "accent.500" },
          _active: { bg: "accent.600" },
        };
      },
      outline: {
        borderColor: "brand.500",
        color: "brand.500",
        _hover: {
          bg: "accent.500",
          color: "white",
          borderColor: "accent.500",
        },
      },
      ghost: {
        color: "brand.500",
        _hover: { bg: "accent.50", color: "accent.600" },
      },
      brand: { bg: "brand.500", color: "white", _hover: { bg: "accent.500" } },
      accent: { bg: "accent.500", color: "white", _hover: { bg: "brand.500" } },
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
    defaultProps: { variant: "outline", focusBorderColor: "brand.500" },
    variants: {
      outline: {
        field: {
          borderColor: "lucera.border",
          bg: "white",
          _hover: { borderColor: "accent.300" },
        },
      },
    },
  },
  Select: {
    defaultProps: { variant: "outline", focusBorderColor: "brand.500" },
    variants: {
      outline: {
        field: { borderColor: "lucera.border", bg: "white" },
      },
    },
  },
  Textarea: {
    defaultProps: { variant: "outline", focusBorderColor: "brand.500" },
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
    defaultProps: { colorScheme: "brand" },
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

// Brand gradients (Brandbook 2026). Ready-to-use Chakra strings:
//   <Box bgGradient={luceraGradients.warm} />
// The flat gradients always start from cream (per the manual). `warm` is the
// warm mesh for heroes/large backgrounds.
export const luceraGradients = {
  // Warm mesh with the full palette — heroes and large backgrounds.
  warm: "linear(135deg, brand.500 0%, accent.500 55%, gold.500 100%)",
  // Brand gradients over cream (background → color).
  accent: "linear(180deg, cream.300 0%, accent.500 100%)",
  brand: "linear(180deg, cream.300 0%, brand.500 100%)",
  gold: "linear(180deg, cream.300 0%, gold.500 100%)",
  // Variant for small chips/icons (more saturated, no cream).
  chipAccent: "linear(135deg, accent.400 0%, brand.500 100%)",
  chipGold: "linear(135deg, gold.400 0%, accent.500 100%)",
  chipBrand: "linear(135deg, brand.400 0%, brand.700 100%)",
} as const;
