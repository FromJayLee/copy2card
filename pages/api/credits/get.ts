import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServer } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const supabase = createSupabaseServer({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ remainingCredits: null });
  }

  const { data, error } = await supabase
    .from("credits")
    .select("remaining_credits")
    .eq("user_id", session.user.id)
    .single();

  if (error) {
    return res.status(200).json({ remainingCredits: null });
  }

  return res.status(200).json({ remainingCredits: data?.remaining_credits ?? 0 });
}
