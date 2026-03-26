import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#EF7D17",
          blue: "#002337",
        },
      },
      borderRadius: {
        brand: "14px",
        xl2: "18px",
      },
      boxShadow: {
        brand: "0 10px 30px rgba(0, 35, 55, 0.16)",
        surface: "0 8px 20px rgba(2, 18, 27, 0.08)",
      },
    },
  },
};

export default config;