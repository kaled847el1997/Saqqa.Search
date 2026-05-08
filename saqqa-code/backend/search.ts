import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

interface ProductInfo {
  name: string;
  category: string;
  description: string;
  brand: string;
  confidence: number;
}

interface PriceResult {
  store: string;
  storeLogo: string;
  price: string;
  currency: string;
  url: string;
  title: string;
  rating: number;
  reviewCount: number;
  availability: string;
  isCheapest: boolean;
  shipping: string;
}

// Google Shopping shows actual product listings with real prices + direct buy buttons.
// Adding store name to the query focuses results on that specific retailer.
const STORES = [
  { name: "Amazon",     logo: "🛒", searchUrl: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + " Amazon")}&tbs=vw:1` },
  { name: "eBay",       logo: "🏷️", searchUrl: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + " eBay")}&tbs=vw:1` },
  { name: "AliExpress", logo: "🌐", searchUrl: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + " AliExpress")}&tbs=vw:1` },
  { name: "Walmart",    logo: "🏪", searchUrl: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + " Walmart")}&tbs=vw:1` },
  { name: "Best Buy",   logo: "🔵", searchUrl: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + " Best Buy")}&tbs=vw:1` },
  { name: "Etsy",       logo: "🎨", searchUrl: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + " Etsy")}&tbs=vw:1` },
];

const SERVICE_STORES = [
  { name: "Fiverr", logo: "🟢", searchUrl: (q: string) => `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(q)}` },
  { name: "Upwork", logo: "💼", searchUrl: (q: string) => `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(q)}` },
  { name: "Freelancer", logo: "🔷", searchUrl: (q: string) => `https://www.freelancer.com/search/?q=${encodeURIComponent(q)}` },
  { name: "PeoplePerHour", logo: "🕐", searchUrl: (q: string) => `https://www.peopleperhour.com/s?search=${encodeURIComponent(q)}` },
  { name: "99designs", logo: "✏️", searchUrl: (q: string) => `https://99designs.com/search?q=${encodeURIComponent(q)}` },
  { name: "Toptal", logo: "🏆", searchUrl: (q: string) => `https://www.toptal.com/search?q=${encodeURIComponent(q)}` },
];

function langName(language: string): string {
  if (language === "ar") return "Arabic";
  if (language === "tr") return "Turkish";
  if (language === "fr") return "French";
  return "English";
}

async function identifyProduct(imageBase64: string, language: string): Promise<{ product: ProductInfo; searchQuery: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "high" } },
          {
            type: "text",
            text: `You are a product identification expert. Analyze this product image and identify it precisely.
Respond in ${langName(language)}.

Return a JSON object with exactly these fields:
{
  "name": "exact product name in ${langName(language)}",
  "category": "product category in ${langName(language)}",
  "description": "brief 1-2 sentence description in ${langName(language)}",
  "brand": "brand name if visible else empty string",
  "confidence": number between 0.0 and 1.0,
  "searchQuery": "best English search query to find this product on shopping sites"
}

Only return valid JSON, no markdown, no explanation.`,
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  let parsed: { name: string; category: string; description: string; brand: string; confidence: number; searchQuery: string };
  try {
    parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    parsed = { name: "Unknown Product", category: "General", description: "", brand: "", confidence: 0.5, searchQuery: "product" };
  }

  return {
    product: {
      name: parsed.name || "Unknown Product",
      category: parsed.category || "General",
      description: parsed.description || "",
      brand: parsed.brand || "",
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
    },
    searchQuery: parsed.searchQuery || parsed.name || "product",
  };
}

