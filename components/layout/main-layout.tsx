
'use client';

import { useSession } from 'next-auth/react';
import { Sidebar } from './sidebar';
import { Loading } from '../ui/loading';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Loading text="Cargando aplicación..." className="h-screen" />;
  }

  if (!session) {
    return null; // Middleware redirects to login
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6 md:p-8 mt-16 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
