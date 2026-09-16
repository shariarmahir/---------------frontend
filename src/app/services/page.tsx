import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Services — Full Details Coming Soon
      </h1>
      <p className="max-w-md text-slate-600">
        Dedicated pages for every Kandari Lab service are on the way.
      </p>
      <Button asChild className="bg-title text-white hover:bg-title/90">
        <Link href="/">Back to Home</Link>
      </Button>
    </main>
  );
}
