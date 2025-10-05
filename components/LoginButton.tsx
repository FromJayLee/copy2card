import { useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import type { Provider } from "@supabase/supabase-js";

interface LoginButtonProps {
  provider?: Extract<Provider, "google" | "github">;
  mode?: "signin" | "signout";
  compact?: boolean;
}

export default function LoginButton({ provider = "google", mode = "signin", compact = false }: LoginButtonProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const handleClick = useCallback(async () => {
    if (mode === "signout") {
      await supabase.auth.signOut();
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  }, [mode, provider, supabase]);

  const label = mode === "signout" ? "Sign out" : `Continue with ${provider}`;

  if (mode === "signin" && session) {
    return null;
  }

  if (mode === "signout" && !session) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full border border-black px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white ${compact ? "px-3 py-1" : ""}`}
    >
      {label}
    </button>
  );
}
