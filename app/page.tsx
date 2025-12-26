"use client";

import { useEffect, useMemo, useState } from "react";

import { WORDS } from "./word-data";

type WordStats = {
  correct: number;
  incorrect: number;
  pendingMisses: number;
};

type ReviewItem = {
  index: number;
  dueIn: number;
};

const createInitialStats = (): WordStats[] =>
  WORDS.map(() => ({
    correct: 0,
    incorrect: 0,
    pendingMisses: 0,
  }));

const scheduleMiss = (queue: ReviewItem[], index: number) => {
  const delay = 2 + Math.floor(Math.random() * 4);
  const existing = queue.find((item) => item.index === index);
  if (existing) {
    return queue.map((item) =>
      item.index === index
        ? { ...item, dueIn: Math.min(item.dueIn, delay) }
        : item,
    );
  }
  return [...queue, { index, dueIn: delay }];
};

const tickQueue = (queue: ReviewItem[]) =>
  queue.map((item) => ({ ...item, dueIn: item.dueIn - 1 }));

const pickWeightedIndex = (candidates: number[], stats: WordStats[]) => {
  const weights = candidates.map((index) => {
    const { pendingMisses, incorrect } = stats[index];
    return 1 + pendingMisses * 2 + incorrect * 0.4;
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return candidates[i];
    }
  }
  return candidates[0];
};

const pickNextIndex = (
  currentIndex: number,
  stats: WordStats[],
  reviewQueue: ReviewItem[],
) => {
  if (WORDS.length <= 1) return 0;
  const dueNow = reviewQueue.filter(
    (item) => item.index !== currentIndex && item.dueIn <= 0,
  );
  if (dueNow.length > 0) {
    return dueNow[Math.floor(Math.random() * dueNow.length)].index;
  }

  const candidates = WORDS.map((_, index) => index).filter(
    (index) => index !== currentIndex,
  );
  return pickWeightedIndex(candidates, stats);
};

