"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ComponentType<{ className?: string }>
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())

  // Initialize open items based on current path
  void React.useEffect(() => {
    const newOpenItems = new Set<string>()
    void items.forEach((item) => {
      if (item.items) {
        const hasActiveSubItem = item.items.some(subItem => pathname === subItem.url)
        if (hasActiveSubItem ?? pathname === item.url) {
          void newOpenItems.add(item.title)
        }
      }
    })
    setOpenItems(newOpenItems)
  }, [pathname, items])

  const toggleItem = (itemTitle: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemTitle)) {
        void newSet.delete(itemTitle)
      } else {
        void newSet.add(itemTitle)
      }
      return newSet
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-tattoo-red font-semibold text-sm">
        Main Navigation
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const isOpen = openItems.has(item.title)
          const hasSubItems = item.items && item.items.length > 0
          const isActive = pathname === item.url
          
          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={() => hasSubItems && toggleItem(item.title)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-tattoo-red data-[active=true]:text-white transition-colors duration-200 h-12 text-base font-medium"
                    asChild={!hasSubItems}
                  >
                    {hasSubItems ? (
                      <div className="w-full flex items-center gap-3">
                        {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                        <span className="truncate text-base">{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </div>
                    ) : (
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                        <span className="truncate text-base">{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {hasSubItems && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
                            isActive={pathname === subItem.url}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}