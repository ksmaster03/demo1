/**
 * POST /api/checkout
 * สร้าง Booking (status=pending_payment) + Stripe Checkout Session
 * ต้องล็อกอินก่อน
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

// Weekends only — 0=Sunday, 6=Saturday
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

const bodySchema = z.object({
  // ISO date-time string, e.g. "2026-07-05T09:00:00+07:00"
  startsAt: z.string().datetime({ offset: true }),
  durationMin: z.number().int().min(60).max(120).default(60),
  focusNote: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { startsAt: startsAtStr, durationMin, focusNote } = parsed.data;
  const startsAt = new Date(startsAtStr);

  // Enforce weekends-only rule
  if (!isWeekend(startsAt)) {
    return NextResponse.json(
      { error: "Bookings are only available on weekends (Saturday & Sunday)" },
      { status: 400 }
    );
  }

  const priceTHB = 1000;
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // 1. Create booking in DB (pending_payment)
  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      startsAt,
      durationMin: durationMin ?? 60,
      status: "pending_payment",
      priceTHB,
      focusNote,
    },
  });

  // 2. Create Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "thb",
    line_items: [
      {
        price_data: {
          currency: "thb",
          product_data: {
            name: "Claude Code Weekend — 1-on-1 Coaching",
            description: `${durationMin ?? 60} min session on ${startsAt.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
          },
          unit_amount: priceTHB * 100, // Stripe uses satang (smallest unit)
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      userId: session.user.id,
    },
    success_url: `${appUrl}/account?booking=success&id=${booking.id}`,
    cancel_url: `${appUrl}/?booking=cancelled`,
  });

  // 3. Save Stripe session ID back to booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
