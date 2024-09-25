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
        gray: "#222",
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
    themes: ["light", "dark", "bumblebee", "cmyk", "sunset", "night", "dim"], // active themes
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
};