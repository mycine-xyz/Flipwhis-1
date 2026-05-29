import { useState } from "react";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { useAddToWishlist, useRemoveFromWishlist, useGetWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  const [, navigate] = useLocation();
  const [imgIdx, setImgIdx] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: wishlist } = useGetWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isWishlisted = wishlist?.some((w) => w.productId === product.id) ?? false;

  function toggleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist.mutate(
        { productId: product.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
            toast({ description: "Removed from wishlist" });
          },
        }
      );
    } else {
      addToWishlist.mutate(
        { data: { productId: product.id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
            toast({ description: "Added to wishlist!" });
          },
        }
      );
    }
  }

  const mainImage = product.imageUrls[imgIdx] || product.imageUrls[0] || "https://via.placeholder.com/300x400?text=No+Image";

  return (
    <div
      className="product-card bg-white cursor-pointer rounded-sm overflow-hidden border border-gray-100 group"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => product.imageUrls[1] && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "3/4" }}>
        <img
          src={mainImage}
          alt={product.name}
          className="product-image w-full h-full object-cover"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Out of Stock</span>
          </div>
        )}
        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-[#FF3F6C] text-[#FF3F6C]" : "text-gray-400"}`}
          />
        </button>
        {/* Discount badge */}
        {product.discount >= 30 && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#FF3F6C] text-white text-center text-[10px] font-bold py-0.5 uppercase tracking-wider">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 pb-3">
        <p className="text-[12px] font-bold text-gray-800 uppercase tracking-wide truncate">{product.brand}</p>
        <p className="text-[12px] text-gray-500 truncate mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-sm font-bold text-gray-900">&#8377;{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">&#8377;{product.originalPrice.toLocaleString()}</span>
          <span className="text-xs font-semibold text-orange-500">({product.discount}% OFF)</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            <span>{product.rating}</span>
            <span>★</span>
          </div>
          <span className="text-[11px] text-gray-400">({product.reviewCount.toLocaleString()})</span>
        </div>
      </div>
    </div>
  );
}
