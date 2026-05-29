import { Router, type IRouter } from "express";
import { db, wishlistItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddToWishlistBody, RemoveFromWishlistParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/wishlist", async (_req, res): Promise<void> => {
  const items = await db.select().from(wishlistItemsTable);
  res.json(items.map(i => ({ ...i, addedAt: i.addedAt.toISOString() })));
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const parsed = AddToWishlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId } = parsed.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  // If already in wishlist, return existing
  const [existing] = await db.select().from(wishlistItemsTable).where(eq(wishlistItemsTable.productId, productId));
  if (existing) {
    res.status(201).json({ ...existing, addedAt: existing.addedAt.toISOString() });
    return;
  }

  const [item] = await db.insert(wishlistItemsTable).values({
    productId,
    name: product.name,
    brand: product.brand,
    price: product.price,
    originalPrice: product.originalPrice,
    discount: product.discount,
    imageUrl: product.imageUrls[0] ?? "",
  }).returning();

  res.status(201).json({ ...item, addedAt: item.addedAt.toISOString() });
});

router.delete("/wishlist/:productId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const parsed = RemoveFromWishlistParams.safeParse({ productId: parseInt(rawId, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid productId" });
    return;
  }

  await db.delete(wishlistItemsTable).where(eq(wishlistItemsTable.productId, parsed.data.productId));
  res.json({ success: true });
});

export default router;
