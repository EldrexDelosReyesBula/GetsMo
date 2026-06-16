import { useMemo, useState, useEffect } from "react";
import {
  parse,
  autoFormat,
  nodeToString,
  collectVariables,
  buildTruthTable,
  classify,
  type Node,
  type TruthTable,
} from "@/lib/logic/parser";
import { buildKMap, sopExpression, posExpression } from "@/lib/logic/kmap";
import { Editor } from "./Editor";
import { VariableChips } from "./VariableChips";
import { TruthTableView } from "./TruthTable";
import { Classification } from "./Classification";
import { ConditionalAnalysis } from "./ConditionalAnalysis";
import { KMapView } from "./KMap";
import { LearnMode } from "./LearnMode";
import { Lightbulb, Sparkles, Table2, Grid3x3, GraduationCap, Moon, Sun } from "lucide-react";

type Tab = "table" | "kmap" | "conditional" | "learn";

const EXAMPLES = [
  { label: "Implication", expr: "P → Q" },
  { label: "De Morgan", expr: "¬(A ∧ B) ↔ (¬A ∨ ¬B)" },
  { label: "Modus Ponens", expr: "((P → Q) ∧ P) → Q" },
  { label: "Compound", expr: "(A → B) ∧ ¬S" },
  { label: "Triple", expr: "{[(A→B)∧¬S]∧[B→(S∨D)]}→(A→D)" },
];

