
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Building2, Clock, FileText, UserCheck, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/news')
        ]);
        
        const statsData = await statsRes.json();
        const newsData = await newsRes.json();
        
        setStats(statsData);
        setNews(newsData || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando dashboard..." />
      </MainLayout>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  const statCards = [
    {
      title: 'Total de Empleados',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Empleados Activos',
      value: stats?.activeEmployees || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Departamentos',
      value: stats?.totalDepartments || 0,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Permisos Pendientes',
      value: stats?.pendingPermissions || 0,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Check-in Hoy',
      value: stats?.todayCheckedIn || 0,
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isAdmin ? 'Dashboard Administrativo' : 'Dashboard Personal'}
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenido, {session?.user?.name || 'Usuario'}
          </p>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {statCards?.map((stat, index) => (
            <motion.div key={stat.title} variants={item} className="h-full">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* News Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Noticias y Anuncios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {news?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay noticias disponibles
              </p>
            ) : (
              <div className="space-y-4">
                {news?.map((item) => (
                  <motion.div
                    key={item?.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {item?.title}
                        </h3>
                        <StatusBadge status={item?.priority || 'NORMAL'} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item?.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(item?.createdAt)?.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
