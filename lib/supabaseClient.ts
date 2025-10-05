import { createBrowserSupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "@supabase/supabase-js";

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
};

export const createSupabaseBrowser = () =>
  createBrowserSupabaseClient({
    supabaseUrl: env.supabaseUrl,
    supabaseKey: env.supabaseAnonKey
  });

export const createSupabaseServer = (ctx: { req: NextApiRequest; res: NextApiResponse }) =>
  createServerSupabaseClient(ctx);

export const requireSession = async (ctx: { req: NextApiRequest; res: NextApiResponse }) => {
  const supabase = createSupabaseServer(ctx);
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Session required");
  }

  return { supabase, session: session as Session };
};
