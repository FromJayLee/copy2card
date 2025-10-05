import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import Navbar from "../components/Navbar";
import LoginButton from "../components/LoginButton";

export default function HomePage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      void router.replace("/dashboard");
    }
  }, [router, session]);

  return (
    <>
      <Head>
        <title>copy2card - Turn testimonials into shareable cards</title>
        <meta
          name="description"
          content="Paste customer feedback and generate a clean review card in seconds."
        />
      </Head>
      <div className="flex min-h-screen flex-col bg-white text-black">
        <Navbar />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-12 px-6 py-16 text-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Paste your best feedback. Get a polished review card.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
              copy2card.com is the fastest way to create on-brand testimonial cards for your landing pages, decks, and socials. Drop text in, preview instantly, and download in seconds.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <LoginButton provider="google" />
            <LoginButton provider="github" />
            <p className="text-xs text-gray-500">
              Sign in to jump to the dashboard. Paid plans unlock watermark-free downloads.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
