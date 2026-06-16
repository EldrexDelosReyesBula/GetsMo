import { useState } from "react";
import { Plus, X } from "lucide-react";

interface Props {
  variables: string[];
  detected: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}

export function VariableChips({ variables, detected, onAdd, onRemove }: Props) {
  const [draft, setDraft] = useState("");

  function commit() {
    const cleaned = draft.trim().replace(/[^A-Za-z0-9_]/g, "");
    if (cleaned) onAdd(cleaned);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {variables.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No variables yet — type a proposition above.
        </p>
      )}
      {variables.map((v) => {
        const isDetected = detected.includes(v);
        return (
          <span
            key={v}
            className={`chip ${isDetected ? "chip-primary" : ""} group`}
            title={isDetected ? "Detected in expression" : "Manually added"}
          >
            <span className="font-mono font-semibold">{v}</span>
            {!isDetected && (
              <button
                onClick={() => onRemove(v)}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Remove ${v}`}
              >
                <X className="size-3.5" />
              </button>
            )}
          </span>
        );
      })}
      <div className="flex items-center gap-1 rounded-full bg-surface border border-border pl-3 pr-1 py-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder="add"
          maxLength={6}
          className="w-14 bg-transparent text-sm font-mono outline-none"
        />
        <button
          onClick={commit}
          className="size-7 grid place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 press"
          aria-label="Add variable"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
