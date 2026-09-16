import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Sign In — Coming Soon
      </h1>
      <p className="max-w-md text-slate-600">
        Kandari profiles are launching soon. Check back shortly to sign in and
        track your impact.
      </p>
      <Button asChild className="bg-title text-white hover:bg-title/90">
        <Link href="/">Back to Home</Link>
      </Button>
    </main>
  );
}
