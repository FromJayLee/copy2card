import Link from "next/link";
import { useSession } from "@supabase/auth-helpers-react";
import CreditDisplay from "./CreditDisplay";
import LoginButton from "./LoginButton";

interface NavbarProps {
  credits?: number | null;
}

export default function Navbar({ credits }: NavbarProps) {
  const session = useSession();

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        copy2card
      </Link>
      <div className="flex items-center gap-4">
        {typeof credits === "number" && <CreditDisplay credits={credits} />}
        {session ? (
          <LoginButton mode="signout" />
        ) : (
          <LoginButton provider="github" compact />
        )}
      </div>
    </header>
  );
}
