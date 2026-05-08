import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Tag, Award, Target } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export function ProductHero() {
  const { searchResults, t, uploadedImageUrl } = useAppContext();
  
  if (!searchResults?.product) return null;
  const { product } = searchResults;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      
      {uploadedImageUrl && (
        <div className="w-full md:w-64 shrink-0 rounded-2xl overflow-hidden bg-black/40 border border-white/10 aspect-square flex items-center justify-center shadow-2xl">
          <img src={uploadedImageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold">
            <Tag className="w-4 h-4" />
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold">
            <Target className="w-4 h-4" />
            {t('confidence')}: {Math.round(product.confidence * 100)}%
          </span>
          {product.brand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-muted-foreground">
              <Award className="w-4 h-4" />
              {product.brand}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          {product.name}
        </h1>
        
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          {product.description}
        </p>

        <div className="pt-4 flex items-center gap-2 text-sm text-muted-foreground font-medium border-t border-white/5">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          {t('resultsFor')} <strong className="text-foreground">{searchResults.searchQuery}</strong> ({searchResults.totalResults} found)
        </div>
      </div>
    </motion.div>
  );
}
