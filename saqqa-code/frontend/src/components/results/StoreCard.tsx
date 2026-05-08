import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Truck, ShieldCheck, Crown, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { formatPrice, cn } from '@/lib/utils';
import type { PriceResult } from '@workspace/api-client-react';

interface StoreCardProps {
  result: PriceResult;
  index: number;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function StoreCard({ result, index }: StoreCardProps) {
  const { t } = useAppContext();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleBuyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRedirecting) return;
    setIsRedirecting(true);
    try {
      // Track affiliate click on the backend, then open the store URL
      await fetch(`${BASE}/api/search/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store: result.store, url: result.url, productName: result.title }),
      });
    } catch {
      // Non-blocking - still open the link
    } finally {
      window.open(result.url, '_blank', 'noopener,noreferrer');
      setTimeout(() => setIsRedirecting(false), 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        "relative rounded-2xl p-6 flex flex-col h-full bg-card border shadow-xl hover:-translate-y-1 transition-all duration-300",
        result.isCheapest
          ? "border-primary/50 shadow-primary/10"
          : "border-white/5 hover:border-white/20"
      )}
    >
      {result.isCheapest && (
        <div className="absolute -top-3 -end-3 z-10 gold-gradient-bg px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5">
          <Crown className="w-4 h-4" />
          {t('bestPrice')}
        </div>
      )}

      {/* Store header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/10">
            {result.storeLogo || '🛒'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{result.store}</h3>
            {result.rating != null && (
              <div className="flex items-center gap-1 text-sm font-medium text-yellow-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                {result.rating.toFixed(1)}
                <span className="text-muted-foreground ms-1 text-xs">({result.reviewCount} {t('reviews')})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product title */}
      <div className="mb-4 flex-1">
        <h4 className="text-foreground/90 font-medium leading-snug line-clamp-2" title={result.title}>
          {result.title}
        </h4>
      </div>

      {/* Price block */}
      <div className="space-y-3 mb-6 bg-black/20 rounded-xl p-4 border border-white/5">
        <div className="flex items-end gap-2">
          <span className={cn("text-3xl font-bold tracking-tight", result.isCheapest ? "gold-gradient-text" : "text-foreground")}>
            {formatPrice(result.price, result.currency)}
          </span>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{result.shipping}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="capitalize">{result.availability}</span>
          </div>
        </div>
      </div>

      {/* Commission notice */}
      <p className="text-[11px] text-muted-foreground/60 text-center mb-3 flex items-center justify-center gap-1">
        <span>🤝</span>
        <span>{t('commissionNotice')}</span>
      </p>

      {/* Buy button */}
      <button
        onClick={handleBuyClick}
        disabled={isRedirecting}
        className={cn(
          "mt-auto w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-wait",
          result.isCheapest
            ? "gold-gradient-bg shadow-lg hover:shadow-primary/30"
            : "bg-white/5 text-foreground hover:bg-white/10"
        )}
      >
        {isRedirecting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> {t('loading')}</>
        ) : (
          <>{t('buyNow')} <ExternalLink className="w-4 h-4" /></>
        )}
      </button>
    </motion.div>
  );
}
