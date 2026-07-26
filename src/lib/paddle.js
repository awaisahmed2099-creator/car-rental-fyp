import { initializePaddle } from "@paddle/paddle-js";

let paddleInstance;

/**
 * @param {{ eventCallback?: Function }} [options]
 */
export async function getPaddle(options = {}) {
  if (paddleInstance && !options.eventCallback) {
    return paddleInstance;
  }

  paddleInstance = await initializePaddle({
    environment: "sandbox",
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    ...(options.eventCallback ? { eventCallback: options.eventCallback } : {}),
  });

  return paddleInstance;
}

export function resetPaddle() {
  paddleInstance = undefined;
}
