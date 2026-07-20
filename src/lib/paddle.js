import { initializePaddle } from "@paddle/paddle-js";

let paddleInstance;

export async function getPaddle() {
  if (!paddleInstance) {
    paddleInstance = await initializePaddle({
      environment: "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    });
  }

  return paddleInstance;
}