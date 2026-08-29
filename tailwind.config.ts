import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bank: { red: "#C8102E", dark: "#8f0b20" },
      },
    },
  },
  plugins: [],
};
export default config;
