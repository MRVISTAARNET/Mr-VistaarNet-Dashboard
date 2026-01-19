import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

import NotificationPopover from './NotificationPopover';
import CommandPalette from './CommandPalette';
import ContactHRDialog from './ContactHRDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Clock,
  FileText,
  Settings,
  ChevronDown,
  Bell,
  Search,
  CheckSquare,
  BarChart3,
  Megaphone,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [contactHROpen, setContactHROpen] = useState(false);

  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Organization',
      path: '#',
      icon: <Building2 className="w-5 h-5" />,
      children: [
        { label: 'Departments', path: '/admin/organization/departments', icon: null },
        { label: 'Positions', path: '/admin/organization/positions', icon: null },
        { label: 'Structure', path: '/admin/organization/structure', icon: null },
      ],
    },
    {
      label: 'Employees',
      path: '#',
      icon: <Users className="w-5 h-5" />,
      children: [
        { label: 'Directory', path: '/admin/employees/directory', icon: null },
        { label: 'Add Employee', path: '/admin/employees/add', icon: null },
      ],
    },
    {
      label: 'Leave Management',
      path: '/admin/leave',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: 'Attendance',
      path: '/admin/attendance',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: 'Reports',
      path: '/admin/reports',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: 'Work Reports',
      path: '/admin/work-reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: 'Tasks',
      path: '/admin/tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      label: 'Documents',
      path: '/admin/documents',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: 'Messages',
      path: '/admin/messages',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      label: 'Announcements',
      path: '/admin/announcements',
      icon: <Megaphone className="w-5 h-5" />,
    },
  ];

  const employeeNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/employee/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Attendance',
      path: '/employee/attendance',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: 'Leave',
      path: '/employee/leave',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: 'My Tasks',
      path: '/employee/tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      label: 'Daily Report',
      path: '/employee/daily-reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: 'Documents',
      path: '/employee/documents',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: 'Messages',
      path: '/employee/messages',
      icon: <Bell className="w-5 h-5" />,
    },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : employeeNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: NavItem) =>
    item.children?.some(child => isActive(child.path));

  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-cyan/30">
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen border-r border-border transition-all duration-300 z-50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link
              to={user?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                <img src="/logo.jpg" alt="Mr VistaarNet Logo" className="w-full h-full object-cover" />
              </div>
              {sidebarOpen && (
                <span className="font-bold text-lg text-white">
                  Mr VistaarNet
                </span>
              )}
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              // ... (omitting lines to keep chunk valid if I can match safely)
              // Actually I need to match the START of the file change and END.
              // Let's do two replacements if needed or one big one.
              // The file is small enough.
              // Wait, I can't skip lines in ReplacementContent.
              // I'll do two separate chunks.

              const isChildActive = hasChildren && item.children?.some(child => location.pathname === child.path);
              const isOpen = expandedMenu === item.label || isChildActive;

              if (hasChildren) {
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => {
                        if (!sidebarOpen) setSidebarOpen(true);
                        setExpandedMenu(expandedMenu === item.label ? null : item.label);
                      }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full hover:bg-muted text-muted-foreground hover:text-foreground',
                        isChildActive && 'text-primary'
                      )}
                    >
                      <div className={cn("transition-transform duration-200", isOpen && "scale-110")}>
                        {item.icon}
                      </div>
                      <div className={cn("flex items-center flex-1 overflow-hidden transition-all duration-300", sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
                        <span className="font-medium truncate flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
                      </div>
                    </button>

                    {/* Submenu */}
                    {isOpen && sidebarOpen && (
                      <div className="pl-6 space-y-1 animate-slide-down">
                        {item.children?.map((child) => {
                          const isItemActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                isItemActive
                                  ? 'text-primary bg-primary/10 border border-primary/20'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              )}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <div className={cn(
                    "transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )}>
                    {item.icon}
                  </div>
                  {sidebarOpen && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_2px_rgba(34,211,238,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-card border border-border/50",
              !sidebarOpen && "justify-center"
            )}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <>
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      <ContactHRDialog open={contactHROpen} onOpenChange={setContactHROpen} />

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 min-h-screen flex flex-col',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Header */}
        <header className="h-16 sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-40 px-6 flex items-center justify-between supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={cn("w-5 h-5 transition-transform", sidebarOpen ? "rotate-90" : "-rotate-90")} />
            </Button>

            <div
              className="relative hidden md:block group"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search... (Ctrl+K)"
                className="pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-input text-sm w-64 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-foreground cursor-pointer placeholder:text-muted-foreground"
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationPopover />
            <div className="w-px h-6 bg-border mx-2" />
            <div
              onClick={() => {
                if (location.pathname === '/settings') {
                  navigate(-1); // Go back if already on settings
                } else {
                  navigate('/settings');
                }
              }}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${location.pathname === '/settings' ? 'border-primary/50 text-foreground' : 'border-border'}`}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
          <div className="mt-12 pt-6 border-t border-border text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} Mr VistaarNet. All rights reserved.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
