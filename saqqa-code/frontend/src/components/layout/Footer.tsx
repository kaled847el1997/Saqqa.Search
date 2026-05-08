import React from 'react';
import { Heart } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export function Footer() {
  const { t } = useAppContext();

  return (
    <footer className="w-full mt-auto border-t border-white/5 bg-background/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="text-muted-foreground text-sm flex items-center gap-2 font-medium">
          {t('createdBy')} 
          <Heart className="w-4 h-4 text-destructive fill-destructive animate-pulse" />
        </p>
      </div>
    </footer>
  );
}
