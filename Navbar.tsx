import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, Heart, Search, Menu, X, ChevronDown } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { useGetWishlist } from "@workspace/api-client-react";

const NAV_CATEGORIES = [
  { label: "MEN", slug: "men" },
  { label: "WOMEN", slug: "women" },
  { label: "KIDS", slug: "kids" },
  { label: "HOME & LIVING", slug: "home" },
  { label: "BEAUTY", slug: "beauty" },
  { label: "STUDIO", slug: "studio" },
];

export function Navbar() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: cart } = useGetCart();
  const { data: wishlist } = useGetWishlist();

  const cartCount = cart?.totalItems ?? 0;
  const wishlistCount = wishlist?.length ?? 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center gap-6 h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex-shrink-0 font-bold text-2xl tracking-tight"
            style={{ color: "#FF3F6C", fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}
          >
            flipwhis
          </button>

          {/* Category Nav - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {NAV_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="px-3 py-1 text-[11px] font-bold tracking-wider text-gray-700 hover:text-[#FF3F6C] transition-colors uppercase whitespace-nowrap flex items-center gap-0.5 group"
              >
                {cat.label}
                <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Profile */}
            <button className="hidden sm:flex flex-col items-center px-3 py-1 hover:text-[#FF3F6C] transition-colors text-gray-700 min-w-[52px]">
              <span className="text-xs font-semibold">Profile</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className="flex flex-col items-center px-3 py-1 hover:text-[#FF3F6C] transition-colors text-gray-700 relative min-w-[52px]"
            >
              <div className="relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF3F6C] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold mt-0.5 hidden sm:block">Wishlist</span>
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="flex flex-col items-center px-3 py-1 hover:text-[#FF3F6C] transition-colors text-gray-700 relative min-w-[52px]"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF3F6C] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold mt-0.5 hidden sm:block">Bag</span>
            </button>

            {/* Orders */}
            <button
              onClick={() => navigate("/orders")}
              className="hidden sm:flex flex-col items-center px-3 py-1 hover:text-[#FF3F6C] transition-colors text-gray-700 min-w-[52px]"
            >
              <span className="text-[11px] font-semibold">Orders</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => navigate("/admin")}
              className="hidden sm:flex flex-col items-center px-3 py-1 hover:text-[#FF3F6C] transition-colors text-gray-700 min-w-[52px]"
            >
              <span className="text-[11px] font-semibold">Admin</span>
            </button>

            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-sm focus:outline-none"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3">
          <div className="flex flex-col gap-1">
            {NAV_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => { navigate(`/category/${cat.slug}`); setMobileOpen(false); }}
                className="text-left py-2 text-sm font-semibold text-gray-700 hover:text-[#FF3F6C] border-b border-gray-50"
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => { navigate("/orders"); setMobileOpen(false); }}
              className="text-left py-2 text-sm font-semibold text-gray-700 hover:text-[#FF3F6C] border-b border-gray-50"
            >
              MY ORDERS
            </button>
            <button
              onClick={() => { navigate("/admin"); setMobileOpen(false); }}
              className="text-left py-2 text-sm font-semibold text-gray-700 hover:text-[#FF3F6C]"
            >
              ADMIN PANEL
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
