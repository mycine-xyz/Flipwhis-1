import { Router, type IRouter } from "express";
import { db, ordersTable, cartItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetOrderParams, PlaceOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    expectedDelivery: order.expectedDelivery ?? null,
  };
}

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(orders.map(formatOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = PlaceOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cartItems = await db.select().from(cartItemsTable);
  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const [order] = await db.insert(ordersTable).values({
    items: cartItems.map(i => ({
      productId: i.productId,
      name: i.name,
      brand: i.brand,
      price: i.price,
      imageUrl: i.imageUrl,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    })),
    total,
    status: "Processing",
    address: parsed.data.address,
    paymentMethod: parsed.data.paymentMethod,
    expectedDelivery: deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  }).returning();

  // Clear cart
  await db.delete(cartItemsTable);

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetOrderParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, parsed.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(formatOrder(order));
});

export default router;
