import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ExternalLink, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { SearchBox } from '@/components/search/SearchBox';
import { cn } from '@/lib/utils';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface ServiceItem { name: string; price: string; unit: string; store: string; storeLogo: string; url: string; category: string; tag: string; }

export default function Services() {
  const { t, language } = useAppContext();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    fetch(`${BASE}/api/products/featured?language=${language}`)
      .then(r => r.json())
      .then(data => setServices(data.services || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [language]);

  const tagColors: Record<string, string> = {
    "Top Rated": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Popular": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    default: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <div className="relative py-14 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            {t('servicesTitle')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">{t('servicesTitle')}</h1>
          <p className="text-lg text-muted-foreground">{t('servicesSubtitle')}</p>
          <SearchBox compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-foreground">Featured Services</h2>
          <button onClick={load} disabled={isLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-white/10 hover:border-primary/30 transition-all text-sm font-medium disabled:opacity-50">
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-card border border-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((item, i) => (
              <motion.a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group rounded-2xl bg-card border border-white/5 hover:border-primary/30 p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0 border border-white/10">
                  {item.storeLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border shrink-0", (tagColors[item.tag] || tagColors.default))}>{item.tag}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.store} · {item.category}</p>
                  <p className="text-sm font-bold gold-gradient-text mt-1">
                    ${item.price} <span className="text-muted-foreground font-normal text-xs">{item.unit === 'per hour' ? t('perHour') : t('perProject')}</span>
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
