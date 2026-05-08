import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ProductSearchResult } from '@workspace/api-client-react';

type Language = 'en' | 'ar' | 'tr' | 'fr';

interface TranslationDict {
  [key: string]: string;
}

const translations: Record<Language, TranslationDict> = {
  en: {
    appTitle: "Saqqa Search",
    searchPlaceholder: "Search for any product...",
    uploadImage: "Upload Image",
    dragDrop: "Drag & drop an image here, or click to browse",
    analyzing: "Analyzing product via AI...",
    searching: "Searching for best prices...",
    resultsFor: "Results for",
    bestPrice: "Best Price",
    buyNow: "Buy Now",
    shipping: "Shipping",
    availability: "Availability",
    createdBy: "Created by Khaled Al-Saqqa from Gaza",
    category: "Category",
    confidence: "Match Confidence",
    noResults: "No results found for this search.",
    tryAgain: "New Search",
    language: "Language",
    searchModeText: "Text Search",
    searchModeImage: "Visual Search",
    searchModeDescribe: "Describe It",
    searchModeService: "Services",
    brand: "Brand",
    reviews: "reviews",
    describeSearchPlaceholder: "Describe what you're looking for... (e.g. a device that helps me sleep better)",
    describeSearchBtn: "Find Products",
    guessedProduct: "We identified your product as",
    alternatives: "You might also mean",
    commissionNotice: "Supporting Saqqa Search with a small commission",
    commissionBadge: "Saqqa Deal",
    underFiveTitle: "Under $5 Deals",
    underFiveSubtitle: "Great products at unbeatable prices",
    dealsTitle: "Flash Deals",
    dealsSubtitle: "Limited-time offers — updated live",
    servicesTitle: "Services Marketplace",
    servicesSubtitle: "Hire top talent across the world",
    pricingTitle: "Simple, Transparent Pricing",
    pricingSubtitle: "Start free, upgrade when you need more",
    mostPopular: "Most Popular",
    perMonth: "/ month",
    freeForever: "Free forever",
    getStarted: "Get Started",
    subscribe: "Subscribe Now",
    currentPlan: "Current Plan",
    searchesPerDay: "searches/day",
    unlimited: "Unlimited",
    viewAll: "View All",
    loading: "Loading...",
    comparePrice: "Compare Prices",
    originalPrice: "Was",
    discount: "OFF",
    endsIn: "Ends in",
    perHour: "per hour",
    perProject: "per project",
    navDeals: "Deals",
    navServices: "Services",
    navPricing: "Pricing",
    heroTitle1: "Find the",
    heroTitle2: "Perfect Price",
    heroTitle3: "Anywhere, Anytime.",
    heroSubtitle: "Upload an image, describe a product, or type a name — our AI finds the cheapest prices instantly.",
  },
  ar: {
    appTitle: "Saqqa Search",
    searchPlaceholder: "ابحث عن أي منتج...",
    uploadImage: "رفع صورة",
    dragDrop: "اسحب وأفلت الصورة هنا، أو انقر للتصفح",
    analyzing: "جاري تحليل المنتج بالذكاء الاصطناعي...",
    searching: "جاري البحث عن أفضل الأسعار...",
    resultsFor: "نتائج البحث عن",
    bestPrice: "أفضل سعر",
    buyNow: "اشتري الآن",
    shipping: "الشحن",
    availability: "التوفر",
    createdBy: "تم الإنشاء بواسطة خالد السقا من غزة",
    category: "التصنيف",
    confidence: "نسبة التطابق",
    noResults: "لم يتم العثور على نتائج لهذا البحث.",
    tryAgain: "بحث جديد",
    language: "اللغة",
    searchModeText: "بحث نصي",
    searchModeImage: "بحث بالصور",
    searchModeDescribe: "وصف المنتج",
    searchModeService: "الخدمات",
    brand: "العلامة التجارية",
    reviews: "تقييمات",
    describeSearchPlaceholder: "صف ما تبحث عنه... (مثال: جهاز يساعدني على النوم بشكل أفضل)",
    describeSearchBtn: "البحث عن منتجات",
    guessedProduct: "لقد تعرّفنا على منتجك كـ",
    alternatives: "ربما تقصد أيضاً",
    commissionNotice: "يدعم Saqqa Search بعمولة صغيرة",
    commissionBadge: "عرض سقا",
    underFiveTitle: "أقل من 5 دولار",
    underFiveSubtitle: "منتجات رائعة بأسعار لا تُصدق",
    dealsTitle: "عروض حصرية",
    dealsSubtitle: "عروض محدودة المدة — تحديث مستمر",
    servicesTitle: "سوق الخدمات",
    servicesSubtitle: "استعن بأفضل المواهب حول العالم",
    pricingTitle: "أسعار شفافة وبسيطة",
    pricingSubtitle: "ابدأ مجاناً، وطوّر اشتراكك عند الحاجة",
    mostPopular: "الأكثر شعبية",
    perMonth: "/ شهر",
    freeForever: "مجاناً للأبد",
    getStarted: "ابدأ الآن",
    subscribe: "اشترك الآن",
    currentPlan: "خطتك الحالية",
    searchesPerDay: "بحث/يوم",
    unlimited: "غير محدود",
    viewAll: "عرض الكل",
    loading: "جاري التحميل...",
    comparePrice: "مقارنة الأسعار",
    originalPrice: "كان",
    discount: "خصم",
    endsIn: "ينتهي في",
    perHour: "في الساعة",
    perProject: "لكل مشروع",
    navDeals: "العروض",
    navServices: "الخدمات",
    navPricing: "الأسعار",
    heroTitle1: "اعثر على",
    heroTitle2: "أفضل سعر",
    heroTitle3: "في أي مكان، في أي وقت.",
    heroSubtitle: "ارفع صورة، أو صف المنتج، أو اكتب اسمه — الذكاء الاصطناعي يجد أرخص سعر فوراً.",
  },
  tr: {
    appTitle: "Saqqa Search",
    searchPlaceholder: "Herhangi bir ürünü arayın...",
    uploadImage: "Resim Yükle",
    dragDrop: "Bir resmi buraya sürükleyip bırakın veya gözatmak için tıklayın",
    analyzing: "Yapay zeka ile ürün analiz ediliyor...",
    searching: "En iyi fiyatlar aranıyor...",
    resultsFor: "Sonuçlar:",
    bestPrice: "En İyi Fiyat",
    buyNow: "Şimdi Al",
    shipping: "Kargo",
    availability: "Durum",
    createdBy: "Gazze'den Khaled Al-Saqqa tarafından oluşturuldu",
    category: "Kategori",
    confidence: "Eşleşme Güveni",
    noResults: "Bu arama için sonuç bulunamadı.",
    tryAgain: "Yeni Arama",
    language: "Dil",
    searchModeText: "Metin Arama",
    searchModeImage: "Görsel Arama",
    searchModeDescribe: "Tarif Et",
    searchModeService: "Hizmetler",
    brand: "Marka",
    reviews: "değerlendirme",
    describeSearchPlaceholder: "Aradığınızı tarif edin... (örn: uyumama yardımcı olan bir cihaz)",
    describeSearchBtn: "Ürün Bul",
    guessedProduct: "Ürününüzü şu olarak tanımladık:",
    alternatives: "Belki şunu da kastediyorsunuz:",
    commissionNotice: "Saqqa Search'i küçük bir komisyonla destekliyorsunuz",
    commissionBadge: "Saqqa Fırsatı",
    underFiveTitle: "5 Dolar Altı Ürünler",
    underFiveSubtitle: "Rakipsiz fiyatlarla harika ürünler",
    dealsTitle: "Flaş Fırsatlar",
    dealsSubtitle: "Sınırlı süreli teklifler — canlı güncelleme",
    servicesTitle: "Hizmet Pazarı",
    servicesSubtitle: "Dünya genelinde en iyi yetenekleri kiralayın",
    pricingTitle: "Basit, Şeffaf Fiyatlandırma",
    pricingSubtitle: "Ücretsiz başlayın, ihtiyaç duyduğunuzda yükseltin",
    mostPopular: "En Popüler",
    perMonth: "/ ay",
    freeForever: "Sonsuza kadar ücretsiz",
    getStarted: "Başla",
    subscribe: "Şimdi Abone Ol",
    currentPlan: "Mevcut Plan",
    searchesPerDay: "arama/gün",
    unlimited: "Sınırsız",
    viewAll: "Tümünü Gör",
    loading: "Yükleniyor...",
    comparePrice: "Fiyatları Karşılaştır",
    originalPrice: "Önceki",
    discount: "İNDİRİM",
    endsIn: "Bitiş",
    perHour: "saatlik",
    perProject: "proje başına",
    navDeals: "Fırsatlar",
    navServices: "Hizmetler",
    navPricing: "Fiyatlar",
    heroTitle1: "Bul",
    heroTitle2: "Mükemmel Fiyatı",
    heroTitle3: "Her Yerde, Her Zaman.",
    heroSubtitle: "Bir fotoğraf yükleyin, ürünü tarif edin veya adını yazın — yapay zekamız anında en ucuz fiyatı bulur.",
  },
  fr: {
    appTitle: "Saqqa Search",
    searchPlaceholder: "Rechercher un produit...",
    uploadImage: "Télécharger une image",
    dragDrop: "Glissez et déposez une image ici, ou cliquez pour parcourir",
    analyzing: "Analyse du produit par l'IA...",
    searching: "Recherche des meilleurs prix...",
    resultsFor: "Résultats pour",
    bestPrice: "Meilleur Prix",
    buyNow: "Acheter",
    shipping: "Livraison",
    availability: "Disponibilité",
    createdBy: "Créé par Khaled Al-Saqqa de Gaza",
    category: "Catégorie",
    confidence: "Confiance",
    noResults: "Aucun résultat trouvé pour cette recherche.",
    tryAgain: "Nouvelle Recherche",
    language: "Langue",
    searchModeText: "Recherche textuelle",
    searchModeImage: "Recherche visuelle",
    searchModeDescribe: "Décrire",
    searchModeService: "Services",
    brand: "Marque",
    reviews: "avis",
    describeSearchPlaceholder: "Décrivez ce que vous cherchez... (ex: un appareil qui m'aide à mieux dormir)",
    describeSearchBtn: "Trouver des produits",
    guessedProduct: "Nous avons identifié votre produit comme",
    alternatives: "Vous voulez peut-être aussi dire",
    commissionNotice: "Vous soutenez Saqqa Search avec une petite commission",
    commissionBadge: "Offre Saqqa",
    underFiveTitle: "Moins de 5$",
    underFiveSubtitle: "De super produits à des prix imbattables",
    dealsTitle: "Offres Flash",
    dealsSubtitle: "Offres limitées — mises à jour en direct",
    servicesTitle: "Marketplace de Services",
    servicesSubtitle: "Recrutez les meilleurs talents du monde entier",
    pricingTitle: "Tarification simple et transparente",
    pricingSubtitle: "Commencez gratuitement, mettez à niveau si besoin",
    mostPopular: "Plus Populaire",
    perMonth: "/ mois",
    freeForever: "Gratuit pour toujours",
    getStarted: "Commencer",
    subscribe: "S'abonner",
    currentPlan: "Plan actuel",
    searchesPerDay: "recherches/jour",
    unlimited: "Illimité",
    viewAll: "Voir Tout",
    loading: "Chargement...",
    comparePrice: "Comparer les Prix",
    originalPrice: "Était",
    discount: "OFF",
    endsIn: "Se termine dans",
    perHour: "par heure",
    perProject: "par projet",
    navDeals: "Offres",
    navServices: "Services",
    navPricing: "Tarifs",
    heroTitle1: "Trouvez le",
    heroTitle2: "Meilleur Prix",
    heroTitle3: "Partout, Tout le Temps.",
    heroSubtitle: "Uploadez une image, décrivez un produit ou tapez son nom — notre IA trouve les prix les plus bas instantanément.",
  }
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  searchResults: ProductSearchResult | null;
  setSearchResults: (results: ProductSearchResult | null) => void;
  isRtl: boolean;
  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;
  subscription: 'free' | 'pro' | 'premium';
  setSubscription: (plan: 'free' | 'pro' | 'premium') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [searchResults, setSearchResults] = useState<ProductSearchResult | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<'free' | 'pro' | 'premium'>('free');

  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  const t = (key: string): string => translations[language][key] || key;

  return (
    <AppContext.Provider value={{
      language, setLanguage, t,
      searchResults, setSearchResults,
      isRtl, uploadedImageUrl, setUploadedImageUrl,
      subscription, setSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
