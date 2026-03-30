
'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { Newspaper, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { NewsData } from '@/lib/types';
import { motion } from 'framer-motion';

export default function PersonalNewsPage() {
  const [news, setNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data || []);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
      toast.error('Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando noticias..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            Noticias y Anuncios
          </h1>
          <p className="text-gray-500 mt-1">
            Mantente al día con las últimas noticias de la empresa
          </p>
        </div>

        {/* News List */}
        {news?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay noticias disponibles</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {news?.map((item, index) => (
              <motion.div
                key={item?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${
                  item?.priority === 'URGENT' 
                    ? 'border-red-200 bg-red-50' 
                    : item?.priority === 'HIGH'
                    ? 'border-orange-200 bg-orange-50'
                    : 'hover:bg-gray-50'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-start gap-3">
                          <TrendingUp className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                          <span>{item?.title}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item?.priority || 'NORMAL'} />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item?.createdAt)?.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {item?.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
