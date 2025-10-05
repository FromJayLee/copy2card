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

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as { amount?: number };
  const amount = Math.max(body?.amount ?? 10, 0);

  const { data: creditsRow, error } = await supabase
    .from("credits")
    .select("remaining_credits")
    .eq("user_id", session.user.id)
    .single();

  const nextCredits = (creditsRow?.remaining_credits ?? 0) + amount;

  if (error) {
    const { data: inserted, error: insertError } = await supabase
      .from("credits")
      .insert({ user_id: session.user.id, remaining_credits: nextCredits })
      .select("remaining_credits")
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ remainingCredits: inserted?.remaining_credits ?? nextCredits });
  }

  const { data: updated, error: updateError } = await supabase
    .from("credits")
    .update({ remaining_credits: nextCredits })
    .eq("user_id", session.user.id)
    .select("remaining_credits")
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json({ remainingCredits: updated?.remaining_credits ?? nextCredits });
}
