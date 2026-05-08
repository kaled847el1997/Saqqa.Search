import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface UnderFiveItem { name: string; price: string; store: string; storeLogo: string; url: string; category: string; tag: string; }
interface DealItem { name: string; originalPrice: string; salePrice: string; discount: string; store: string; storeLogo: string; url: string; endsIn: string; category: string; }

export default function Deals() {
  const { t, language } = useAppContext();
  const [underFive, setUnderFive] = useState<UnderFiveItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadFeatured = () => {
    setIsLoading(true);
    fetch(`${BASE}/api/products/featured?language=${language}&refresh=true`)
      .then(r => r.json())
      .then(data => {
        setUnderFive(data.underFive || []);
        setDeals(data.deals || []);
        setLastUpdated(new Date());
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadFeatured(); }, [language]);

  const tagColors: Record<string, string> = {
    "Best Seller": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "New": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Popular": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Trending": "bg-pink-500/10 text-pink-400 border-pink-500/20",
    default: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className="flex-1 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">🔥 {t('dealsTitle')} & {t('underFiveTitle')}</h1>
            <p className="text-muted-foreground">
              {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()} · `}{t('dealsSubtitle')}
            </p>
          </div>
          <button onClick={loadFeatured} disabled={isLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-white/10 hover:border-primary/30 transition-all text-sm font-medium disabled:opacity-50">
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* Flash Deals */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('dealsTitle')}</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-card border border-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.map((item, i) => (
                <motion.a key={i} href={item.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group rounded-2xl bg-card border border-white/5 hover:border-primary/30 p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                  <div className="flex items-start justify-between">
                    <span className="bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold px-2.5 py-1 rounded-full">-{item.discount} {t('discount')}</span>
                    <span className="text-xl">{item.storeLogo}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug flex-1">{item.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold gold-gradient-text">${item.salePrice}</span>
                      <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-orange-400" /> {t('endsIn')} {item.endsIn}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.store} · {item.category}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </section>

        {/* Under $5 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('underFiveTitle')}</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-card border border-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {underFive.map((item, i) => (
                <motion.a key={i} href={item.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group relative rounded-2xl bg-card border border-white/5 hover:border-primary/30 p-4 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", (tagColors[item.tag] || tagColors.default))}>{item.tag}</span>
                    <span className="text-xl">{item.storeLogo}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.store}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold gold-gradient-text">${item.price}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
