
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Users,
  Building2,
  Clock,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Settings,
  Newspaper,
  Calendar,
  Timer,
  UserCircle,
  Sun,
  Moon,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Personal', icon: Users },
  { href: '/admin/departments', label: 'Departamentos', icon: Building2 },
  { href: '/admin/time-records', label: 'Registros de Tiempo', icon: Clock },
  { href: '/admin/salaries', label: 'Salarios', icon: DollarSign },
  { href: '/admin/permissions', label: 'Permisos', icon: FileText },
  { href: '/admin/news', label: 'Noticias', icon: Newspaper },
  { href: '/personal/profile', label: 'Mi Perfil', icon: UserCircle },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

const personalNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/personal/employees', label: 'Personal', icon: Users },
  { href: '/personal/departments', label: 'Departamentos', icon: Building2 },
  { href: '/personal/permissions', label: 'Mis Permisos', icon: Calendar },
  { href: '/personal/time', label: 'Control de Tiempo', icon: Timer },
  { href: '/personal/profile', label: 'Mi Perfil', icon: UserCircle },
  { href: '/personal/news', label: 'Noticias', icon: Newspaper },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const { theme, setTheme } = useTheme();

  const navItems = session?.user?.role === 'ADMIN' ? adminNavItems : personalNavItems;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 p-6 border-b dark:border-gray-800">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TuGente</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session?.user?.role === 'ADMIN' ? 'Administrador' : 'Personal'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-1">
              {navItems?.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-800">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {session?.user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
            </div>
            <Separator className="mb-3 dark:bg-gray-800" />
            
            {/* Theme Toggle */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Apariencia</p>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Oscuro
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
