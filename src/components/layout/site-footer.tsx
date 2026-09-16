export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
        <p className="font-heading text-lg font-bold text-primary">
          কাণ্ডারী-ল্যাব
        </p>
        <p className="text-sm text-slate-500">
          Building opportunity for every Kandari in Bangladesh.
        </p>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Kandari Lab. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
