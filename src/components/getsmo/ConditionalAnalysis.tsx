import { useMemo } from "react";
import { nodeToString, buildTruthTable, type Node } from "@/lib/logic/parser";

// Find top-level implication. If the root is an implication, we analyze it directly;
// otherwise look at the root.
function findImplication(n: Node): Node | null {
  if (n.kind === "imp") return n;
  return null;
}

function not(a: Node): Node {
  return { kind: "not", a };
}
function imp(a: Node, b: Node): Node {
  return { kind: "imp", a, b };
}

export function ConditionalAnalysis({ node }: { node: Node }) {
  const target = findImplication(node);

  const variants = useMemo(() => {
    if (!target || target.kind !== "imp") return null;
    const P = target.a,
      Q = target.b;
    return [
      { name: "Original", desc: "P → Q", node: imp(P, Q) },
      { name: "Converse", desc: "Q → P", node: imp(Q, P) },
      { name: "Inverse", desc: "¬P → ¬Q", node: imp(not(P), not(Q)) },
      { name: "Contrapositive", desc: "¬Q → ¬P", node: imp(not(Q), not(P)) },
    ];
  }, [target]);

  if (!variants) {
    return (
      <div className="py-10 text-center">
        <p className="font-medium">No top-level implication detected</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use a formula like <span className="font-mono">P → Q</span> to see converse, inverse, and
          contrapositive.
        </p>
      </div>
    );
  }

  // Build column values per variant
  const allVars = new Set<string>();
  variants.forEach((v) => {
    const t = buildTruthTable(v.node);
    t.variables.forEach((x) => allVars.add(x));
  });
  const vars = Array.from(allVars).sort();
  const tables = variants.map((v) => ({
    ...v,
    table: buildTruthTable(v.node, { variableOrder: vars, descending: true }),
  }));

  // Pairwise equivalence
  const baseResults = tables[0].table.rows.map((r) => r.result);
  const eq = (i: number) => tables[i].table.rows.every((r, k) => r.result === baseResults[k]);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {tables.map((v, i) => (
          <div key={v.name} className="rounded-2xl bg-surface p-4 border border-border">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{v.name}</p>
              {i > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${eq(i) ? "bg-true-soft text-true" : "bg-surface-3 text-muted-foreground"}`}
                >
                  {eq(i) ? "≡ original" : "≢ original"}
                </span>
              )}
            </div>
            <p className="font-mono text-base">{nodeToString(v.node)}</p>
            <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto scroll-thin rounded-2xl border border-border">
        <table className="w-full text-sm font-mono">
          <thead className="bg-surface-2">
            <tr>
              {vars.map((v) => (
                <th key={v} className="px-3 py-2 text-left text-primary">
                  {v}
                </th>
              ))}
              {tables.map((t) => (
                <th
                  key={t.name}
                  className="px-3 py-2 text-left border-l border-border whitespace-nowrap"
                >
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tables[0].table.rows.map((_, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-surface/40"}>
                {vars.map((v) => (
                  <td key={v} className="px-3 py-2">
                    <span className={tables[0].table.rows[i].env[v] ? "tv-1" : "tv-0"}>
                      {tables[0].table.rows[i].env[v] ? 1 : 0}
                    </span>
                  </td>
                ))}
                {tables.map((t) => (
                  <td key={t.name} className="px-3 py-2 border-l border-border">
                    <span className={t.table.rows[i].result ? "tv-1" : "tv-0"}>
                      {t.table.rows[i].result ? 1 : 0}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
