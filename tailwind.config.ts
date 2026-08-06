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
        plur: {
          bg: "#0f131a",
          card: "#161b22",
          cardHover: "#1c222b",
          border: "#21262d",
          red: "#ff4655",
          redDark: "#d93644",
          text: "#ffffff",
          muted: "#8b949e",
          green: "#3fb950",
        },
      },
      fontFamily: {
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, rgba(15,19,26,0.3) 0%, rgba(15,19,26,0.85) 60%, rgba(15,19,26,0.95) 100%)",
        "premium-gradient":
          "linear-gradient(135deg, #1a1f3a 0%, #0f131a 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
