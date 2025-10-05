import { useEffect, useState } from "react";
import Head from "next/head";
import { useSession } from "@supabase/auth-helpers-react";
import Navbar from "../components/Navbar";
import LoginButton from "../components/LoginButton";
import { loadPaddle, openCheckout } from "../lib/paddleClient";

export default function PaymentPage() {
  const session = useSession();
  const [status, setStatus] = useState<string | null>(null);
  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;

  useEffect(() => {
    void loadPaddle();
  }, []);

  const handleCheckout = async () => {
    if (!priceId) {
      setStatus("Paddle price ID is missing. Add NEXT_PUBLIC_PADDLE_PRICE_ID to .env.local.");
      return;
    }

    setStatus("Opening Paddle checkout...");

    try {
      await openCheckout({
        items: [
          {
            priceId,
            quantity: 1
          }
        ],
        customer: {
          email: session?.user?.email ?? undefined
        },
        settings: {
          displayMode: "overlay",
          theme: "light",
          successUrl: `${window.location.origin}/dashboard`
        },
        eventCallback: async (event) => {
          if (event.name === "checkout.completed") {
            setStatus("Payment complete. Updating credits...");
            await fetch("/api/credits/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ amount: 50 })
            });
            setStatus("All set! Head back to the dashboard for watermark-free exports.");
          }
        }
      });
    } catch (error) {
      console.error(error);
      setStatus("Could not open the checkout window. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <title>Upgrade - copy2card</title>
      </Head>
      <div className="flex min-h-screen flex-col bg-white text-black">
        <Navbar />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
          <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">Pro plan</h1>
            <p className="max-w-2xl text-base text-gray-600">
              Check out with Paddle to unlock watermark-free downloads, fresh credits, and faster support.
            </p>
          </section>

          <section className="flex flex-col gap-6 rounded-3xl border border-black p-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold">copy2card Pro</h2>
              <p className="text-sm text-gray-500">50 download credits - no watermark - priority support</p>
              <p className="text-3xl font-semibold">$19</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void handleCheckout()}
                className="rounded-full border border-black px-6 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                Pay with Paddle
              </button>
              {session ? <LoginButton mode="signout" compact /> : <LoginButton />}
            </div>
            {status && <p className="text-sm text-gray-500">{status}</p>}
            <ul className="flex flex-col gap-2 text-sm text-gray-500">
              <li>Start in Paddle sandbox mode before switching to production.</li>
              <li>On a successful checkout we add 50 credits via the `/api/credits/add` helper.</li>
              <li>Move this logic to a secured webhook for production launches.</li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}
