'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
Command,
LayoutDashboard,
Calendar,
Users,
CreditCard,
Image,
Settings,
BadgeCheck,
Bell,
ChevronsUpDown,
LogOut,
Search,
X,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useSession, signOut } from '@/lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';

// Navigation data
const navigationData = {
  main: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Appointments',
      url: '/admin/appointments',
      icon: Calendar,
    },
    {
      title: 'Customers',
      url: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Gallery',
      url: '/admin/gallery',
      icon: Image,
    },
    {
      title: 'Payments',
      url: '/admin/payments',
      icon: CreditCard,
    },
  ],
  secondary: [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings,
    },
  ],
};

// Search functionality integrated component
function IntegratedSearch() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();

  // Combine all navigation items for search
  const searchItems = React.useMemo(() => {
    const items = [
      ...navigationData.main.map(item => ({
        ...item,
        category: 'navigation' as const,
        description: `Navigate to ${item.title.toLowerCase()}`,
      })),
      ...navigationData.secondary.map(item => ({
        ...item,
        category: 'settings' as const,
        description: `Access ${item.title.toLowerCase()}`,
      })),
    ];
    return items;
  }, []);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const searchQuery = query.toLowerCase();
    return searchItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery)
    );
  }, [query, searchItems]);

  const handleSelect = React.useCallback((item: typeof searchItems[0]) => {
    router.push(item.url);
    setIsOpen(false);
    setQuery('');
  }, [router]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev === 0 ? results.length - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect]);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg"
            >
              <Card className="p-0 shadow-lg">
                <div className="flex items-center border-b px-3">
                  <Search className="h-4 w-4 text-muted-foreground mr-3" />
                  <Input
                    ref={el => el?.focus()}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search admin panel..."
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {query && results.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {results.map((item, index) => {
                        const Icon = item.icon;
                        const isSelected = index === selectedIndex;
                        return (
                          <button
                            key={item.url}
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                              isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Main navigation component
function MainNavigation() {
const pathname = usePathname();

return (
    <SidebarGroup className="space-y-2">
      <SidebarGroupLabel className="text-sm lg:text-base font-semibold text-muted-foreground px-4 mb-3">
        Navigation
      </SidebarGroupLabel>
      <SidebarMenu>
        {navigationData.main.map(item => {
          const isActive = pathname === item.url;
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className={isActive ? 'bg-accent text-accent-foreground' : ''}>
                <Link href={item.url}>
                  <Icon className="mr-2 h-5 w-5" />
                  <span className="text-base lg:text-lg font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// Secondary navigation component
function SecondaryNavigation() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navigationData.secondary.map(item => {
          const isActive = pathname === item.url;
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`${isActive ? 'bg-accent text-accent-foreground' : ''} transition-colors`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="text-base lg:text-lg font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// User menu component
function UserMenu() {
  const { data: session } = useSession();
  const { isMobile } = useSidebar();
  const router = useRouter();

  const user = {
    name: session?.user?.name ?? 'Admin User',
    email: session?.user?.email ?? 'admin@example.com',
    avatar: session?.user?.image ?? 'https://ui.shadcn.com/avatars/01.png',
    role: 'Administrator',
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/admin');
  };

  return (
    <SidebarMenu className="p-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full justify-start gap-2 px-2 py-1.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-lg font-semibold leading-none">{user.name}</span>
                <span className="text-base text-muted-foreground leading-none mt-1">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="h-5 w-5 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isMobile ? 'center' : 'start'}
            className="w-56 rounded-md"
            side={isMobile ? 'top' : 'right'}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => void handleLogout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Main AppSidebar component
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-gray-800/30 bg-[#0a0a0a]"
      {...props}
    >
      {/* Header */}
      <SidebarHeader className="border-b border-border/20">
        <div className="flex items-center gap-4 px-6 py-6">
          <div className="flex aspect-square h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Command className="h-6 w-6" />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-foreground text-lg lg:text-xl">Ink 37 Tattoos</span>
            <span className="text-base lg:text-lg text-muted-foreground font-medium">Admin Dashboard</span>
          </div>
        </div>
        
        {/* Integrated Search */}
        <div className="px-3 pb-3">
          <IntegratedSearch />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        {/* Main Navigation */}
        <div className="flex-1 px-3 py-4">
          <MainNavigation />
        </div>

        {/* Secondary Navigation */}
        <div className="mt-auto">
          <SidebarSeparator />
          <div className="px-3 py-4">
            <SecondaryNavigation />
          </div>
        </div>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
