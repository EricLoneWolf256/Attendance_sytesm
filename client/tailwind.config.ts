import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        umu: {
          red: "#FF0000",
          "red-dark": "#CC0000",
          "red-light": "#FFE9EA",
          gold: "#FFCD00",
          "gold-dark": "#E5B800",
          dark: "#0A0A0A",
          gray: "#F3F3F3",
        },
        primary: {
          DEFAULT: "#FF0000",
          hover: "#CC0000",
          light: "#FFE9EA",
        },
      },
    },
  },
  plugins: [],
};

export default config;
