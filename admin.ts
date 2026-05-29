import { Router, type IRouter } from "express";
import { db, productsTable, ordersTable, reviewsTable } from "@workspace/db";
import { eq, ilike, sql, desc, and } from "drizzle-orm";

const router: IRouter = Router();

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    expectedDelivery: order.expectedDelivery ?? null,
  };
}

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [productsCount, ordersRows, reviewsCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
    db.select({ count: sql<number>`count(*)` }).from(reviewsTable),
  ]);

  const totalRevenue = ordersRows.reduce((sum, o) => sum + Number(o.total), 0);
  const ordersByStatus: Record<string, number> = {};
  for (const o of ordersRows) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
  }
  const recentOrders = ordersRows.slice(0, 5).map(formatOrder);

  res.json({
    totalProducts: Number(productsCount[0]?.count ?? 0),
    totalOrders: ordersRows.length,
    totalRevenue,
    totalReviews: Number(reviewsCount[0]?.count ?? 0),
    recentOrders,
    ordersByStatus,
  });
});

router.get("/admin/products", async (req, res): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const offset = (page - 1) * limit;

  const where = search ? ilike(productsTable.name, `%${search}%`) : undefined;

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(desc(productsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  res.json({ products, total: Number(countResult[0]?.count ?? 0), page, limit });
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const { name, brand, description, price, originalPrice, discount, category, subcategory, imageUrls, sizes, colors, inStock, tags } = req.body;

  if (!name || !brand || price == null || !category) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [product] = await db.insert(productsTable).values({
    name,
    brand,
    description: description ?? null,
    price: Number(price),
    originalPrice: Number(originalPrice ?? price),
    discount: Number(discount ?? 0),
    category,
    subcategory: subcategory ?? category,
    imageUrls: imageUrls ?? [],
    sizes: sizes ?? [],
    colors: colors ?? [],
    inStock: inStock ?? true,
    tags: tags ?? [],
    rating: 0,
    reviewCount: 0,
  }).returning();

  res.status(201).json(product);
});

router.patch("/admin/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { name, brand, description, price, originalPrice, discount, category, subcategory, imageUrls, sizes, colors, inStock, tags } = req.body;

  const updates: Partial<typeof productsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (brand !== undefined) updates.brand = brand;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = Number(price);
  if (originalPrice !== undefined) updates.originalPrice = Number(originalPrice);
  if (discount !== undefined) updates.discount = Number(discount);
  if (category !== undefined) updates.category = category;
  if (subcategory !== undefined) updates.subcategory = subcategory;
  if (imageUrls !== undefined) updates.imageUrls = imageUrls;
  if (sizes !== undefined) updates.sizes = sizes;
  if (colors !== undefined) updates.colors = colors;
  if (inStock !== undefined) updates.inStock = inStock;
  if (tags !== undefined) updates.tags = tags;

  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

router.get("/admin/orders", async (req, res): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  const where = status ? eq(ordersTable.status, status) : undefined;

  const [orders, countResult] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  res.json({
    orders: orders.map(formatOrder),
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  });
});

router.patch("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { status } = req.body;
  const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    return;
  }

  const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(formatOrder(order));
});

router.get("/admin/reviews", async (req, res): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const offset = (page - 1) * limit;

  const [reviews, countResult] = await Promise.all([
    db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(reviewsTable),
  ]);

  res.json({
    reviews: reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  });
});

router.delete("/admin/reviews/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  res.json({ success: true });
});

export default router;
