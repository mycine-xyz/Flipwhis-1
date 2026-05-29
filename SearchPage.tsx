import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Recommended", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Biggest Discount", value: "discount" },
];

export default function SearchPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const query = params.get("q") ?? "";
  const [sort, setSort] = useState("");
  const [newQuery, setNewQuery] = useState(query);

  useEffect(() => {
    setNewQuery(query);
  }, [query]);

  const queryParams = {
    search: query,
    sort: sort || undefined,
    limit: 24,
  };

  const { data, isLoading } = useListProducts(queryParams, {
    query: { queryKey: getListProductsQueryKey(queryParams), enabled: !!query },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-screen-xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-[#FF3F6C] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#FF3F6C] text-white px-5 py-2.5 font-bold text-sm uppercase tracking-wide hover:bg-[#e0365f] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            {query && (
              <h1 className="text-lg font-bold text-gray-900">
                Results for <span className="text-[#FF3F6C]">"{query}"</span>
              </h1>
            )}
            {data && (
              <p className="text-xs text-gray-500 mt-0.5">{data.total.toLocaleString()} products found</p>
            )}
          </div>
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

        {/* Results */}
        {!query ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Search for products, brands, and more</p>
          </div>
        ) : isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : data && data.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-gray-100 py-20 text-center">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-sm text-gray-500 mb-6">We couldn't find anything for "{query}"</p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#FF3F6C] text-white px-6 py-2 text-sm font-bold uppercase tracking-wide hover:bg-[#e0365f] transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
