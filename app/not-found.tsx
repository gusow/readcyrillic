export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6 py-12 text-[color:var(--foreground)]">
      <div className="max-w-xl text-center">
        <p className="font-display text-xs uppercase tracking-[0.45em] text-[color:var(--accent-strong)]">
          Not Found
        </p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">
          This page doesn’t exist.
        </h1>
        <p className="font-ui mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
          Check the URL and try again.
        </p>
      </div>
    </div>
  );
}
