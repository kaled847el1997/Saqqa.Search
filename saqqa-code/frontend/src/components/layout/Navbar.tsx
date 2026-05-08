import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ChevronDown, Tag, Briefcase, CreditCard, Menu, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'wouter';

export function Navbar() {
  const { language, setLanguage, t, isRtl, setSearchResults, setUploadedImageUrl } = useAppContext();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇵🇸' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ] as const;

  const navLinks = [
    { href: '/deals', label: t('navDeals'), icon: <Tag className="w-4 h-4" /> },
    { href: '/services', label: t('navServices'), icon: <Briefcase className="w-4 h-4" /> },
    { href: '/pricing', label: t('navPricing'), icon: <CreditCard className="w-4 h-4" /> },
  ];

  const currentLang = languages.find(l => l.code === language);

  const resetSearch = () => {
    setSearchResults(null);
    setUploadedImageUrl(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6 py-3">

        {/* Logo */}
        <Link href="/" onClick={resetSearch} className="flex items-center gap-3 group cursor-pointer shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
            <Search className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-foreground">
            Saqqa Search
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                location === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-all duration-200 text-sm"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="hidden sm:inline font-medium">{currentLang?.flag} {currentLang?.label}</span>
              <span className="sm:hidden">{currentLang?.flag}</span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isLangMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn("absolute top-full mt-2 w-44 py-2 bg-card rounded-xl border border-white/10 shadow-xl", isRtl ? "left-0" : "right-0")}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangMenuOpen(false); }}
                      className={cn("w-full text-start px-4 py-2.5 text-sm transition-colors hover:bg-white/5 flex items-center gap-3", language === lang.code ? "text-primary font-medium" : "text-muted-foreground")}
                    >
                      <span>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/5 bg-background/95 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    location === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
