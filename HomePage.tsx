import { useLocation } from "wouter";
import { useGetFeaturedProducts, useListCategories, useGetProductSummary } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import { ChevronRight } from "lucide-react";

const HERO_BANNERS = [
  {
    title: "End of Season Sale",
    subtitle: "Min 50-80% OFF",
    cta: "Shop Now",
    slug: "women",
    bg: "from-[#FF3F6C] to-[#c42d52]",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh Summer Styles",
    cta: "Explore",
    slug: "men",
    bg: "from-gray-900 to-gray-700",
    img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80",
  },
];

const TOP_BRANDS = [
  { name: "Nike", logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" },
  { name: "H&M", logo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80" },
  { name: "Levis", logo: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80" },
  { name: "Zara", logo: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=200&q=80" },
  { name: "Lakme", logo: "https://images.unsplash.com/photo-1586495777744-4e6232bf2ec1?w=200&q=80" },
  { name: "Biba", logo: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80" },
];

export default function HomePage() {
  const [, navigate] = useLocation();
  const { data: featured, isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: categories } = useListCategories();
  const { data: summary } = useGetProductSummary();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ height: "420px" }}>
        <div className={`absolute inset-0 bg-gradient-to-r ${HERO_BANNERS[0].bg}`}>
          <img
            src={HERO_BANNERS[0].img}
            alt="Sale"
            className="w-full h-full object-cover mix-blend-multiply opacity-40"
          />
        </div>
        <div className="relative h-full flex items-center">
          <div className="max-w-screen-xl mx-auto px-8 w-full">
            <div className="max-w-lg">
              <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-2">Limited Time Offer</p>
              <h1 className="text-5xl font-black text-white leading-tight mb-2">{HERO_BANNERS[0].title}</h1>
              <p className="text-2xl font-bold text-white/90 mb-6">{HERO_BANNERS[0].subtitle}</p>
              <button
                onClick={() => navigate(`/category/${HERO_BANNERS[0].slug}`)}
                className="bg-white text-[#FF3F6C] px-8 py-3 font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
              >
                {HERO_BANNERS[0].cta}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {(categories ?? []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-full rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#FF3F6C] transition-all" style={{ aspectRatio: "1" }}>
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 group-hover:text-[#FF3F6C] transition-colors">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="bg-white border-y border-gray-100 py-5">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center justify-around text-center flex-wrap gap-4">
              <div>
                <p className="text-2xl font-black text-[#FF3F6C]">{summary.totalProducts}+</p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Products</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#FF3F6C]">{summary.brands.length}+</p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Brands</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#FF3F6C]">Up to {Math.max(...Object.keys(summary.categoryCounts ?? {}).map(() => 50))}% OFF</p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Discount</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#FF3F6C]">Free</p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Delivery on &#8377;499+</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Products */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
          <button
            onClick={() => navigate("/category/women")}
            className="flex items-center gap-1 text-sm text-[#FF3F6C] font-semibold hover:underline"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {featuredLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(featured ?? []).slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Sale Banner */}
      <div className="max-w-screen-xl mx-auto px-4 pb-8">
        <div
          className="relative overflow-hidden rounded-sm cursor-pointer"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", minHeight: "160px" }}
          onClick={() => navigate("/category/men")}
        >
          <div className="flex items-center justify-between p-8">
            <div>
              <p className="text-[#FF3F6C] text-sm font-bold uppercase tracking-widest mb-1">Men's Fashion</p>
              <h3 className="text-3xl font-black text-white mb-2">New Season,<br />New Style</h3>
              <button className="bg-[#FF3F6C] text-white px-6 py-2 text-sm font-bold uppercase tracking-wide hover:bg-[#e0365f] transition-colors">
                Explore Now
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&q=80"
              alt="Men's Fashion"
              className="hidden sm:block h-40 object-cover rounded"
            />
          </div>
        </div>
      </div>

      {/* Top Brands */}
      <div className="max-w-screen-xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Top Brands</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {TOP_BRANDS.map((brand) => (
            <div
              key={brand.name}
              onClick={() => navigate(`/search?q=${brand.name}`)}
              className="bg-white border border-gray-100 rounded-sm overflow-hidden cursor-pointer hover:border-[#FF3F6C] hover:shadow-md transition-all group"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ aspectRatio: "1" }}
              />
              <p className="text-center text-[11px] font-bold uppercase tracking-wider py-2 text-gray-700 group-hover:text-[#FF3F6C] transition-colors">{brand.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-8">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            {[
              { title: "Online Shopping", links: ["Men", "Women", "Kids", "Home & Living", "Beauty"] },
              { title: "Customer Policies", links: ["Contact Us", "FAQ", "T&C", "Terms Of Use", "Track Orders"] },
              { title: "Experience Flipwhis", links: ["Download App", "Gift Cards", "Returns Policy"] },
              { title: "Useful Links", links: ["Blog", "Careers", "Press", "Sitemap"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">{col.title}</h4>
                <ul className="space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link} className="text-xs hover:text-white cursor-pointer transition-colors">{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-xs">
            <span className="font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>flipwhis</span>
            <span className="mx-2">|</span>
            <span>In partnership with Flipkart</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
