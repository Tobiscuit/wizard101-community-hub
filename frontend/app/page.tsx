"use client"


import { GridPattern } from "@/components/magicui/grid-pattern"
import { MagicCard } from "@/components/magicui/magic-card"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  BarChart, 
  BookOpen, 
  Calculator as CalculatorIcon, 
  ScanLine, 
  Scroll, 
  Shield, 
  Sparkles, 
  Sword, 
  Users 
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      {/* Background Pattern */}
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        className="stroke-gray-400/20 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        strokeDasharray="4 2"
      />

      <div className="container mx-auto max-w-7xl pt-8 pb-16 space-y-12">
        {/* Hero / Welcome */}
        <div className="flex flex-col items-center text-center space-y-4 px-4">
          <div className="inline-flex items-center rounded-full border border-accent-gold/30 bg-accent-gold/10 px-3 py-1 text-sm font-medium text-accent-gold backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="animate-pulse">New: Wizard Scanner (Alpha)</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground drop-shadow-md">
            The <span className="text-accent-gold">Commons</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light">
            The ultimate community hub for Wizard101. Calculate stats, trade pets, and chronicle your journey.
          </p>
          <div className="flex items-center gap-4 pt-4">
              <Link href="/scanner">
                <ShinyButton>Launch Scanner</ShinyButton>
              </Link>
              <Link href="https://github.com" target="_blank">
                <Button variant="outline" className="gap-2">
                    <Users className="w-4 h-4"/> Join Guild
                </Button>
              </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <Link href="/calculator" className="group">
            <MagicCard className="h-full cursor-pointer border-accent-gold/20 hover:border-accent-gold/50 transition-all duration-500 flex flex-col gap-6 py-6 hover:-translate-y-1 hover:shadow-lg" gradientColor="#FFD700" gradientOpacity={0.1}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent-gold">
                  <CalculatorIcon className="w-5 h-5" />
                  Stat Calculator
                </CardTitle>
                <CardDescription className="leading-relaxed">Optimize your pet's potential.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Enter your pet's strength, will, and power to calculate precise talent values.
              </CardContent>
            </MagicCard>
          </Link>

          <Link href="/scanner" className="group">
            <MagicCard className="h-full cursor-pointer border-accent-blue/20 hover:border-accent-blue/50 transition-all duration-500 flex flex-col gap-6 py-6 hover:-translate-y-1 hover:shadow-lg" gradientColor="#00A8FF" gradientOpacity={0.1}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent-blue">
                  <ScanLine className="w-5 h-5" />
                  Wizard Scanner
                </CardTitle>
                <CardDescription className="leading-relaxed">AI-powered gear analysis.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                 Upload a screenshot of your wizard to extract stats, gear, and build your profile instantly.
              </CardContent>
            </MagicCard>
          </Link>

          <Link href="/guilds" className="group">
            <MagicCard className="h-full cursor-pointer border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 flex flex-col gap-6 py-6 hover:-translate-y-1 hover:shadow-lg" gradientColor="#A855F7" gradientOpacity={0.1}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Shield className="w-5 h-5" />
                  Guild Directory
                </CardTitle>
                <CardDescription className="leading-relaxed">Find your magical family.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Browse active guilds, filter by activity (Social, Raiding, PvP), and apply directly.
              </CardContent>
            </MagicCard>
          </Link>
        </div>

        {/* Main Calculator Section */}

      </div>
    </div>
  )
}
