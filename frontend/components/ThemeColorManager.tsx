"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeColorManager() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    
    // Theme Color Map
    const themeColors: Record<string, string> = {
      light: "#fdf8e6",      // Solarized Cream (Canonical)
      candlelight: "#fcf5e5", // Warm Candlelight
      dark: "#11222a",       // Deep Void
      abyss: "#002b36",      // Solarized Abyss (Navy/Teal)
    }

    let themeColor = themeColors[resolvedTheme || "light"] || themeColors.light
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor)
    } else {
      const meta = document.createElement("meta")
      meta.name = "theme-color"
      meta.content = themeColor
      document.head.appendChild(meta)
    }
  }, [resolvedTheme])

  return null
}
