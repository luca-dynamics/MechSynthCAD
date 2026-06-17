import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        blueprint: "#0f2a44",
        gridline: "rgba(148, 163, 184, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
