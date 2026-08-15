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
        background: "#050505", // Deep cinematic black
        foreground: "#FFFFFF", // Glowing stark white
        accent: "#E2E8F0", // Slate grey for subtitles
        neonova: "rgba(255, 255, 255, 0.8)", // Glowing overlay
      },
      dropShadow: {
        'glow': '0 0 15px rgba(255, 255, 255, 0.5)',
        'glow-strong': '0 0 25px rgba(255, 255, 255, 0.8)',
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
