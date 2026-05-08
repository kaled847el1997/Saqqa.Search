import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  limits: { dailySearches: number; stores: number };
  recommended: boolean;
}

const planIcons: Record<string, React.ReactNode> = {
  free: <Star className="w-6 h-6" />,
  pro: <Zap className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
};

const planGradients: Record<string, string> = {
  free: "from-slate-600 to-slate-500",
  pro: "from-primary to-yellow-500",
  premium: "from-purple-600 to-pink-500",
};

export default function Pricing() {
  const { t, subscription, setSubscription } = useAppContext();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/subscriptions/plans`)
      .then(r => r.json())
      .then(data => setPlans(data.plans || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (planId === subscription || subscribing) return;
    setSubscribing(planId);
    try {
      await fetch(`${BASE}/api/subscriptions/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      setSubscription(planId as 'free' | 'pro' | 'premium');
    } catch {
      // silent
    } finally {
      setSubscribing(null);
    }
  };

  const planNames: Record<string, string> = { free: 'Free', pro: 'Pro', premium: 'Premium' };

  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <div className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              {t('pricingTitle')}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{t('pricingTitle')}</h1>
            <p className="text-xl text-muted-foreground">{t('pricingSubtitle')}</p>
          </motion.div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, i) => {
              const isCurrent = subscription === plan.id;
              const isRecommended = plan.recommended;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={cn(
                    "relative rounded-3xl p-8 flex flex-col border transition-all duration-300",
                    isRecommended
                      ? "bg-gradient-to-b from-primary/15 to-primary/5 border-primary/40 shadow-2xl shadow-primary/20 scale-105"
                      : "bg-card border-white/10"
                  )}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 gold-gradient-bg px-5 py-1.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                      ⭐ {t('mostPopular')}
                    </div>
                  )}

                  {/* Plan icon + name */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", planGradients[plan.id])}>
                      {planIcons[plan.id]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{planNames[plan.id]}</h3>
                      <p className="text-xs text-muted-foreground">
                        {plan.limits.dailySearches === -1 ? t('unlimited') : plan.limits.dailySearches} {t('searchesPerDay')}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.price === 0 ? (
                      <p className="text-4xl font-bold text-foreground">{t('freeForever')}</p>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className={cn("text-5xl font-bold", isRecommended ? "gold-gradient-text" : "text-foreground")}>
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground text-lg mb-1">{t('perMonth')}</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5", isRecommended ? "bg-primary/20" : "bg-white/5")}>
                          <Check className={cn("w-3 h-3", isRecommended ? "text-primary" : "text-emerald-400")} />
                        </div>
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || subscribing === plan.id}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2",
                      isCurrent
                        ? "bg-white/5 text-muted-foreground cursor-default border border-white/10"
                        : isRecommended
                        ? "gold-gradient-bg shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
                        : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-foreground"
                    )}
                  >
                    {subscribing === plan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCurrent ? (
                      t('currentPlan')
                    ) : plan.price === 0 ? (
                      t('getStarted')
                    ) : (
                      t('subscribe')
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Commission note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-6 rounded-2xl bg-card border border-white/5 text-center max-w-2xl mx-auto"
        >
          <p className="text-sm text-muted-foreground">
            🤝 {t('commissionNotice')} — Free users contribute a small affiliate fee when they buy through Saqqa Search. Premium subscribers enjoy commission-free purchases.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
