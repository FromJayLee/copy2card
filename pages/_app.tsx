import "../styles/globals.css";
import { useState } from "react";
import type { AppProps } from "next/app";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

const ensureEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`${key} is not set. Add it to your .env.local.`);
    }
    return "";
  }
  return value;
};

export default function App({ Component, pageProps }: AppProps<{ initialSession: Session | null }>) {
  const [{ supabaseUrl, supabaseAnonKey }] = useState(() => ({
    supabaseUrl: ensureEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: ensureEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }));

  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient({
      supabaseUrl,
      supabaseKey: supabaseAnonKey
    })
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
