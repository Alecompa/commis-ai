"use client"

import { Button } from "@/components/ui/button"
import { Menu, ChefHat } from "lucide-react"
import { memo } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AboutDialog } from "@/components/about-dialog"

interface HeaderProps {
  toggleSidebar: () => void
  isSidebarCollapsed: boolean
}

// Use memo to prevent unnecessary re-renders
export const Header = memo(function Header({ toggleSidebar, isSidebarCollapsed }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:flex"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-autumn-500" />
            <h1 className="text-xl font-bold">Commis</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AboutDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
})
