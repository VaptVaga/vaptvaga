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
        "primary": "#0066FF", // Azul Elétrico
        "primary-container": "#E6F0FF",
        "on-primary": "#ffffff",
        "on-primary-container": "#001B4D",
        
        "secondary": "#00C89A", // Mint Green (Sucesso / Confirmado)
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
      },
      fontFamily: {
        "headline": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "8px", 
        "sm": "4px",
        "md": "8px",
        "lg": "8px", 
        "xl": "8px", 
        "2xl": "12px",
        "3xl": "16px",
        "full": "9999px"
      },
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
