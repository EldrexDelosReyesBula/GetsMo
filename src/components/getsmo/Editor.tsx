import { useEffect, useRef } from "react";
import { autoFormat } from "@/lib/logic/parser";

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}

const QUICK_OPS = ["¬", "∧", "∨", "⊕", "→", "↔", "(", ")"];

export function Editor({ value, onChange, error }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Replace word forms when space is hit
    if (e.key === " ") {
      const before = value.slice(0, ref.current!.selectionStart);
      const after = value.slice(ref.current!.selectionStart);
      const formatted = autoFormatTail(before);
      if (formatted !== before) {
        e.preventDefault();
        const newVal = formatted + " " + after;
        onChange(newVal);
        requestAnimationFrame(() => {
          if (ref.current) {
            const pos = formatted.length + 1;
            ref.current.setSelectionRange(pos, pos);
          }
        });
      }
    }
  }

  function insertSymbol(sym: string) {
    const el = ref.current;
    if (!el) {
      onChange(value + sym);
      return;
    }
    const start = el.selectionStart,
      end = el.selectionEnd;
    const newVal = value.slice(0, start) + sym + value.slice(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + sym.length;
      el.setSelectionRange(pos, pos);
    });
  }

  // Highlight overlay
  const highlighted = highlight(value);

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl bg-surface border border-border focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition">
        <div
          aria-hidden
          className="absolute inset-0 px-4 py-3.5 font-mono text-lg whitespace-pre-wrap break-words pointer-events-none text-transparent"
        >
          {highlighted}
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="(A → B) ∧ ¬S"
          className="relative w-full bg-transparent resize-none px-4 py-3.5 font-mono text-lg outline-none caret-primary text-foreground placeholder:text-muted-foreground"
          style={{ minHeight: "3.5rem" }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_OPS.map((s) => (
          <button
            key={s}
            onClick={() => insertSymbol(s)}
            className="size-10 rounded-xl bg-surface hover:bg-primary-container hover:text-on-primary-container font-mono text-base border border-border transition-colors press"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}

// Apply autoformat to text ending in a word that should be converted.
function autoFormatTail(text: string): string {
  // Try formatting last token only; if a known operator word, replace.
  const map: Record<string, string> = {
    not: "¬",
    and: "∧",
    or: "∨",
    xor: "⊕",
    implies: "→",
    iff: "↔",
    true: "⊤",
    false: "⊥",
  };
  const m = text.match(/(\b)([A-Za-z]+)$/);
  if (!m) return text;
  const word = m[2].toLowerCase();
  if (word in map) {
    return text.slice(0, text.length - m[2].length) + map[word];
  }
  return text;
}

function highlight(input: string): React.ReactNode {
  // Simple inline highlighter for visual overlay (purely cosmetic via colored span clones).
  // The textarea content remains the source of truth; the overlay isn't shown (text-transparent).
  // We render the same string so wrapping/heights match exactly.
  return input || " ";
}
