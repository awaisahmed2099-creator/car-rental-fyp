import { Environment, Paddle } from "@paddle/paddle-node-sdk";

let paddleClient: Paddle | null = null;

export const DRIVEEASE_BOOKING_PRODUCT_ID = "pro_01kyerdnw7dahjs4a32x703z19";

export function getPaddle(): Paddle {
  if (paddleClient) return paddleClient;

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not set");
  }

  paddleClient = new Paddle(apiKey, {
    environment: Environment.sandbox,
  });
  return paddleClient;
}
