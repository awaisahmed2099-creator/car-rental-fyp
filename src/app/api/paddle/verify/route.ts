import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { getPaddle } from "@/lib/paddle-server";

type VerifyBody = {
  transactionId?: string;
  bookingId?: string;
};

function readCustomString(
  customData: Record<string, unknown> | null | undefined,
  key: string,
): string {
  if (!customData) return "";
  const value = customData[key];
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request): Promise<Response> {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const transactionId =
    typeof body.transactionId === "string" ? body.transactionId.trim() : "";
  const bookingId =
    typeof body.bookingId === "string" ? body.bookingId.trim() : "";

  if (!transactionId.startsWith("txn_") || !bookingId) {
    return NextResponse.json(
      { error: "transactionId and bookingId are required" },
      { status: 400 },
    );
  }

  const paddle = getPaddle();
  const transaction = await paddle.transactions.get(transactionId);

  if (transaction.status !== "completed" && transaction.status !== "paid") {
    return NextResponse.json(
      {
        error: `Payment not completed yet (status: ${transaction.status})`,
        status: transaction.status,
      },
      { status: 409 },
    );
  }

  const customData =
    transaction.customData && typeof transaction.customData === "object"
      ? (transaction.customData as Record<string, unknown>)
      : null;

  const customBookingId = readCustomString(customData, "bookingId");
  if (!customBookingId || customBookingId !== bookingId) {
    return NextResponse.json(
      { error: "Transaction does not match this booking" },
      { status: 403 },
    );
  }

  const db = getAdminDb();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = bookingSnap.data();
  if (booking?.paymentStatus === "paid") {
    return NextResponse.json({
      success: true,
      bookingId,
      alreadyPaid: true,
    });
  }

  await bookingRef.update({
    paymentStatus: "paid",
    paymentMethod: "paddle",
    paddleTransactionId: transactionId,
    txnRefNo: transactionId,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    success: true,
    bookingId,
    alreadyPaid: false,
  });
}
