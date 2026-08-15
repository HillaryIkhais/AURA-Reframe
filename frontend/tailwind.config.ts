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
        background: "#E8E9EC", // Editorial light grey (like the denim image)
        foreground: "#111111", // Stark brutalist black
        accent: "#6C7A89", // Muted slate blue/grey
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'], // Elegant, high-contrast serif
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: "0" },
          '100%': { opacity: "1" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
