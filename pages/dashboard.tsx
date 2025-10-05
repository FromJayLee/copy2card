import { useCallback, useMemo, useState } from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import ReviewCard from "../components/ReviewCard";
import LoginButton from "../components/LoginButton";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

interface DashboardPageProps {
  initialCredits: number | null;
  userEmail: string | null;
}

export default function DashboardPage({ initialCredits, userEmail }: DashboardPageProps) {
  const [reviewText, setReviewText] = useState("");
  const [credits, setCredits] = useState<number | null>(initialCredits);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const includesWatermark = useMemo(() => {
    if (credits === null) {
      return true;
    }
    return credits <= 0;
  }, [credits]);

  const ensureCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/credits/get");
      if (!res.ok) {
        throw new Error("Unable to fetch credits");
      }
      const data = (await res.json()) as { remainingCredits: number | null };
      setCredits(data.remainingCredits);
      return data.remainingCredits;
    } catch (error) {
      console.error(error);
      return credits;
    }
  }, [credits]);

  const generatePreview = useCallback(async (): Promise<string | null> => {
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const card = document.getElementById("review-card");
      if (!card) {
        throw new Error("Card element not found");
      }

      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: "#ffffff"
      });

      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);
      setStatusMessage("Preview ready.");
      return dataUrl;
    } catch (error) {
      console.error(error);
      setStatusMessage("Could not generate preview. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    setStatusMessage(null);

    const updatedCredits = await ensureCredits();

    if ((updatedCredits ?? 0) <= 0) {
      setStatusMessage("You need credits to download. Upgrade or top up first.");
      return;
    }

    const finalUrl = previewUrl ?? (await generatePreview());
    if (!finalUrl) {
      setStatusMessage("Generate a preview before downloading.");
      return;
    }

    const link = document.createElement("a");
    link.href = finalUrl;
    link.download = `copy2card-${Date.now()}.png`;
    link.click();

    try {
      const res = await fetch("/api/credits/decrement", {
        method: "POST"
      });
      if (res.ok) {
        const data = (await res.json()) as { remainingCredits: number | null };
        setCredits(data.remainingCredits);
        setStatusMessage("Download complete. Credit deducted.");
      } else {
        throw new Error("Failed to decrement credits");
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("Download finished, but credit update failed. Refresh to confirm.");
    }
  }, [ensureCredits, generatePreview, previewUrl]);

  return (
    <>
      <Head>
        <title>Dashboard - copy2card</title>
      </Head>
      <div className="flex min-h-screen flex-col bg-white text-black">
        <Navbar credits={credits} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
          <section className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {userEmail ?? "creator"}</h1>
            <p className="max-w-2xl text-base text-gray-600">
              Paste real customer praise, make quick tweaks, and export a clean testimonial card. Free accounts include a watermark. Paid accounts skip the watermark and can download instantly.
            </p>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <label htmlFor="review" className="text-sm font-medium text-gray-700">
                Review text
              </label>
              <textarea
                id="review"
                value={reviewText}
                onChange={(event) => {
                  setReviewText(event.target.value);
                  setPreviewUrl(null);
                }}
                placeholder="Paste customer feedback here."
                className="min-h-[200px] w-full resize-none rounded-3xl border border-black bg-white p-6 text-base text-gray-900 focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => void generatePreview()}
                  disabled={isProcessing}
                  className="rounded-full border border-black px-6 py-2 text-sm font-medium transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing ? "Generating..." : "Build preview"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  className="rounded-full border border-black px-6 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
                >
                  Download PNG
                </button>
                <LoginButton mode="signout" compact />
              </div>
              {statusMessage && <p className="text-sm text-gray-500">{statusMessage}</p>}
              {includesWatermark && (
                <p className="text-xs text-gray-400">
                  Watermark removal and downloads require an active credit balance.
                </p>
              )}
            </div>
            <div className="flex flex-col items-center gap-4">
              <ReviewCard text={reviewText} includeWatermark={includesWatermark} />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Review card preview"
                  className="w-full max-w-xl rounded-3xl border border-dashed border-gray-200"
                />
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    } as const;
  }

  const { data: creditsRow } = await supabase
    .from("credits")
    .select("remaining_credits")
    .eq("user_id", session.user.id)
    .single();

  return {
    props: {
      initialCredits: creditsRow?.remaining_credits ?? 0,
      userEmail: session.user.email ?? null
    }
  };
};
