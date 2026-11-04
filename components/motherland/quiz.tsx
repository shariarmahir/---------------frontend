"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { QuizQuestion } from "@/data/motherland-categories";
import { cn } from "@/lib/utils";
import { ANCHOR, COLUMN, DISPLAY } from "./kit";

/** Britannica's quiz, short: three questions side by side, each answered once, then the score. */
export function Quiz({ questions, name }: { questions: QuizQuestion[]; name: string }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <section id="quiz" aria-labelledby="quiz-title" className={cn(ANCHOR, "bg-white py-12 text-ml-ink sm:py-14 lg:py-16")}>
      <div className={cn(COLUMN, "flex flex-col gap-12")}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 id="quiz-title" className={DISPLAY}>
            Test yourself
          </h2>
          <p aria-live="polite" className="pb-2 text-lg font-semibold text-ml-ink/80">
            {answered === questions.length ? `You got ${right} of ${questions.length} on ${name}.` : `${answered} of ${questions.length} answered`}
          </p>
        </div>
        <ol className="grid gap-6 lg:grid-cols-3">
          {questions.map((q, i) => {
            const choice = picked[i];
            const done = choice !== null;
            return (
              <li key={q.question} className="flex flex-col gap-5 rounded-2xl bg-ml-ground p-6 sm:p-8">
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
                            !done && "bg-white ring-1 ring-ml-ink/15 hover:bg-signal-orange",
                            done && isAnswer && "bg-ml-green text-white",
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
