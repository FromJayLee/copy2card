import type { Paddle, CheckoutOptions as PaddleCheckoutOptions } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;
let paddlePromise: Promise<Paddle | null> | null = null;

type CheckoutOptions = PaddleCheckoutOptions;

const resolveEnvironment = () =>
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";

export const loadPaddle = async (): Promise<Paddle | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  if (paddleInstance) {
    return paddleInstance;
  }

  if (!paddlePromise) {
    paddlePromise = import("@paddle/paddle-js").then(({ Paddle }) => {
      const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!clientToken) {
        console.warn("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set. Add it to .env.local.");
        return null;
      }

      paddleInstance = Paddle.initialize({
        token: clientToken,
        environment: resolveEnvironment(),
        eventCallback: (event) => {
          if (process.env.NODE_ENV === "development") {
            console.info("Paddle event", event);
          }
        }
      });

      return paddleInstance;
    });
  }

  return paddlePromise;
};

export const openCheckout = async (options: CheckoutOptions) => {
  const paddle = await loadPaddle();
  if (!paddle) {
    throw new Error("Paddle is not initialised. Check your environment variables.");
  }

  await paddle.Checkout.open(options);
};

export type { CheckoutOptions };
