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
        "primary": "#004ac6",
        "on-surface": "#111c2d",
        "on-tertiary-container": "#ffede6",
        "surface-tint": "#0053db",
        "on-error": "#ffffff",
        "on-secondary-fixed": "#002113",
        "error": "#ba1a1a",
        "on-primary-container": "#eeefff",
        "secondary-container": "#6cf8bb",
        "surface-container-lowest": "#ffffff",
        "outline": "#737686",
        "surface-variant": "#d8e3fb",
        "primary-fixed": "#dbe1ff",
        "on-secondary-fixed-variant": "#005236",
        "surface-container-highest": "#d8e3fb",
        "on-error-container": "#93000a",
        "primary-container": "#2563eb",
        "on-tertiary-fixed": "#360f00",
        "on-background": "#111c2d",
        "surface-container": "#e7eeff",
        "surface": "#f9f9ff",
        "outline-variant": "#c3c6d7",
        "inverse-primary": "#b4c5ff",
        "secondary": "#006c49",
        "primary-fixed-dim": "#b4c5ff",
        "on-tertiary": "#ffffff",
        "surface-bright": "#f9f9ff",
        "secondary-fixed": "#6ffbbe",
        "on-tertiary-fixed-variant": "#7d2d00",
        "surface-dim": "#cfdaf2",
        "background": "#f9f9ff",
        "tertiary": "#943700",
        "surface-container-high": "#dee8ff",
        "on-surface-variant": "#434655",
        "error-container": "#ffdad6",
        "on-primary-fixed-variant": "#003ea8",
        "on-primary-fixed": "#00174b",
        "tertiary-fixed": "#ffdbcd",
        "surface-container-low": "#f0f3ff",
        "on-secondary-container": "#00714d",
        "tertiary-fixed-dim": "#ffb596",
        "secondary-fixed-dim": "#4edea3",
        "inverse-on-surface": "#ecf1ff",
        "on-secondary": "#ffffff",
        "tertiary-container": "#bc4800",
        "on-primary": "#ffffff",
        "inverse-surface": "#263143"
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem", 
        "lg": "2rem", 
        "xl": "3rem", 
        "full": "9999px"
      },
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
