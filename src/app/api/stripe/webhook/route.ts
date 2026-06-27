/**
 * POST /api/stripe/webhook
 * รับ Stripe webhook events
 * checkout.session.completed → mark Booking confirmed + create Payment record
 *
 * ตั้งค่า webhook ใน Stripe Dashboard:
 *   Endpoint URL: https://demo1.toptierdigital.space/api/stripe/webhook
 *   Events: checkout.session.completed
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// App Router: body is accessed via req.text() — no bodyParser config needed

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.warn("Webhook: missing bookingId in metadata", session.id);
      return NextResponse.json({ received: true });
    }

    // Update booking status → confirmed
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "confirmed" },
    });

    // Create Payment record (upsert in case of duplicate events)
    await prisma.payment.upsert({
      where: { stripeSessionId: session.id },
      create: {
        bookingId,
        stripeSessionId: session.id,
        amountTHB: Math.round((session.amount_total ?? 0) / 100),
        status: "paid",
      },
      update: { status: "paid" },
    });

    console.log(`Booking ${bookingId} confirmed via Stripe session ${session.id}`);
  }

  return NextResponse.json({ received: true });
}
