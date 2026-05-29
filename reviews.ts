import { Router, type IRouter } from "express";
import { db, reviewsTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { GetProductReviewsParams, AddProductReviewParams, AddProductReviewBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetProductReviewsParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, parsed.data.id));
  res.json(reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/products/:id/reviews", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AddProductReviewParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = AddProductReviewBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [review] = await db.insert(reviewsTable).values({
    productId: params.data.id,
    userName: body.data.userName,
    rating: body.data.rating,
    comment: body.data.comment,
  }).returning();

  // Update product rating
  const allReviews = await db.select({ rating: reviewsTable.rating }).from(reviewsTable).where(eq(reviewsTable.productId, params.data.id));
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db.update(productsTable)
    .set({ rating: Math.round(avgRating * 10) / 10, reviewCount: sql`${productsTable.reviewCount} + 1` })
    .where(eq(productsTable.id, params.data.id));

  res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
});

export default router;
