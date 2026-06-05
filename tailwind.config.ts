import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FAF7F4", dark: "#F5EFE8" },
        blush: "#F2D9CE",
        rose: { DEFAULT: "#C9796A", dark: "#B5604F" },
        charcoal: "#1C1917",
        warm: "#44403C",
        muted: "#A8A29E",
        gray: {
          50: "#FAF7F4",
          100: "#F5EFE8",
          200: "#E7DDD6",
          300: "#D6CBC2",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
          950: "#0C0A09",
        },
        brand: {
          50: "#FEF7F5",
          100: "#FCEEE9",
          200: "#F2D9CE",
          300: "#E8B5A5",
          400: "#D89787",
          500: "#C9796A",
          600: "#B5604F",
          700: "#964D3F",
          800: "#773D32",
          900: "#5C2F27",
          950: "#3D1F1A",
        },
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "2px",
        md: "3px",
        lg: "4px",
        xl: "6px",
        "2xl": "8px",
        "3xl": "10px",
      },
      boxShadow: {
        warm: "0 20px 60px rgba(28,25,23,.1)",
        "warm-sm": "0 4px 20px rgba(28,25,23,.06)",
        "warm-lg": "0 30px 80px rgba(28,25,23,.12)",
      },
    },
  },
  plugins: [],
};
export default config;
