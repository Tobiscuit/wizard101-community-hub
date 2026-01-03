"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "./AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const ROUTE_NAMES: Record<string, string> = {
  "/": "Dashboard",
  "/calculator": "Calculator",
  "/scanner": "Scanner",
  "/my-pets": "My Pets",
  "/login": "Login",
  "/guilds": "Guild Directory",
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentPageName = ROUTE_NAMES[pathname] || "Page"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 px-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">The Commons</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPageName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
        <footer className="py-6 text-center text-sm text-foreground/30 border-t border-border mt-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 px-4 text-xs md:text-sm">
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-foreground/50 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-foreground/50 transition-colors">Terms of Service</a>
            </div>
            <span className="hidden md:inline">•</span>
            <span className="block md:inline">Wizard101 is a trademark of KingsIsle Entertainment. Not affiliated.</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
