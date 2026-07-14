import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          bg: "#0B0F19",          // Premium deep dark background
          card: "#111827",        // Sleek card background
          cardHover: "#1F2937",   // Card hover color
          primary: "#6366F1",     // Indigo core
          secondary: "#3B82F6",   // Blue secondary
          accent: "#10B981",      // Emerald accent
          warning: "#F59E0B",     // Amber warning
          border: "#1F2937",      // Dark border
          text: "#F9FAFB",        // White text
          muted: "#9CA3AF",       // Gray text
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
