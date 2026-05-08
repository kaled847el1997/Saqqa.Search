import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAppContext } from '@/contexts/AppContext';
import { ProductHero } from '@/components/results/ProductHero';
import { StoreCard } from '@/components/results/StoreCard';
import { SearchBox } from '@/components/search/SearchBox';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Tag } from 'lucide-react';

interface ExtendedSearchResult {
  product: { name: string; category: string; description: string; brand: string; confidence: number };
  results: Array<{ store: string; storeLogo: string; price: string; currency: string; url: string; title: string; rating: number; reviewCount: number; availability: string; isCheapest: boolean; shipping: string }>;
  searchQuery: string;
  totalResults: number;
  alternatives?: string[];
}

export default function Results() {
  const { searchResults, t, isRtl } = useAppContext();
  const [, setLocation] = useLocation();

  const extended = searchResults as ExtendedSearchResult | null;

  useEffect(() => {
    if (!searchResults) setLocation('/');
  }, [searchResults, setLocation]);

  if (!searchResults) return null;

  return (
    <div className="flex-1 bg-background">
      {/* Background accent */}
      <div className="absolute inset-0 z-0 h-[50vh] pointer-events-none">
        <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Back button + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            {t('tryAgain')}
          </button>
        </div>

        {/* AI alternatives (from describe search) */}
        {extended?.alternatives && extended.alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/20 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{t('alternatives')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {extended.alternatives.map((alt, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-foreground/80">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {alt}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Product info card */}
        <ProductHero />

        {/* Price comparison grid */}
        {searchResults.results && searchResults.results.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full" />
              {t('comparePrice')}
              <span className="text-sm font-normal text-muted-foreground ms-2">
                {searchResults.totalResults} stores
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {searchResults.results.map((result, idx) => (
                <StoreCard key={`${result.store}-${idx}`} result={result} index={idx} />
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-card rounded-3xl border border-white/5"
          >
            <p className="text-xl text-muted-foreground">{t('noResults')}</p>
          </motion.div>
        )}

        {/* Search again */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-center text-muted-foreground text-sm mb-6">Search for something else</p>
          <SearchBox compact />
        </div>

      </div>
    </div>
  );
}
