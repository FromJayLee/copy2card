import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServer } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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

  if (error || !data) {
    return res.status(200).json({ remainingCredits: 0 });
  }

  const nextCredits = Math.max((data.remaining_credits ?? 0) - 1, 0);

  const { data: updated, error: updateError } = await supabase
    .from("credits")
    .update({ remaining_credits: nextCredits })
    .eq("user_id", session.user.id)
    .select("remaining_credits")
    .single();

  if (updateError) {
    return res.status(200).json({ remainingCredits: data.remaining_credits ?? 0 });
  }

  return res.status(200).json({ remainingCredits: updated?.remaining_credits ?? nextCredits });
}
