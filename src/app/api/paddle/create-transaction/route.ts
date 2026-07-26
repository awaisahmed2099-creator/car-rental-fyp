import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  DRIVEEASE_BOOKING_PRODUCT_ID,
  getPaddle,
} from "@/lib/paddle-server";
import { PKR_PER_USD, pkrToUsdCents } from "@/lib/currency";

type CreateBody = {
  bookingId?: string;
};

async function findOrCreateCustomer(
  email: string,
  name: string,
): Promise<string> {
  const paddle = getPaddle();
  const page = await paddle.customers.list({ email: [email] }).next();
  const first = page[0];
  if (first?.id) return first.id;

  const created = await paddle.customers.create({ email, name });
  return created.id;
}

export async function POST(request: Request): Promise<Response> {
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bookingId =
    typeof body.bookingId === "string" ? body.bookingId.trim() : "";
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const db = getAdminDb();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = bookingSnap.data();
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.paymentStatus === "paid") {
    return NextResponse.json(
      { error: "Booking is already paid" },
      { status: 409 },
    );
  }

  const totalAmount = Number(booking.totalAmount ?? 0);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return NextResponse.json(
      { error: "Booking has an invalid amount" },
      { status: 400 },
    );
  }

  const email =
    typeof booking.customerEmail === "string" ? booking.customerEmail : "";
  const name =
    typeof booking.customerName === "string" && booking.customerName
      ? booking.customerName
      : "Customer";

  if (!email) {
    return NextResponse.json(
      { error: "Customer email is required for card payment" },
      { status: 400 },
    );
  }

  const amountUsdCents = pkrToUsdCents(totalAmount);
  if (amountUsdCents < 1) {
    return NextResponse.json(
      { error: "Amount is too small to charge via Paddle" },
      { status: 400 },
    );
  }

  const customerId = await findOrCreateCustomer(email, name);
  const paddle = getPaddle();

  const transaction = await paddle.transactions.create({
    customerId,
    currencyCode: "USD",
    collectionMode: "automatic",
    customData: {
      app: "driveease",
      bookingId,
      amountPkr: String(totalAmount),
      amountUsdCents: String(amountUsdCents),
      pkrPerUsd: String(PKR_PER_USD),
      carName: String(booking.carName || ""),
      packageName: String(booking.packageName || ""),
    },
    items: [
      {
        quantity: 1,
        price: {
          description: `DriveEase booking ${bookingId}`,
          name: booking.packageName
            ? `Package: ${booking.packageName}`
            : `Car: ${booking.carName || "Rental"}`,
          productId: DRIVEEASE_BOOKING_PRODUCT_ID,
          taxMode: "account_setting",
          unitPrice: {
            amount: String(amountUsdCents),
            currencyCode: "USD",
          },
        },
      },
    ],
  });

  await bookingRef.update({
    paymentMethod: "paddle",
    paddleTransactionId: transaction.id,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    transactionId: transaction.id,
    amountPkr: totalAmount,
    amountUsdCents,
  });
}
