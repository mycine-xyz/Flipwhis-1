import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useListProducts, useGetProductSummary, getListProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Recommended", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Biggest Discount", value: "discount" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "26", "28", "30", "32", "34", "36", "38", "39", "40", "42", "44"];
const DISCOUNT_OPTIONS = [10, 20, 30, 40, 50, 60, 70];

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        className="flex items-center justify-between w-full py-3 text-sm font-bold text-gray-800 uppercase tracking-wide"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug || "";
  const [, navigate] = useLocation();

  const [sort, setSort] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minDiscount, setMinDiscount] = useState<number | undefined>();
  const [page] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const queryParams = {
    category: slug,
    sort: sort || undefined,
    brand: selectedBrands.length === 1 ? selectedBrands[0] : undefined,
    minPrice,
    maxPrice,
    discount: minDiscount,
    page,
    limit: 20,
  };

  const { data, isLoading } = useListProducts(queryParams, {
    query: { queryKey: getListProductsQueryKey(queryParams) },
  });

  const { data: summary } = useGetProductSummary();

  const categoryLabel = slug.charAt(0).toUpperCase() + slug.slice(1);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  const activeFiltersCount = selectedBrands.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (minDiscount ? 1 : 0);

  function clearAll() {
    setSelectedBrands([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinDiscount(undefined);
    setSort("");
  }

  const FilterPanel = () => (
    <div className="bg-white rounded-sm border border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-800">Filters</h3>
        {activeFiltersCount > 0 && (
          <button onClick={clearAll} className="text-xs text-[#FF3F6C] font-semibold uppercase tracking-wide">
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>
      <div className="px-4">
        <AccordionSection title="Brand" defaultOpen>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {(summary?.brands ?? []).map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="accent-[#FF3F6C] w-3.5 h-3.5"
                />
                <span className="text-xs text-gray-700 group-hover:text-[#FF3F6C] transition-colors">{brand}</span>
              </label>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="Price Range">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ""}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF3F6C]"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ""}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF3F6C]"
              />
            </div>
            {summary && (
              <p className="text-[10px] text-gray-400">
                Range: &#8377;{summary.priceRange.min.toLocaleString()} – &#8377;{summary.priceRange.max.toLocaleString()}
              </p>
            )}
          </div>
        </AccordionSection>

        <AccordionSection title="Discount">
          <div className="space-y-2">
            {DISCOUNT_OPTIONS.map((d) => (
              <label key={d} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="discount"
                  checked={minDiscount === d}
                  onChange={() => setMinDiscount(minDiscount === d ? undefined : d)}
                  className="accent-[#FF3F6C]"
                />
                <span className="text-xs text-gray-700 group-hover:text-[#FF3F6C] transition-colors">{d}% and above</span>
              </label>
            ))}
          </div>
        </AccordionSection>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-screen-xl mx-auto">
          <nav className="text-xs text-gray-400 flex items-center gap-1">
            <button onClick={() => navigate("/")} className="hover:text-[#FF3F6C]">Home</button>
            <span>/</span>
            <span className="text-gray-700 font-semibold capitalize">{categoryLabel}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <FilterPanel />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900 capitalize">{categoryLabel}</h1>
                {data && (
                  <p className="text-xs text-gray-500 mt-0.5">{data.total.toLocaleString()} items</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="lg:hidden flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-sm hover:border-[#FF3F6C] hover:text-[#FF3F6C]"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-300 rounded-sm px-3 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#FF3F6C] bg-white"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBrands.map((brand) => (
                  <span key={brand} className="flex items-center gap-1 bg-white border border-[#FF3F6C] text-[#FF3F6C] text-xs font-semibold px-2 py-1 rounded-full">
                    {brand}
                    <button onClick={() => toggleBrand(brand)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {minDiscount && (
                  <span className="flex items-center gap-1 bg-white border border-[#FF3F6C] text-[#FF3F6C] text-xs font-semibold px-2 py-1 rounded-full">
                    {minDiscount}%+ OFF
                    <button onClick={() => setMinDiscount(undefined)}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Mobile Filter Sheet */}
            {showFilter && (
              <div className="lg:hidden mb-4">
                <FilterPanel />
              </div>
            )}

            {/* Product Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : data && data.products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-sm border border-gray-100 py-20 text-center">
                <p className="text-4xl mb-4">&#128565;</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters</p>
                <button
                  onClick={clearAll}
                  className="bg-[#FF3F6C] text-white px-6 py-2 text-sm font-bold uppercase tracking-wide"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
