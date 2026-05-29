import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveFromCartParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function buildCart(items: typeof cartItemsTable.$inferSelect[]) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalDiscount = items.reduce((sum, i) => sum + (i.originalPrice - i.price) * i.quantity, 0);
  return { items, total, totalItems, totalDiscount };
}

router.get("/cart", async (_req, res): Promise<void> => {
  const items = await db.select().from(cartItemsTable);
  res.json(buildCart(items));
});

router.post("/cart", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, size, color, quantity } = parsed.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  // Check if same product+size+color already in cart
  const existing = await db.select().from(cartItemsTable).where(eq(cartItemsTable.productId, productId));
  const existingMatch = existing.find(i => i.size === size && i.color === color);

  if (existingMatch) {
    await db.update(cartItemsTable)
      .set({ quantity: existingMatch.quantity + quantity })
      .where(eq(cartItemsTable.id, existingMatch.id));
  } else {
    await db.insert(cartItemsTable).values({
      productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      imageUrl: product.imageUrls[0] ?? "",
      size,
      color,
      quantity,
    });
  }

  const items = await db.select().from(cartItemsTable);
  res.status(201).json(buildCart(items));
});

router.patch("/cart/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = UpdateCartItemParams.safeParse({ itemId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid itemId" });
    return;
  }

  const body = UpdateCartItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (body.data.quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
  } else {
    await db.update(cartItemsTable)
      .set({ quantity: body.data.quantity })
      .where(eq(cartItemsTable.id, params.data.itemId));
  }

  const items = await db.select().from(cartItemsTable);
  res.json(buildCart(items));
});

router.delete("/cart/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = RemoveFromCartParams.safeParse({ itemId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid itemId" });
    return;
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
  const items = await db.select().from(cartItemsTable);
  res.json(buildCart(items));
});

router.delete("/cart", async (_req, res): Promise<void> => {
  await db.delete(cartItemsTable);
  res.json({ items: [], total: 0, totalItems: 0, totalDiscount: 0 });
});

export default router;
