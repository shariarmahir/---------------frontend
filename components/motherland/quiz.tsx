"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { QuizQuestion } from "@/data/motherland-categories";
import { cn } from "@/lib/utils";
import { ANCHOR, BAND_Y, COLUMN, DISPLAY } from "./kit";

/** Britannica's quiz, short: each question answered once, then the score. Three share a row; any other count falls into pairs, so no row is left short. */
export function Quiz({ questions, name }: { questions: QuizQuestion[]; name: string }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <section id="quiz" aria-labelledby="quiz-title" className={cn(ANCHOR, BAND_Y, "bg-ml-sun text-ml-ink")}>
      <div className={cn(COLUMN, "flex flex-col gap-8 lg:gap-10")}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 id="quiz-title" className={DISPLAY}>
            Test yourself
          </h2>
          <p aria-live="polite" className="pb-2 text-lg font-semibold text-ml-ink/80">
            {answered === questions.length ? `You got ${right} of ${questions.length} on ${name}.` : `${answered} of ${questions.length} answered`}
          </p>
        </div>
        <ol className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 lg:gap-6", questions.length % 3 === 0 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
          {questions.map((q, i) => {
            const choice = picked[i];
            const done = choice !== null;
            return (
              <li key={q.question} className="flex flex-col gap-5 rounded-[1.25rem] bg-white p-6 shadow-[0_10px_30px_-18px_rgb(11_24_73/0.45)] sm:p-8">
                <p className="text-xl leading-snug font-bold text-balance">{q.question}</p>
                <ul className="flex flex-col gap-2.5">
                  {q.options.map((o, n) => {
                    const isAnswer = n === q.answer;
                    const isChoice = n === choice;
                    return (
                      <li key={o}>
                        <button
                          type="button"
                          disabled={done}
                          onClick={() => setPicked((p) => p.map((v, k) => (k === i ? n : v)))}
                          className={cn(
                            "flex min-h-12 w-full items-center justify-between gap-3 rounded-full px-6 py-2.5 text-left font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green",
                            !done && "bg-ml-ground ring-1 ring-ml-ink/15 hover:bg-signal-orange",
                            done && isAnswer && "bg-signal-orange text-ml-ink",
                            done && !isAnswer && isChoice && "bg-ml-ink text-white",
                            done && !isAnswer && !isChoice && "bg-white text-ml-ink/55 ring-1 ring-ml-ink/10",
                          )}
                        >
                          {o}
                          {done && isAnswer ? <Icon name="check" className="text-xl" /> : null}
                          {done && !isAnswer && isChoice ? <Icon name="close" className="text-xl" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {done ? <p className="leading-relaxed text-ml-ink/85">{q.why}</p> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
