import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, sql, desc, asc } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
  GetProductResponse,
  GetFeaturedProductsResponse,
  GetProductSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.inStock, true))
    .orderBy(desc(productsTable.rating))
    .limit(12);
  res.json(GetFeaturedProductsResponse.parse(products));
});

router.get("/products/summary", async (_req, res): Promise<void> => {
  const allProducts = await db.select({
    brand: productsTable.brand,
    price: productsTable.price,
    category: productsTable.category,
  }).from(productsTable);

  const brands = [...new Set(allProducts.map(p => p.brand))].sort();
  const prices = allProducts.map(p => p.price);
  const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
  const categoryCounts: Record<string, number> = {};
  for (const p of allProducts) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  res.json(GetProductSummaryResponse.parse({
    totalProducts: allProducts.length,
    brands,
    priceRange,
    categoryCounts,
  }));
});

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, subcategory, brand, minPrice, maxPrice, discount, sort, search, page = 1, limit = 20 } = parsed.data;

  const conditions = [];
  if (category) conditions.push(eq(productsTable.category, category));
  if (subcategory) conditions.push(eq(productsTable.subcategory, subcategory));
  if (brand) conditions.push(eq(productsTable.brand, brand));
  if (minPrice != null) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice != null) conditions.push(lte(productsTable.price, maxPrice));
  if (discount != null) conditions.push(gte(productsTable.discount, discount));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (sort) {
    case "price_asc": orderBy = asc(productsTable.price); break;
    case "price_desc": orderBy = desc(productsTable.price); break;
    case "rating": orderBy = desc(productsTable.rating); break;
    case "discount": orderBy = desc(productsTable.discount); break;
    default: orderBy = desc(productsTable.createdAt);
  }

  const offset = ((page as number) - 1) * (limit as number);

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(orderBy).limit(limit as number).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  res.json({
    products,
    total: Number(countResult[0]?.count ?? 0),
    page: page as number,
    limit: limit as number,
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(product));
});

export default router;