export default function Home() {
  const [stats, setStats] = useState<WordStats[]>(() => createInitialStats());
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const storageKey = "russianAlphabetProgressV3";

  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          stats?: WordStats[];
          reviewQueue?: ReviewItem[];
          index?: number;
        };
        const nextStats =
          parsed.stats && parsed.stats.length === WORDS.length
            ? parsed.stats
            : null;
        const nextQueue = parsed.reviewQueue?.filter(
          (item) =>
            Number.isInteger(item.index) &&
            Number.isInteger(item.dueIn) &&
            item.index >= 0 &&
            item.index < WORDS.length,
        );
        if (nextStats) {
          setStats(nextStats);
        }
        if (nextQueue && Array.isArray(nextQueue)) {
          setReviewQueue(nextQueue);
        }
        if (
          typeof parsed.index === "number" &&
          parsed.index >= 0 &&
          parsed.index < WORDS.length
        ) {
          setIndex(parsed.index);
        } else {
          setIndex(pickNextIndex(-1, nextStats ?? stats, nextQueue ?? []));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
        setIndex(pickNextIndex(-1, stats, reviewQueue));
      }
    } else {
      setIndex(pickNextIndex(-1, stats, reviewQueue));
    }
    setIsHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ stats, reviewQueue, index });
    window.localStorage.setItem(storageKey, payload);
  }, [stats, reviewQueue, index, storageKey, isHydrated]);

  const current = WORDS[index];

  const handleNext = () => {
    const nextQueue = tickQueue(reviewQueue);
    setReviewQueue(nextQueue);
    setIndex(() => pickNextIndex(index, stats, nextQueue));
    setRevealed(false);
    if (canSpeak) {
      window.speechSynthesis.cancel();
    }
  };

  const handleGrade = (isCorrect: boolean) => {
    const nextStats = stats.map((item, idx) => {
      if (idx !== index) return item;
      if (isCorrect) {
        const resolvesMiss = item.pendingMisses > 0 ? 1 : 0;
        return {
          correct: item.correct + 1,
          incorrect: Math.max(0, item.incorrect - resolvesMiss),
          pendingMisses: Math.max(0, item.pendingMisses - resolvesMiss),
        };
      }
      return {
        correct: item.correct,
        incorrect: item.incorrect + 1,
        pendingMisses: item.pendingMisses + 1,
      };
    });

    let nextQueue = reviewQueue;
    const updatedPendingMisses = nextStats[index]?.pendingMisses ?? 0;
    if (isCorrect && updatedPendingMisses === 0) {
      nextQueue = reviewQueue.filter((item) => item.index !== index);
    }
    if (!isCorrect) {
      nextQueue = scheduleMiss(reviewQueue, index);
    }

    nextQueue = tickQueue(nextQueue);
    setStats(nextStats);
    setReviewQueue(nextQueue);
    setIndex(() => pickNextIndex(index, nextStats, nextQueue));
    setRevealed(false);
    if (canSpeak) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " ") return;
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase();
        if (tagName === "input" || tagName === "textarea") {
          return;
        }
      }
      event.preventDefault();
      if (!revealed) {
        setRevealed(true);
      } else {
        handleGrade(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, handleGrade]);

  const handleSpeak = () => {
    if (!canSpeak) return;
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.lang = "ru-RU";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const totals = useMemo(() => {
    const totalCorrect = stats.reduce((sum, item) => sum + item.correct, 0);
    const totalIncorrect = stats.reduce((sum, item) => sum + item.incorrect, 0);
    const total = totalCorrect + totalIncorrect;
    const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
    return { totalCorrect, totalIncorrect, total, accuracy };
  }, [stats]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-4 h-72 w-72 rounded-full bg-orange-200/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-80px] right-6 h-80 w-80 rounded-full bg-sky-200/70 blur-3xl" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-8">
        <section
          className="w-full rounded-[32px] border border-white/60 p-7 shadow-[var(--shadow)] backdrop-blur sm:p-10"
          style={{ background: "var(--panel)" }}
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="font-display text-xs uppercase tracking-[0.45em] text-[color:var(--accent-strong)]">
                Read Cyrillic
              </p>
              <h1 className="font-display text-[26px] leading-tight text-[color:var(--foreground)] sm:text-3xl">
                See the word, say it out loud.
              </h1>
              <div className="font-ui flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="rounded-full bg-white/70 px-3 py-1">
                  Correct {totals.totalCorrect}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1">
                  Missed {totals.totalIncorrect}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1">
                  Accuracy {totals.accuracy}%
                </span>
              </div>
            </div>

            <div
              className="rounded-3xl border border-black/5 p-6 text-center sm:p-10"
              style={{ background: "var(--panel-strong)" }}
            >
              <p className="font-ui text-sm uppercase tracking-[0.3em] text-slate-500">
                Word
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <h2 className="font-display text-5xl text-[color:var(--accent)] sm:text-6xl">
                  {current.word}
                </h2>
                <button
                  aria-label="Play audio"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-slate-700 transition hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleSpeak}
                  disabled={!canSpeak}
                  title={canSpeak ? "Play audio" : "Audio unavailable"}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 10v4a2 2 0 0 0 2 2h3l5 4V4L10 8H7a2 2 0 0 0-2 2z" />
                    <path d="M18.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M20.5 6a8 8 0 0 1 0 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 text-lg text-slate-700">
                {revealed ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-slate-900">
                      {current.pronunciation}
                    </p>
                    <p className="font-ui text-sm uppercase tracking-[0.2em] text-slate-500">
                      {current.meaning}
                    </p>
                  </div>
                ) : (
                  <p className="font-ui text-slate-500">Pronunciation hidden.</p>
                )}
              </div>
            </div>

            <div className="font-ui flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:items-center">
              {!revealed ? (
                <button
                  className="rounded-full bg-[#486BFA] px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:scale-[1.01]"
                  onClick={() => setRevealed(true)}
                >
                  Reveal pronunciation
                </button>
              ) : null}
              {revealed ? (
                <>
                  <button
                    className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:scale-[1.01]"
                    onClick={() => handleGrade(true)}
                  >
                    I got it
                  </button>
                  <button
                    className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-700 transition hover:border-black/20"
                    onClick={() => handleGrade(false)}
                  >
                    Missed it
                  </button>
                </>
              ) : null}
            </div>
            <div className="font-ui flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:items-center">
              <button
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-700 transition hover:border-black/20"
                onClick={handleNext}
              >
                Next word
              </button>
            </div>
          </div>
        </section>
        <div className="font-ui mt-5 text-center text-xs uppercase tracking-[0.4em] text-slate-500">
          <a
            className="transition hover:text-slate-700"
            href="https://timeguessr.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Created by timeguessr.com
          </a>
        </div>
        <a
          className="fixed bottom-4 right-4 flex items-center gap-2 font-sans text-xs uppercase tracking-[0.35em] text-slate-500 transition hover:text-slate-700"
          href="https://github.com/gusow/readcyrillic"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/github-mark.svg"
            alt=""
            className="h-4 w-4 opacity-70"
          />
          GitHub
        </a>
      </main>
    </div>
  );
}
