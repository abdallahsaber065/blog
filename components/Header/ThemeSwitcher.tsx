"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { motion } from "framer-motion"

const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative ml-1 w-14 h-7 rounded-full bg-lightElevated dark:bg-darkElevated cursor-pointer flex-shrink-0">
        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-lightSurface dark:bg-darkSurface shadow-sm" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative ml-1 flex-shrink-0 w-14 h-7 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 transition-colors duration-300 ${
        isDark
          ? 'bg-darkElevated border border-darkBorder'
          : 'bg-lightElevated border border-lightBorder'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun className={`w-3 h-3 transition-opacity duration-300 ${isDark ? 'opacity-25 text-slate-400' : 'opacity-100 text-amber-500'}`} />
        <Moon className={`w-3 h-3 transition-opacity duration-300 ${isDark ? 'opacity-100 text-gold' : 'opacity-25 text-slate-400'}`} />
      </div>

      {/* Animated thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md flex items-center justify-center ${
          isDark
            ? 'right-0.5 bg-dark border border-gold/40'
            : 'left-0.5 bg-white border border-lightBorder'
        }`}
      >
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {isDark
            ? <Moon className="w-3.5 h-3.5 text-gold" />
            : <Sun className="w-3.5 h-3.5 text-amber-500" />
          }
        </motion.div>
      </motion.div>
    </button>
  )
}

export default ThemeSwitcher