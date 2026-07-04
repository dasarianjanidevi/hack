import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          deep: "#070b14",
          card: "rgba(255,255,255,0.04)",
        },
      },
      animation: {
        "spin-ring": "spin 1s linear infinite",
        "fade-slide-up": "fade-slide-up 0.4s ease forwards",
        "fade-in": "fade-in 0.3s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
