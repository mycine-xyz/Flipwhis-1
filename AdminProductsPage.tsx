import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminListProducts, getAdminListProductsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Check } from "lucide-react";

const CATEGORIES = ["men", "women", "kids", "beauty", "home"];

type ProductForm = {
  name: string;
  brand: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
  category: string;
  subcategory: string;
  imageUrls: string;
  sizes: string;
  colors: string;
  inStock: boolean;
  tags: string;
};

const emptyForm: ProductForm = {
  name: "", brand: "", description: "", price: "", originalPrice: "",
  discount: "", category: "men", subcategory: "", imageUrls: "",
  sizes: "", colors: "", inStock: true, tags: "",
};

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modal, setModal] = useState<null | "create" | "edit">(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const { data, isLoading } = useAdminListProducts({ page, limit: 15, search: search || undefined });

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function openCreate() {
    setForm(emptyForm);
    setModal("create");
    setEditId(null);
  }

  function openEdit(p: NonNullable<typeof data>["products"][0]) {
    setForm({
      name: p.name,
      brand: p.brand,
      description: p.description ?? "",
      price: String(p.price),
      originalPrice: String(p.originalPrice),
      discount: String(p.discount),
      category: p.category,
      subcategory: p.subcategory,
      imageUrls: (p.imageUrls ?? []).join(", "),
      sizes: (p.sizes ?? []).join(", "),
      colors: (p.colors ?? []).join(", "),
      inStock: p.inStock,
      tags: (p.tags ?? []).join(", "),
    });
    setEditId(p.id);
    setModal("edit");
  }

  function formToPayload() {
    return {
      name: form.name,
      brand: form.brand,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: parseFloat(form.originalPrice || form.price),
      discount: parseFloat(form.discount || "0"),
      category: form.category,
      subcategory: form.subcategory || form.category,
      imageUrls: form.imageUrls.split(",").map(s => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map(s => s.trim()).filter(Boolean),
      inStock: form.inStock,
      tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
    };
  }

  async function handleSave() {
    if (!form.name || !form.brand || !form.price) return;
    setSaving(true);
    try {
      const url = modal === "edit" ? `/api/admin/products/${editId}` : "/api/admin/products";
      const method = modal === "edit" ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formToPayload()) });
      if (!r.ok) throw new Error("Failed");
      await qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      setModal(null);
      showToast(modal === "edit" ? "Product updated!" : "Product created!");
    } catch {
      showToast("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      showToast("Product deleted.");
    } catch {
      showToast("Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Check size={16} className="text-green-400" /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total products</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#FF3F6C] hover:bg-[#e0365f] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
          placeholder="Search products... (press Enter)"
          className="w-full bg-gray-900 border border-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF3F6C]"
        />
        {searchInput && (
          <button onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-800 animate-pulse rounded" /></td></tr>
              ))}
              {!isLoading && data?.products?.map(p => (
                <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrls?.[0] && (
                        <img src={p.imageUrls[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                      )}
                      <div>
                        <div className="font-medium text-white line-clamp-1">{p.name}</div>
                        <div className="text-gray-400 text-xs">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{p.category}</td>
                  <td className="px-4 py-3 text-white font-medium">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">{p.discount}% OFF</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.inStock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {p.inStock ? "In Stock" : "Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yellow-400">★ {Number(p.rating).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && data?.products?.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-sm">
            <span className="text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h2 className="font-bold text-white">{modal === "edit" ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                ["name", "Product Name", "col-span-2"],
                ["brand", "Brand", ""],
                ["category", "Category", ""],
                ["subcategory", "Subcategory", ""],
                ["price", "Price (₹)", ""],
                ["originalPrice", "MRP (₹)", ""],
                ["discount", "Discount (%)", ""],
                ["imageUrls", "Image URLs (comma separated)", "col-span-2"],
                ["sizes", "Sizes (comma separated)", ""],
                ["colors", "Colors (comma separated)", ""],
                ["tags", "Tags (comma separated)", "col-span-2"],
                ["description", "Description", "col-span-2"],
              ] as [keyof ProductForm, string, string][]).map(([key, label, cls]) => (
                <div key={key} className={cls || ""}>
                  <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">{label}</label>
                  {key === "category" ? (
                    <select
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#FF3F6C]"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : key === "description" ? (
                    <textarea
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#FF3F6C] resize-none"
                    />
                  ) : (
                    <input
                      type={["price", "originalPrice", "discount"].includes(key) ? "number" : "text"}
                      value={form[key] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#FF3F6C]"
                    />
                  )}
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-3">
                <label className="text-gray-400 text-xs uppercase tracking-wide">In Stock</label>
                <button
                  onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.inStock ? "bg-[#FF3F6C]" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.inStock ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-white">{form.inStock ? "Yes" : "No"}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.brand || !form.price}
                className="px-5 py-2 bg-[#FF3F6C] hover:bg-[#e0365f] disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {saving ? "Saving..." : modal === "edit" ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
