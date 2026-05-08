import React, { useEffect, useState } from 'react';
import { SearchBox } from '@/components/search/SearchBox';
import { useAppContext } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Tag, Zap, Briefcase, ArrowRight, ExternalLink, TrendingDown, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface UnderFiveItem {
  name: string; price: string; store: string; storeLogo: string; url: string; category: string; tag: string;
}
interface DealItem {
  name: string; originalPrice: string; salePrice: string; discount: string; store: string; storeLogo: string; url: string; endsIn: string; category: string;
}
interface ServiceItem {
  name: string; price: string; unit: string; store: string; storeLogo: string; url: string; category: string; tag: string;
}
interface FeaturedData {
  underFive: UnderFiveItem[];
  deals: DealItem[];
  services: ServiceItem[];
}

function SectionHeader({ icon, title, subtitle, href }: { icon: React.ReactNode; title: string; subtitle: string; href: string }) {
  const { t } = useAppContext();
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl gold-gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Link href={href} className="hidden sm:flex items-center gap-2 text-sm text-primary hover:underline font-medium">
        {t('viewAll')} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function Home() {
  const { t, language } = useAppContext();
  const [featured, setFeatured] = useState<FeaturedData | null>(null);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    setIsLoadingFeatured(true);
    fetch(`${BASE}/api/products/featured?language=${language}`)
      .then(r => r.json())
      .then(data => setFeatured(data))
      .catch(console.error)
      .finally(() => setIsLoadingFeatured(false));
  }, [language]);

  const tagColors: Record<string, string> = {
    "Best Seller": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "New": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Popular": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Trending": "bg-pink-500/10 text-pink-400 border-pink-500/20",
    "Top Rated": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    default: "bg-primary/10 text-primary border-primary/20",
  };

  const getTagColor = (tag: string) => tagColors[tag] || tagColors.default;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        <div className="relative z-10 w-full text-center space-y-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white drop-shadow-2xl leading-tight">
              {t('heroTitle1')} <span className="gold-gradient-text">{t('heroTitle2')}</span><br />{t('heroTitle3')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <SearchBox />
          </motion.div>
        </div>
      </div>

      {/* Feature sections */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 space-y-20">

        {/* Under $5 */}
        <section>
          <SectionHeader
            icon={<TrendingDown className="w-6 h-6 text-primary-foreground" />}
            title={t('underFiveTitle')}
            subtitle={t('underFiveSubtitle')}
            href="/deals"
          />
          {isLoadingFeatured ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-white/5 p-4 h-36 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(featured?.underFive || []).slice(0, 8).map((item, i) => (
                <motion.a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl bg-card border border-white/5 hover:border-primary/30 p-4 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between">
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", getTagColor(item.tag))}>{item.tag}</span>
                    <span className="text-xl">{item.storeLogo}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.store}</p>
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

        {/* Flash Deals */}
        <section>
          <SectionHeader
            icon={<Zap className="w-6 h-6 text-primary-foreground" />}
            title={t('dealsTitle')}
            subtitle={t('dealsSubtitle')}
            href="/deals"
          />
          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-white/5 p-4 h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(featured?.deals || []).slice(0, 8).map((item, i) => (
                <motion.a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl bg-card border border-white/5 hover:border-primary/30 p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* Discount badge */}
                  <div className="flex items-start justify-between">
                    <span className="bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold px-2.5 py-1 rounded-full">
                      -{item.discount} {t('discount')}
                    </span>
                    <span className="text-xl">{item.storeLogo}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug flex-1">{item.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold gold-gradient-text">${item.salePrice}</span>
                      <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      {t('endsIn')} {item.endsIn}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </section>

        {/* Services */}
        <section>
          <SectionHeader
            icon={<Briefcase className="w-6 h-6 text-primary-foreground" />}
            title={t('servicesTitle')}
            subtitle={t('servicesSubtitle')}
            href="/services"
          />
          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-white/5 p-5 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(featured?.services || []).slice(0, 6).map((item, i) => (
                <motion.a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-2xl bg-card border border-white/5 hover:border-primary/30 p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0 border border-white/10">
                    {item.storeLogo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border shrink-0", getTagColor(item.tag))}>{item.tag}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.store} · {item.category}</p>
                    <p className="text-sm font-bold gold-gradient-text mt-1">
                      ${item.price} <span className="text-muted-foreground font-normal text-xs">{item.unit === 'per hour' ? t('perHour') : t('perProject')}</span>
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </motion.a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
