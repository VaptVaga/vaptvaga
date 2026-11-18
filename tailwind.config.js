import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Material 3 Tokens
        "primary": {
          DEFAULT: "#0066FF", // Azul Elétrico
          foreground: "#ffffff",
          dark: "#004ac6",
          accent: "#2563eb",
        },
        "primary-dark": "#004ac6",
        "primary-accent": "#2563eb",
        "primary-container": "#E6F0FF",
        "on-primary": "#ffffff",
        "on-primary-container": "#001B4D",

        "secondary": {
          DEFAULT: "#00C89A", // Mint Green (Sucesso / Confirmado)
          foreground: "#ffffff",
        },
        "secondary-container": "#E6FAF4",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#003A2D",

        "tertiary": "#FF5A5F", // Vibrant Coral (Urgente / Alerta)
        "tertiary-container": "#FFEFEB",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#4D0A0F",

        "surface": "#ffffff", // Branco
        "surface-dim": "#F2F4F7",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#F8F9FA",
        "surface-container": "#F2F4F7", // Cinza Claro
        "surface-container-high": "#E9ECEF",
        "surface-container-highest": "#DEE2E6",

        "on-surface": "#0A132B", // Deep Navy
        "on-surface-variant": "#495057",
        "inverse-surface": "#0A132B",
        "inverse-on-surface": "#ffffff",

        "outline": "#CED4DA",
        "outline-variant": "#E9ECEF",

        "background": "#F2F4F7", // Cinza Claro
        "on-background": "#0A132B", // Deep Navy

        "error": "#FF5A5F", // Vibrant Coral
        "on-error": "#ffffff",
        "error-container": "#FFEFEB",
        "on-error-container": "#4D0A0F",

        "primary-fixed": "#E6F0FF",
        "primary-fixed-dim": "#B3D1FF",
        "on-primary-fixed": "#001B4D",
        "on-primary-fixed-variant": "#004BCC",

        "secondary-fixed": "#E6FAF4",
        "secondary-fixed-dim": "#99EBD6",
        "on-secondary-fixed": "#003A2D",
        "on-secondary-fixed-variant": "#009975",

        "tertiary-fixed": "#FFEFEB",
        "tertiary-fixed-dim": "#FFBDBD",
        "on-tertiary-fixed": "#4D0A0F",
        "on-tertiary-fixed-variant": "#CC484C",

        // Semantic UI Aliases (shadcn/ui & internal components)
        "foreground": "#0A132B",
        "border": "#E9ECEF",
        "input": "#E9ECEF",
        "ring": "#0066FF",
        "card": {
          DEFAULT: "#ffffff",
          foreground: "#0A132B",
        },
        "popover": {
          DEFAULT: "#ffffff",
          foreground: "#0A132B",
        },
        "muted": {
          DEFAULT: "#F2F4F7",
          foreground: "#495057",
        },
        "accent": {
          DEFAULT: "#E6F0FF",
          foreground: "#001B4D",
        },
        "destructive": {
          DEFAULT: "#FF5A5F",
          foreground: "#ffffff",
        },
        "success": {
          DEFAULT: "#00C89A",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "display": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "12px",
        "sm": "6px",
        "md": "12px",
        "lg": "16px",
        "xl": "20px",
        "2xl": "24px",
        "3xl": "32px",
        "full": "9999px",
      },
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
