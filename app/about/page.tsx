export default function AboutPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12 text-slate-700">
      <h1 className="font-display text-3xl text-[color:var(--foreground)]">
        About Read Cyrillic
      </h1>
      <p className="font-ui mt-4 text-base leading-relaxed">
        Read Cyrillic is a lightweight practice tool for learning the Cyrillic
        alphabet. Work through common words, reveal pronunciation when ready,
        and track what you got right or missed.
      </p>
      <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white/60 p-5">
          <h2 className="font-display text-base text-[color:var(--foreground)]">
            What it is
          </h2>
          <p className="font-ui mt-2 leading-relaxed text-slate-600">
            A simple loop: see a word, say it out loud, then reveal the
            pronunciation. It keeps the focus on recognition and sound, not
            memorization.
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/60 p-5">
          <h2 className="font-display text-base text-[color:var(--foreground)]">
            How to use it
          </h2>
          <p className="font-ui mt-2 leading-relaxed text-slate-600">
            Try to read each word before revealing. Mark it as “I got it” or
            “Missed it” to nudge review. Use audio when you want a quick check.
          </p>
        </div>
      </div>
      <p className="font-ui mt-8 text-sm leading-relaxed text-slate-600">
        This is intentionally minimal. If you have ideas for other practice
        modes, I’m open to them.
      </p>
      <p className="font-ui mt-6 text-sm uppercase tracking-[0.25em] text-slate-500">
        <a className="transition hover:text-slate-700" href="/">
          Back to practice
        </a>
      </p>
    </main>
  );
}
