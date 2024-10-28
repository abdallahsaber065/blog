/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: "#1b1b1b",
        light: "#fff",
        accent: "#7B00D3",
        accentDark: "#ffdb4d",
        lightgray: "#bdc1c6",
        gray: "#333b47",
        primary: "#4A90E2",
        secondary: "#50E3C2",
        danger: "#E94E77",
        warning: "#F5A623",
        success: "#7ED321",
      },
      fontFamily: {
        mr: ["var(--font-mr)"],
        in: ["var(--font-in)"]
      },
      animation: {
        roll: "roll 24s linear infinite"
      },
      keyframes: {
        roll: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" }
        }
      },
      screens: {
        sxl: "1180px",
        xs: "480px"
      }
    },
  },

  plugins: [
    forms,
    typography,
    daisyui
  ],

  daisyui: {
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: ":root",
  },
};