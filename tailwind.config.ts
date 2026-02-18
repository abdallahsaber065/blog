/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // --- Dark mode surfaces ---
        dark:        "#161618",
        darkSurface: "#191B1D",
        darkElevated:"#1E2023",
        darkBorder:  "#2A2A2E",

        // --- Light mode surfaces ---
        light:        "#FAFAF8",
        lightSurface: "#F0EDE6",
        lightElevated:"#E8E4DC",
        lightBorder:  "#E2DDD6",

        // --- Gold accent system ---
        gold:        "#F8CC4D",
        goldDark:    "#E6A817",
        goldLight:   "#FBD96A",
        goldMuted:   "rgba(248,204,77,0.15)",

        // --- Legacy mapped aliases ---
        accent:      "#F8CC4D",
        accentDark:  "#E6A817",
        primary:     "#F8CC4D",

        // --- Status colors ---
        danger:   "#ef4444",
        warning:  "#f59e0b",
        success:  "#10b981",

        // --- Misc legacy ---
        lightgray: "#E2DDD6",
        gray:      "#1E2023",
        secondary: "#8b5cf6",

        // --- shadcn/ui CSS-var tokens ---
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        mr:      ["var(--font-inter)", "system-ui", "sans-serif"],
        in:      ["var(--font-sora)", "system-ui", "sans-serif"],
        inter:   ["var(--font-inter)", "system-ui", "sans-serif"],
        sora:    ["var(--font-sora)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      animation: {
        roll:        "roll 24s linear infinite",
        shimmer:     "shimmer 2.5s linear infinite",
        float:       "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "slide-up":  "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":   "fade-in 0.5s ease both",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        roll: {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(248,204,77,0.2)" },
          "50%":      { boxShadow: "0 0 35px rgba(248,204,77,0.45)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      boxShadow: {
        "gold-sm":  "0 0 15px rgba(248,204,77,0.15)",
        "gold":     "0 0 30px rgba(248,204,77,0.25)",
        "gold-lg":  "0 0 50px rgba(248,204,77,0.35)",
        "card":     "0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
        "card-dark":"0 1px 3px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.3)",
        "elevated": "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      },
      screens: {
        sxl: "1180px",
        xs:  "480px",
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backgroundImage: {
        "gold-gradient":    "linear-gradient(135deg, #F8CC4D 0%, #E6A817 100%)",
        "gold-radial":      "radial-gradient(ellipse at center, rgba(248,204,77,0.15) 0%, transparent 70%)",
        "dark-gradient":    "linear-gradient(180deg, #161618 0%, #191B1D 100%)",
        "shimmer-gold":     "linear-gradient(90deg, transparent 0%, rgba(248,204,77,0.4) 50%, transparent 100%)",
      },
    },
  },

  plugins: [
    forms,
    typography,
    daisyui,
    require("tailwindcss-animate"),
  ],

  daisyui: {
    base:      true,
    styled:    true,
    utils:     true,
    prefix:    "",
    logs:      false,
    themeRoot: ":root",
  },
};