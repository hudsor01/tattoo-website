"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-tattoo-red font-semibold">
        Reports & Documents
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton 
              asChild
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
            >
              <a href={item.url} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <span>View Report</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <span>Share</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}