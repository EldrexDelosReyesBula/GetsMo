import type { Classification as Cls, TruthTable } from "@/lib/logic/parser";
import { CheckCircle2, XCircle, Shuffle } from "lucide-react";

const META: Record<
  Cls,
  { label: string; sub: string; tone: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  tautology: {
    label: "Tautology",
    sub: "Always true for every assignment.",
    tone: "bg-true-soft text-true",
    Icon: CheckCircle2,
  },
  contradiction: {
    label: "Contradiction",
    sub: "Always false for every assignment.",
    tone: "bg-false-soft text-false",
    Icon: XCircle,
  },
  contingency: {
    label: "Contingency",
    sub: "Sometimes true, sometimes false.",
    tone: "bg-secondary-container text-on-secondary-container",
    Icon: Shuffle,
  },
};

export function Classification({ kind, table }: { kind: Cls; table: TruthTable }) {
  const m = META[kind];
  const trueCount = table.rows.filter((r) => r.result).length;
  return (
    <div className="space-y-3">
      <div className={`rounded-2xl p-4 ${m.tone}`}>
        <div className="flex items-center gap-3">
          <m.Icon className="size-6" />
          <div>
            <p className="font-semibold">{m.label}</p>
            <p className="text-xs opacity-80 mt-0.5">{m.sub}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface p-3">
          <p className="text-xs text-muted-foreground">True rows</p>
          <p className="text-xl font-semibold mt-0.5 tv-1">{trueCount}</p>
        </div>
        <div className="rounded-xl bg-surface p-3">
          <p className="text-xs text-muted-foreground">False rows</p>
          <p className="text-xl font-semibold mt-0.5 tv-0">{table.rows.length - trueCount}</p>
        </div>
      </div>
    </div>
  );
}