async function generatePriceResults(searchQuery: string, language: string, isService = false): Promise<PriceResult[]> {
  const stores = isService ? SERVICE_STORES : STORES;
  const storeNames = stores.map((s) => s.name).join(", ");
  const currency = isService ? "USD (per hour or per project)" : "USD";

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `You are a price comparison assistant. Generate realistic price comparison data for: "${searchQuery}"

For each of these ${isService ? "freelance/service" : "shopping"} stores: ${storeNames}
Generate realistic pricing data in ${currency}. Vary prices realistically. Translate product titles to ${langName(language)}.

Return a JSON array with exactly ${stores.length} objects in this order [${storeNames}]:
[
  {
    "store": "store name",
    "price": "XX.XX",
    "title": "listing title in ${langName(language)}",
    "rating": number 3.0-5.0,
    "reviewCount": integer,
    "availability": "${isService ? "Available" : "In Stock"}" or similar,
    "shipping": "${isService ? "Remote" : "Free shipping"}" or similar
  }
]

Only return valid JSON array, no markdown, no explanation.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  let parsed: Array<{ store: string; price: string; title: string; rating: number; reviewCount: number; availability: string; shipping: string }>;
  try {
    parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    parsed = stores.map((s) => ({ store: s.name, price: (Math.random() * 50 + 5).toFixed(2), title: searchQuery, rating: 4.0, reviewCount: 50, availability: "Available", shipping: "Free" }));
  }

  const results: PriceResult[] = stores.map((store, i) => {
    const data = parsed[i] || { store: store.name, price: "0.00", title: searchQuery, rating: 4.0, reviewCount: 0, availability: "Available", shipping: "Free" };
    return {
      store: store.name,
      storeLogo: store.logo,
      price: data.price || "N/A",
      currency: "USD",
      url: store.searchUrl(searchQuery),
      title: data.title || searchQuery,
      rating: Math.min(5, Math.max(0, data.rating || 4.0)),
      reviewCount: data.reviewCount || 0,
      availability: data.availability || "Available",
      isCheapest: false,
      shipping: data.shipping || "Standard",
    };
  });

  const validPrices = results.filter((r) => !isNaN(parseFloat(r.price)));
  if (validPrices.length > 0) {
    const minPrice = Math.min(...validPrices.map((r) => parseFloat(r.price)));
    results.forEach((r) => { r.isCheapest = parseFloat(r.price) === minPrice; });
  }

  return results;
}

// ─── Image Analysis ───────────────────────────────────────────────────────────
router.post("/search/analyze", async (req, res) => {
  try {
    const { imageBase64, language = "en" } = req.body as { imageBase64: string; language: string };
    if (!imageBase64) { res.status(400).json({ error: "imageBase64 is required" }); return; }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const { product, searchQuery } = await identifyProduct(cleanBase64, language);
    const results = await generatePriceResults(searchQuery, language);

    res.json({ product, results, searchQuery, totalResults: results.length });
  } catch (error) {
    console.error("Search analyze error:", error);
    res.status(500).json({ error: "Failed to analyze product image" });
  }
});

// ─── Text Search ──────────────────────────────────────────────────────────────
router.post("/search/text", async (req, res) => {
  try {
    const { query, language = "en" } = req.body as { query: string; language: string };
    if (!query?.trim()) { res.status(400).json({ error: "query is required" }); return; }

    const productResponse = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{
        role: "user",
        content: `Given the search query: "${query}"
Respond in ${langName(language)}.

Return a JSON object:
{
  "name": "product name in ${langName(language)}",
  "category": "category in ${langName(language)}",
  "description": "brief description in ${langName(language)}",
  "brand": "brand if known else empty string",
  "confidence": 0.9,
  "searchQuery": "optimized English search query for shopping sites"
}

Only return valid JSON.`,
      }],
    });

    const content = productResponse.choices[0]?.message?.content ?? "{}";
    let parsed: ProductInfo & { searchQuery?: string };
    try {
      parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
    } catch {
      parsed = { name: query, category: "General", description: "", brand: "", confidence: 0.9, searchQuery: query };
    }

    const searchQuery = (parsed as { searchQuery?: string }).searchQuery || query;
    const results = await generatePriceResults(searchQuery, language);

    res.json({
      product: { name: parsed.name || query, category: parsed.category || "General", description: parsed.description || "", brand: parsed.brand || "", confidence: parsed.confidence || 0.9 },
      results,
      searchQuery,
      totalResults: results.length,
    });
  } catch (error) {
    console.error("Text search error:", error);
    res.status(500).json({ error: "Failed to search for product" });
  }
});

// ─── Description Search ───────────────────────────────────────────────────────
router.post("/search/describe", async (req, res) => {
  try {
    const { description, language = "en" } = req.body as { description: string; language: string };
    if (!description?.trim()) { res.status(400).json({ error: "description is required" }); return; }

    const guessResponse = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{
        role: "user",
        content: `A user described a product they are looking for: "${description}"

Your job is to intelligently identify what product they mean and provide search data.
Respond in ${langName(language)}.

Return a JSON object:
{
  "name": "the most likely product name in ${langName(language)}",
  "category": "product category in ${langName(language)}",
  "description": "interpreted product description in ${langName(language)} that confirms what you guessed",
  "brand": "likely brand if applicable else empty string",
  "confidence": number 0.7-0.95,
  "searchQuery": "optimized English search query to find this product on shopping sites",
  "alternatives": ["alternative product name 1 in ${langName(language)}", "alternative 2 in ${langName(language)}"]
}

Only return valid JSON.`,
      }],
    });

    const content = guessResponse.choices[0]?.message?.content ?? "{}";
    let parsed: ProductInfo & { searchQuery?: string; alternatives?: string[] };
    try {
      parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
    } catch {
      parsed = { name: description, category: "General", description: "", brand: "", confidence: 0.8, searchQuery: description };
    }

    const searchQuery = (parsed as { searchQuery?: string }).searchQuery || description;
    const results = await generatePriceResults(searchQuery, language);

    res.json({
      product: {
        name: parsed.name || description,
        category: parsed.category || "General",
        description: parsed.description || `Results based on: ${description}`,
        brand: parsed.brand || "",
        confidence: parsed.confidence || 0.8,
      },
      results,
      searchQuery,
      totalResults: results.length,
      alternatives: (parsed as { alternatives?: string[] }).alternatives || [],
    });
  } catch (error) {
    console.error("Describe search error:", error);
    res.status(500).json({ error: "Failed to process description" });
  }
});

// ─── Service Search ───────────────────────────────────────────────────────────
router.post("/search/service", async (req, res) => {
  try {
    const { query, language = "en" } = req.body as { query: string; language: string };
    if (!query?.trim()) { res.status(400).json({ error: "query is required" }); return; }

    const serviceResponse = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{
        role: "user",
        content: `Given this service/freelance query: "${query}"
Respond in ${langName(language)}.

Return a JSON object:
{
  "name": "service name in ${langName(language)}",
  "category": "service category in ${langName(language)}",
  "description": "brief description in ${langName(language)}",
  "brand": "",
  "confidence": 0.9,
  "searchQuery": "English search query for freelance platforms"
}

Only return valid JSON.`,
      }],
    });

    const content = serviceResponse.choices[0]?.message?.content ?? "{}";
    let parsed: ProductInfo & { searchQuery?: string };
    try {
      parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
    } catch {
      parsed = { name: query, category: "Service", description: "", brand: "", confidence: 0.9, searchQuery: query };
    }

    const searchQuery = (parsed as { searchQuery?: string }).searchQuery || query;
    const results = await generatePriceResults(searchQuery, language, true);

    res.json({
      product: { name: parsed.name || query, category: parsed.category || "Service", description: parsed.description || "", brand: "", confidence: parsed.confidence || 0.9 },
      results,
      searchQuery,
      totalResults: results.length,
    });
  } catch (error) {
    console.error("Service search error:", error);
    res.status(500).json({ error: "Failed to search for service" });
  }
});

// ─── Affiliate Click Tracking ─────────────────────────────────────────────────
router.post("/search/click", (req, res) => {
  try {
    const { store, url, productName } = req.body as { store: string; url: string; productName?: string };
    if (!store || !url) { res.status(400).json({ error: "store and url are required" }); return; }

    // Log the affiliate click (in production this would be stored in DB)
    console.info(`[AFFILIATE] Click → ${store} | Product: ${productName || "unknown"} | URL: ${url.substring(0, 80)}`);

    res.json({ success: true, redirectUrl: url });
  } catch (error) {
    console.error("Click tracking error:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

// ─── Featured Products (Under $5, Deals, Services) ───────────────────────────
const FEATURED_CACHE: { data: object | null; expires: number; lang: string } = { data: null, expires: 0, lang: "" };

router.get("/products/featured", async (req, res) => {
  try {
    const now = Date.now();
    const language = (req.query.language as string) || "en";
    const forceRefresh = req.query.refresh === "true";
    if (!forceRefresh && FEATURED_CACHE.data && now < FEATURED_CACHE.expires && FEATURED_CACHE.lang === language) {
      res.json(FEATURED_CACHE.data);
      return;
    }

    const ln = langName(language);

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{
        role: "user",
        content: `Generate a realistic home page for a price comparison website. Respond in ${ln}.

Return a JSON object with exactly:
{
  "underFive": [
    {
      "name": "product name in ${ln}",
      "price": "X.XX",
      "store": "store name",
      "storeLogo": "emoji",
      "url": "https://www.amazon.com/s?k=query",
      "category": "category in ${ln}",
      "tag": "Best Seller" or "New" or "Popular" or "Trending"
    }
  ],
  "deals": [
    {
      "name": "product name in ${ln}",
      "originalPrice": "XX.XX",
      "salePrice": "XX.XX",
      "discount": "XX%",
      "store": "store name",
      "storeLogo": "emoji",
      "url": "https://www.amazon.com/s?k=query",
      "endsIn": "2h 15m" or "Today" or "3 days",
      "category": "category in ${ln}"
    }
  ],
  "services": [
    {
      "name": "service name in ${ln}",
      "price": "X.XX",
      "unit": "per hour" or "per project",
      "store": "Fiverr" or "Upwork" etc,
      "storeLogo": "emoji",
      "url": "https://www.fiverr.com/search/gigs?query=...",
      "category": "category in ${ln}",
      "tag": "Top Rated" or "Popular"
    }
  ]
}

CRITICAL URL RULES — all URLs must be Google Shopping direct product links:
- underFive URLs: https://www.google.com/search?tbm=shop&q=EXACT+PRODUCT+NAME&tbs=mr:1,price:1,ppr_max:5
- deals URLs: https://www.google.com/search?tbm=shop&q=EXACT+PRODUCT+NAME+sale&tbs=vw:1
- services URLs: use real Fiverr/Upwork search pages e.g. https://www.fiverr.com/search/gigs?query=QUERY

underFive: exactly 8 popular, real products under $5 (phone cases, USB cables, screen protectors, LED strips, keychains, stickers, small gadgets — common items people actually buy)
deals: exactly 8 popular tech/fashion/home products on sale with 20-70% discounts
services: exactly 6 digital services (logo design, video editing, copywriting, social media, translation, web design)

Generate realistic data only. Only return valid JSON.`,
      }],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let parsed: object;
    try {
      parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
    } catch {
      parsed = { underFive: [], deals: [], services: [] };
    }

    FEATURED_CACHE.data = parsed;
    FEATURED_CACHE.lang = language;
    FEATURED_CACHE.expires = now + 10 * 60 * 1000; // cache 10 minutes

    res.json(parsed);
  } catch (error) {
    console.error("Featured products error:", error);
    res.status(500).json({ error: "Failed to load featured products" });
  }
});

// ─── Subscription Plans ───────────────────────────────────────────────────────
router.get("/subscriptions/plans", (_req, res) => {
  res.json({
    plans: [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "USD",
        period: "month",
        features: [
          "10 searches per day",
          "Image & text search",
          "6 stores compared",
          "Basic price results",
        ],
        limits: { dailySearches: 10, stores: 6 },
        recommended: false,
      },
      {
        id: "pro",
        name: "Pro",
        price: 4.99,
        currency: "USD",
        period: "month",
        features: [
          "100 searches per day",
          "Description-based AI search",
          "Service marketplace search",
          "10 stores compared",
          "Price history charts",
          "Priority AI analysis",
        ],
        limits: { dailySearches: 100, stores: 10 },
        recommended: true,
      },
      {
        id: "premium",
        name: "Premium",
        price: 9.99,
        currency: "USD",
        period: "month",
        features: [
          "Unlimited searches",
          "All Pro features",
          "Exclusive member deals",
          "No commission on purchases",
          "Early access to new features",
          "Priority customer support",
          "Export results to CSV",
        ],
        limits: { dailySearches: -1, stores: -1 },
        recommended: false,
      },
    ],
  });
});

router.post("/subscriptions/subscribe", (req, res) => {
  const { planId } = req.body as { planId: string };
  if (!planId) { res.status(400).json({ error: "planId is required" }); return; }
  // In production: integrate with Stripe or similar
  res.json({ success: true, message: "Subscription activated", planId });
});

export default router;
