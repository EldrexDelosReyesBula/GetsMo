import { useState } from "react";
import { buildTruthTable, parse } from "@/lib/logic/parser";

interface Lesson {
  name: string;
  symbol: string;
  expr: string;
  intuition: string;
  rule: string;
}

const LESSONS: Lesson[] = [
  {
    name: "AND",
    symbol: "∧",
    expr: "A ∧ B",
    intuition: "Both must be true.",
    rule: "True only when A and B are both true.",
  },
  {
    name: "OR",
    symbol: "∨",
    expr: "A ∨ B",
    intuition: "At least one must be true.",
    rule: "False only when both A and B are false.",
  },
  {
    name: "NOT",
    symbol: "¬",
    expr: "¬ A",
    intuition: "Flip the truth value.",
    rule: "True becomes false, false becomes true.",
  },
  {
    name: "XOR",
    symbol: "⊕",
    expr: "A ⊕ B",
    intuition: "Exactly one is true.",
    rule: "True when A and B differ.",
  },
  {
    name: "NAND",
    symbol: "↑",
    expr: "¬(A ∧ B)",
    intuition: "Not both true.",
    rule: "False only when both A and B are true.",
  },
  {
    name: "NOR",
    symbol: "↓",
    expr: "¬(A ∨ B)",
    intuition: "Neither is true.",
    rule: "True only when both A and B are false.",
  },
  {
    name: "IMPLIES",
    symbol: "→",
    expr: "A → B",
    intuition: "If A then B.",
    rule: "False only when A is true and B is false.",
  },
  {
    name: "IFF",
    symbol: "↔",
    expr: "A ↔ B",
    intuition: "Both the same.",
    rule: "True when A and B share the same value.",
  },
];

export function LearnMode() {
  const [active, setActive] = useState(0);
  const lesson = LESSONS[active];
  const ast = parse(lesson.expr);
  const table = buildTruthTable(ast);

  return (
    <div className="grid md:grid-cols-[200px_minmax(0,1fr)] gap-5">
      <nav className="flex md:flex-col gap-1.5 overflow-x-auto scroll-thin">
        {LESSONS.map((l, i) => (
          <button
            key={l.name}
            onClick={() => setActive(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm whitespace-nowrap transition-colors ${i === active ? "bg-primary-container text-on-primary-container" : "hover:bg-surface"}`}
          >
            <span className="font-mono text-base w-5">{l.symbol}</span>
            <span className="font-medium">{l.name}</span>
          </button>
        ))}
      </nav>

      <div className="space-y-4">
        <header>
          <h3 className="text-2xl font-semibold flex items-baseline gap-3">
            {lesson.name} <span className="font-mono text-primary">{lesson.symbol}</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{lesson.intuition}</p>
        </header>

        <div className="rounded-2xl bg-secondary-container/60 p-4">
          <p className="text-xs uppercase tracking-wider text-on-secondary-container/70">Rule</p>
          <p className="text-on-secondary-container mt-1">{lesson.rule}</p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead className="bg-surface-2">
              <tr>
                {table.variables.map((v) => (
                  <th key={v} className="px-4 py-2 text-left text-primary">
                    {v}
                  </th>
                ))}
                <th className="px-4 py-2 text-left border-l border-border">{lesson.expr}</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-surface/40"}>
                  {r.vars.map((b, k) => (
                    <td key={k} className="px-4 py-2">
                      <span className={b ? "tv-1" : "tv-0"}>{b ? 1 : 0}</span>
                    </td>
                  ))}
                  <td
                    className={`px-4 py-2 border-l border-border ${r.result ? "bg-true-soft" : "bg-false-soft"}`}
                  >
                    <span className={r.result ? "tv-1" : "tv-0"}>{r.result ? 1 : 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
