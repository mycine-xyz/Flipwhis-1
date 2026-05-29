import { useLocation } from "wouter";
import {
  useGetWishlist,
  useRemoveFromWishlist,
  useAddToCart,
  getGetWishlistQueryKey,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: wishlist, isLoading } = useGetWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  function handleRemove(productId: number) {
    removeFromWishlist.mutate(
      { productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
          toast({ description: "Removed from wishlist" });
        },
      }
    );
  }

  function handleMoveToBag(item: { productId: number; name: string }) {
    addToCart.mutate(
      { data: { productId: item.productId, size: "M", color: "Default", quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ description: "Moved to bag!" });
          navigate("/cart");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-sm" style={{ aspectRatio: "3/4" }} />
          ))}
        </div>
      </div>
    );
  }

  const items = wishlist ?? [];

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <Heart className="w-24 h-24 text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8 text-center">Save items you love and find them here anytime.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#FF3F6C] text-white px-10 py-3 font-bold uppercase tracking-wide hover:bg-[#e0365f] transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-[#FF3F6C] fill-[#FF3F6C]" />
          <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
          <span className="text-sm text-gray-500">({items.length} items)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-sm overflow-hidden group product-card"
            >
              {/* Image */}
              <div
                className="relative overflow-hidden cursor-pointer"
                style={{ aspectRatio: "3/4" }}
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="product-image w-full h-full object-cover"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(item.productId); }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Details */}
              <div className="p-2.5">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide truncate">{item.brand}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-sm font-bold text-gray-900">&#8377;{item.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through">&#8377;{item.originalPrice.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-orange-500">({item.discount}% OFF)</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Added {new Date(item.addedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
                <button
                  onClick={() => handleMoveToBag(item)}
                  className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 border border-gray-800 text-gray-800 text-xs font-bold uppercase tracking-wide hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Move to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