export function Workspace() {
  const [raw, setRaw] = useState("(A → B) ∧ ¬S");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("table");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [manualVars, setManualVars] = useState<string[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const parsed = useMemo<{ node: Node | null; error: string | null }>(() => {
    if (!raw.trim()) return { node: null, error: null };
    try {
      return { node: parse(raw), error: null };
    } catch (e) {
      return { node: null, error: (e as Error).message };
    }
  }, [raw]);

  const detected = useMemo(
    () => (parsed.node ? Array.from(collectVariables(parsed.node)).sort() : []),
    [parsed.node],
  );
  const variables = useMemo(() => {
    const merged = new Set<string>([...detected, ...manualVars]);
    return Array.from(merged).sort();
  }, [detected, manualVars]);

  const table: TruthTable | null = useMemo(() => {
    if (!parsed.node || variables.length === 0) return null;
    if (variables.length > 8) return null;
    return buildTruthTable(parsed.node, { variableOrder: variables, descending: true });
  }, [parsed.node, variables]);

  const cls = useMemo(() => (table ? classify(table) : null), [table]);
  const kmap = useMemo(
    () => (parsed.node ? buildKMap(parsed.node, variables) : null),
    [parsed.node, variables],
  );
  const sop = useMemo(
    () => (parsed.node && variables.length > 0 ? sopExpression(parsed.node, variables) : ""),
    [parsed.node, variables],
  );
  const pos = useMemo(
    () => (parsed.node && variables.length > 0 ? posExpression(parsed.node, variables) : ""),
    [parsed.node, variables],
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-2xl grid place-items-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">GetsMo</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Formal Logic Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex chip">Offline · Local</span>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="size-10 rounded-full bg-surface hover:bg-surface-2 grid place-items-center transition-colors press ring-focus"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        {/* Main column */}
        <section className="space-y-6 min-w-0">
          {/* Editor card */}
          <div className="surface-elevated p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Expression
              </h2>
              <button
                onClick={() => parsed.node && setRaw(nodeToString(parsed.node))}
                disabled={!parsed.node}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container disabled:opacity-40 hover:bg-secondary transition-colors press"
              >
                Auto-format
              </button>
            </div>
            <Editor value={raw} onChange={setRaw} error={parsed.error} />
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setRaw(ex.expr)}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface hover:bg-surface-2 border border-border transition-colors press"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variables */}
          <div className="surface-elevated p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Variables
              </h2>
              <span className="text-xs text-muted-foreground">
                {variables.length === 0
                  ? "None"
                  : `${variables.length} • ${1 << variables.length} rows`}
              </span>
            </div>
            <VariableChips
              variables={variables}
              detected={detected}
              onAdd={(v) => setManualVars((m) => Array.from(new Set([...m, v])))}
              onRemove={(v) => setManualVars((m) => m.filter((x) => x !== v))}
            />
          </div>

          {/* Tabs */}
          <div className="surface-elevated overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto scroll-thin">
              <TabBtn
                id="table"
                tab={tab}
                setTab={setTab}
                icon={<Table2 className="size-4" />}
                label="Truth Table"
              />
              <TabBtn
                id="kmap"
                tab={tab}
                setTab={setTab}
                icon={<Grid3x3 className="size-4" />}
                label="Karnaugh Map"
              />
              <TabBtn
                id="conditional"
                tab={tab}
                setTab={setTab}
                icon={<Lightbulb className="size-4" />}
                label="Conditional"
              />
              <TabBtn
                id="learn"
                tab={tab}
                setTab={setTab}
                icon={<GraduationCap className="size-4" />}
                label="Learn"
              />
            </div>

            <div className="p-5">
              {tab === "table" &&
                (table ? (
                  <TruthTableView
                    table={table}
                    activeSub={activeSub}
                    onSubClick={(s) => setActiveSub((a) => (a === s ? null : s))}
                  />
                ) : (
                  <EmptyState
                    title={
                      variables.length > 8 ? "Too many variables" : "Enter an expression to begin"
                    }
                    sub={
                      variables.length > 8
                        ? "Truth table generation is limited to 8 variables (256 rows)."
                        : "Use ∧ ∨ ¬ → ↔ or AND/OR/NOT — auto-formatted as you go."
                    }
                  />
                ))}
              {tab === "kmap" &&
                (kmap ? (
                  <KMapView kmap={kmap} sop={sop} pos={pos} />
                ) : (
                  <EmptyState
                    title="K-Map needs 2–4 variables"
                    sub="Karnaugh maps support 2, 3, or 4 variables."
                  />
                ))}
              {tab === "conditional" &&
                (parsed.node ? (
                  <ConditionalAnalysis node={parsed.node} />
                ) : (
                  <EmptyState
                    title="Enter an expression"
                    sub="Conditional analysis shows converse, inverse, and contrapositive."
                  />
                ))}
              {tab === "learn" && <LearnMode />}
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="surface-elevated p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Classification
            </h2>
            {cls ? (
              <Classification kind={cls} table={table!} />
            ) : (
              <p className="text-sm text-muted-foreground">Waiting for input…</p>
            )}
          </div>

          <div className="surface-elevated p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Operator Reference
            </h2>
            <ul className="space-y-2 text-sm">
              {[
                ["¬ A", "NOT", "not, !, ~"],
                ["A ∧ B", "AND", "and, &&, &"],
                ["A ∨ B", "OR", "or, ||, |"],
                ["A ⊕ B", "XOR", "xor, ^"],
                ["A → B", "IMPLIES", "implies, ->, =>"],
                ["A ↔ B", "IFF", "iff, <->, ≡"],
              ].map(([sym, name, alts]) => (
                <li
                  key={sym}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-surface"
                >
                  <span className="font-mono">{sym}</span>
                  <span className="text-xs text-muted-foreground">{name}</span>
                  <span className="text-xs font-mono text-tertiary">{alts}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-elevated p-5 space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GetsMo runs entirely in your browser. No AI. No cloud. No backend. Built for students
              of CS, IT, Engineering, and Discrete Mathematics.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function TabBtn({
  id,
  tab,
  setTab,
  icon,
  label,
}: {
  id: Tab;
  tab: Tab;
  setTab: (t: Tab) => void;
  icon: React.ReactNode;
  label: string;
}) {
  const active = tab === id;
  return (
    <button
      onClick={() => setTab(id)}
      className={`relative flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {label}
      {active && (
        <span
          className="absolute left-3 right-3 bottom-0 h-0.5 rounded-t-full"
          style={{ background: "var(--gradient-primary)" }}
        />
      )}
    </button>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}
