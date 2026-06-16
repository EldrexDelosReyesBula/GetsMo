import { useState } from "react";
import { nodeToString, type TruthTable } from "@/lib/logic/parser";
import { Check, Copy } from "lucide-react";

interface Props {
  table: TruthTable;
  activeSub: string | null;
  onSubClick: (sub: string) => void;
}

export function TruthTableView({ table, activeSub, onSubClick }: Props) {
  const [copiedRow, setCopiedRow] = useState<number | null>(null);

  const subLabels = table.subExpressions.map((n) => nodeToString(n));
  const finalLabel = subLabels[subLabels.length - 1];

  function copyRow(i: number) {
    const r = table.rows[i];
    const parts = table.variables.map((v) => `${v}=${r.env[v] ? 1 : 0}`);
    parts.push(`Result=${r.result ? 1 : 0}`);
    navigator.clipboard?.writeText(parts.join(" "));
    setCopiedRow(i);
    setTimeout(() => setCopiedRow((c) => (c === i ? null : c)), 1400);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {table.rows.length} rows • Click a column header to trace dependencies • Click a row to
          copy.
        </p>
      </div>
      <div className="overflow-x-auto scroll-thin rounded-2xl border border-border max-h-[60vh]">
        <table className="w-full text-sm font-mono border-collapse">
          <thead className="sticky top-0 z-10 bg-surface-2 backdrop-blur">
            <tr>
              {table.variables.map((v) => (
                <th
                  key={v}
                  className="px-4 py-3 text-left font-semibold border-b border-border whitespace-nowrap"
                >
                  <span className="text-primary">{v}</span>
                </th>
              ))}
              {subLabels.slice(0, -1).map((s) => (
                <th
                  key={s}
                  onClick={() => onSubClick(s)}
                  className={`px-4 py-3 text-left font-medium border-b border-l border-border cursor-pointer transition-colors whitespace-nowrap ${activeSub === s ? "bg-primary-container text-on-primary-container" : "hover:bg-surface-3"}`}
                  title="Click to focus this sub-expression"
                >
                  <span className="text-xs text-muted-foreground mr-1">f =</span>
                  {s}
                </th>
              ))}
              <th
                onClick={() => onSubClick(finalLabel)}
                className={`px-4 py-3 text-left font-semibold border-b border-l-2 border-l-primary border-border cursor-pointer whitespace-nowrap ${activeSub === finalLabel ? "bg-primary-container text-on-primary-container" : "bg-surface"}`}
              >
                {finalLabel}
              </th>
              <th className="px-2 py-3 border-b border-border w-10" />
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr
                key={i}
                onClick={() => copyRow(i)}
                className={`group cursor-pointer transition-colors ${i % 2 === 0 ? "bg-card" : "bg-surface/40"} hover:bg-primary-container/40`}
              >
                {r.vars.map((b, k) => (
                  <td key={k} className="px-4 py-2.5 border-b border-border/60">
                    <span className={b ? "tv-1" : "tv-0"}>{b ? 1 : 0}</span>
                  </td>
                ))}
                {r.subs.slice(0, -1).map((b, k) => {
                  const label = subLabels[k];
                  const active = activeSub === label;
                  return (
                    <td
                      key={k}
                      className={`px-4 py-2.5 border-b border-l border-border/60 ${active ? "bg-primary-container/60" : ""}`}
                    >
                      <span className={b ? "tv-1" : "tv-0"}>{b ? 1 : 0}</span>
                    </td>
                  );
                })}
                <td
                  className={`px-4 py-2.5 border-b border-l-2 border-l-primary border-border/60 ${r.result ? "bg-true-soft" : "bg-false-soft"}`}
                >
                  <span className={r.result ? "tv-1" : "tv-0"}>{r.result ? 1 : 0}</span>
                </td>
                <td className="px-2 py-2.5 border-b border-border/60 w-10">
                  {copiedRow === i ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
