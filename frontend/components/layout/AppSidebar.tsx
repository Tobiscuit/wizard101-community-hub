"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Calculator,
  Dog,
  Store,
  Users,
  ScrollText,
  Sparkles,
  Command,
  LifeBuoy,
  Send,
  MoreHorizontal,
  LogOut,
  User,
  Moon,
  Sun,
  Monitor,
  Check
} from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Separator,
} from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

// This would typically come from a config file or API
const data = {
  navMain: [
    {
      title: "Collection",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "My Pets",
          url: "/my-pets",
        },
        {
          title: "Profile",
          url: "/profile",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Guilds",
          url: "/guilds",
        },
        {
          title: "Marketplace",
          url: "/marketplace",
        },
        {
          title: "Olde Town",
          url: "/olde-town",
        },
      ],
    },
    {
      title: "Tools",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Pet Calculator",
          url: "/calculator",
        },
        {
          title: "Wizard Scanner",
          url: "/scanner",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const { setTheme, theme } = useTheme()
  const { state, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props} className="thinking-rail border-r border-border bg-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent-gold/20 text-accent-gold">
                  <span className="text-xl">📖</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-serif font-bold text-accent-gold">The Commons</span>
                  <span className="truncate text-xs text-muted-foreground">Wizard101 Hub</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => {
              // Adaptive Navigation: Use Dropdown when collapsed, Collapsible when expanded
              if (state === "collapsed") {
                return (
                  <SidebarMenuItem key={item.title}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <MoreHorizontal className="ml-auto size-4" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="min-w-56 rounded-lg">
                        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 pb-2">
                          {item.title}
                        </DropdownMenuLabel>
                        {item.items?.map((subItem) => (
                          <DropdownMenuItem key={subItem.title} asChild>
                            <Link href={subItem.url} className="cursor-pointer">
                              <span>{subItem.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                )
              }

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="hover:bg-accent-gold/10 transition-colors duration-300">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <MoreHorizontal className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                                asChild 
                                isActive={pathname === subItem.url}
                                className="hover:translate-x-1 transition-transform duration-200"
                            >
                              <Link href={subItem.url} onClick={() => setOpenMobile(false)}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Secondary Nav */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="sm" tooltip="Toggle Theme">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Toggle Theme</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side={state === "collapsed" ? "right" : "top"} 
                align="start" 
                className="min-w-56 rounded-lg"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 pb-2">
                  Select Theme
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between">
                  <div className="flex items-center">
                    <Sun className="mr-2 h-4 w-4 text-orange-400" />
                     Solarized Light
                  </div>
                  {theme === "light" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("candlelight")} className="justify-between">
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                    Candlelight (Warm)
                  </div>
                  {theme === "candlelight" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between">
                  <div className="flex items-center">
                    <Moon className="mr-2 h-4 w-4 text-slate-400" />
                    Deep Void
                  </div>
                  {theme === "dark" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("abyss")} className="justify-between">
                  <div className="flex items-center">
                    <Bot className="mr-2 h-4 w-4 text-teal-400" />
                    Abyss (Navy)
                  </div>
                  {theme === "abyss" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("system")} className="justify-between">
                  <div className="flex items-center">
                    <Monitor className="mr-2 h-4 w-4" />
                    System Default
                  </div>
                  {theme === "system" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  tooltip="User Profile"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="rounded-lg">
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session?.user?.name || "Guest Wizard"}</span>
                    {/* Privacy: Hide Email */}
                    <span className="truncate text-xs opacity-70">{session ? "Authorized Wizard" : "Sign in to save progress"}</span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={state === "collapsed" ? "right" : "top"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{session?.user?.name || "Guest Wizard"}</span>
                      {/* Privacy: Hide Email */}
                      <span className="truncate text-xs opacity-70">{session ? "Authorized Wizard" : "Not signed in"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {session ? (
                    <>
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Sparkles className="mr-2" />
                            Upgrade to Premium
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Settings2 className="mr-2" />
                            Account
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                          <LogOut className="mr-2" />
                          Log out
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem asChild>
                        <Link href="/login" className="flex items-center cursor-pointer">
                            <Send className="mr-2 w-4 h-4" />
                            Sign In
                        </Link>
                    </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
