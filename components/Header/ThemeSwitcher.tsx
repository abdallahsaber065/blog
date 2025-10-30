"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button 
        className="relative ml-2 w-14 h-7 rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer transition-colors duration-300"
        aria-label="Toggle theme"
      >
        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md" />
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative ml-2 w-14 h-7 rounded-full bg-gradient-to-r transition-all duration-300 ease-in-out shadow-inner hover:shadow-lg
        from-amber-400 to-orange-400 dark:from-indigo-600 dark:to-purple-700"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Toggle slider */}
      <div 
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center
          ${isDark ? 'translate-x-7' : 'translate-x-0.5'}`}
      >
        {/* Icon inside the slider */}
        {isDark ? (
          <Moon className="h-4 w-4 text-indigo-600 animate-in fade-in duration-300" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 animate-in fade-in duration-300" />
        )}
      </div>

      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun className={`h-3.5 w-3.5 text-white transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-100'}`} />
        <Moon className={`h-3.5 w-3.5 text-white transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-30'}`} />
      </div>
    </button>
  )
}

export default ThemeSwitcher