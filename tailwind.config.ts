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
        brand: {
          purple: {
            50: "#F3E8FF",
            100: "#E9D5FF",
            200: "#D8B4FE",
            300: "#C084FC",
            400: "#A855F7",
            500: "#8B00FF",
            600: "#6A00FF",
            700: "#5A00D6",
            800: "#4400A3",
            900: "#2E0070",
            950: "#1A0040",
            DEFAULT: "#6A00FF",
            hover: "#5A00D6",
          },
          secondary: {
            500: "#9B5CFF",
            600: "#8444F0",
            700: "#6D2EDB",
            DEFAULT: "#9B5CFF",
          },
          pink: {
            50: "#FFF0FB",
            100: "#FFD6F5",
            500: "#FF4FD8",
            600: "#E638C0",
            DEFAULT: "#FF4FD8",
          },
          light: "#EFE7FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      maxWidth: {
        "container-xl": "1280px",
        "container-2xl": "1440px",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        "brand-sm": "0 4px 14px rgba(106,0,255,0.25)",
        "brand-md": "0 8px 25px rgba(106,0,255,0.35)",
        "brand-lg": "0 12px 40px rgba(106,0,255,0.45)",
        "brand-glow": "0 0 40px rgba(106,0,255,0.3), 0 0 80px rgba(155,92,255,0.2)",
        "pink-md": "0 8px 25px rgba(255,79,216,0.35)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6A00FF 0%, #FF4FD8 100%)",
        "gradient-cta": "linear-gradient(90deg, #6A00FF 0%, #9B5CFF 50%, #FF4FD8 100%)",
        "gradient-dark": "linear-gradient(135deg, #1A0040 0%, #2E0070 60%, #4400A3 100%)",
        "gradient-tint": "linear-gradient(180deg, #FFFFFF 0%, #EFE7FF 100%)",
        "gradient-hero": "linear-gradient(135deg, rgba(26,0,64,0.9) 0%, rgba(106,0,255,0.6) 50%, rgba(255,79,216,0.2) 100%)",
        "gradient-card": "linear-gradient(135deg, #9B5CFF 0%, #6A00FF 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scroll-bounce": {
          "0%, 100%": { transform: "translateY(-4px)" },
          "50%": { transform: "translateY(4px)" },
        },
        "spin-fast": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0,0,0.2,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scroll-bounce": "scroll-bounce 1.5s ease-in-out infinite",
        "spin-fast": "spin-fast 700ms linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
