// GetsMo Logic Engine — tokenizer, normalizer, parser, evaluator.

export type TokenType =
  | "VAR"
  | "NOT"
  | "AND"
  | "OR"
  | "XOR"
  | "IMP"
  | "IFF"
  | "LPAREN"
  | "RPAREN"
  | "CONST";

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

export type Node =
  | { kind: "var"; name: string }
  | { kind: "const"; value: boolean }
  | { kind: "not"; a: Node }
  | { kind: "and" | "or" | "xor" | "imp" | "iff"; a: Node; b: Node };

const OP_SYMBOL: Record<string, string> = {
  and: "∧",
  or: "∨",
  not: "¬",
  xor: "⊕",
  imp: "→",
  iff: "↔",
};

// Normalize many input forms into a canonical tokenizable string.
export function normalize(input: string): string {
  let s = input;
  // Bracket flavours → parens
  s = s.replace(/[[{]/g, "(").replace(/[\]}]/g, ")");

  // Word operators (case-insensitive, surrounded by non-word boundaries)
  const wordReplacements: Array<[RegExp, string]> = [
    [/\b(iff|equiv|equivalent)\b/gi, " ↔ "],
    [/\b(implies|imply|then)\b/gi, " → "],
    [/\b(xor)\b/gi, " ⊕ "],
    [/\b(and)\b/gi, " ∧ "],
    [/\b(or)\b/gi, " ∨ "],
    [/\b(not)\b/gi, " ¬ "],
    [/\b(true|T|1)\b/g, " ⊤ "],
    [/\b(false|F|0)\b/g, " ⊥ "],
  ];
  for (const [re, rep] of wordReplacements) s = s.replace(re, rep);

  // Symbolic operators (order matters: longer first)
  s = s.replace(/<->|<=>|≡|⇔/g, " ↔ ");
  s = s.replace(/->|=>|⇒/g, " → ");
  s = s.replace(/&&|&/g, " ∧ ");
  s = s.replace(/\|\||\|/g, " ∨ ");
  s = s.replace(/\^/g, " ⊕ ");
  s = s.replace(/~|!/g, " ¬ ");

  return s.replace(/\s+/g, " ").trim();
}

export function tokenize(raw: string): Token[] {
  const s = normalize(raw);
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === " ") {
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(", pos: i });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")", pos: i });
      i++;
      continue;
    }
    if (ch === "¬") {
      tokens.push({ type: "NOT", value: "¬", pos: i });
      i++;
      continue;
    }
    if (ch === "∧") {
      tokens.push({ type: "AND", value: "∧", pos: i });
      i++;
      continue;
    }
    if (ch === "∨") {
      tokens.push({ type: "OR", value: "∨", pos: i });
      i++;
      continue;
    }
    if (ch === "⊕") {
      tokens.push({ type: "XOR", value: "⊕", pos: i });
      i++;
      continue;
    }
    if (ch === "→") {
      tokens.push({ type: "IMP", value: "→", pos: i });
      i++;
      continue;
    }
    if (ch === "↔") {
      tokens.push({ type: "IFF", value: "↔", pos: i });
      i++;
      continue;
    }
    if (ch === "⊤") {
      tokens.push({ type: "CONST", value: "⊤", pos: i });
      i++;
      continue;
    }
    if (ch === "⊥") {
      tokens.push({ type: "CONST", value: "⊥", pos: i });
      i++;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      tokens.push({ type: "VAR", value: s.slice(i, j), pos: i });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character "${ch}" at position ${i}`);
  }
  return tokens;
}

// Pratt-ish recursive descent with precedence:
// IFF (lowest, right-assoc) > IMP (right-assoc) > OR > XOR > AND > NOT > atom
export function parse(input: string): Node {
  const tokens = tokenize(input);
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (t: TokenType) => {
    const tok = tokens[pos];
    if (!tok || tok.type !== t) throw new Error(`Expected ${t} but got ${tok?.type ?? "EOF"}`);
    pos++;
    return tok;
  };

  function parseIff(): Node {
    const left = parseImp();
    if (peek()?.type === "IFF") {
      pos++;
      const right = parseIff();
      return { kind: "iff", a: left, b: right };
    }
    return left;
  }
  function parseImp(): Node {
    const left = parseOr();
    if (peek()?.type === "IMP") {
      pos++;
      const right = parseImp();
      return { kind: "imp", a: left, b: right };
    }
    return left;
  }
  function parseOr(): Node {
    let left = parseXor();
    while (peek()?.type === "OR") {
      pos++;
      left = { kind: "or", a: left, b: parseXor() };
    }
    return left;
  }
  function parseXor(): Node {
    let left = parseAnd();
    while (peek()?.type === "XOR") {
      pos++;
      left = { kind: "xor", a: left, b: parseAnd() };
    }
    return left;
  }
  function parseAnd(): Node {
    let left = parseNot();
    while (peek()?.type === "AND") {
      pos++;
      left = { kind: "and", a: left, b: parseNot() };
    }
    return left;
  }
  function parseNot(): Node {
    if (peek()?.type === "NOT") {
      pos++;
      return { kind: "not", a: parseNot() };
    }
    return parseAtom();
  }
  function parseAtom(): Node {
    const t = peek();
    if (!t) throw new Error("Unexpected end of expression");
    if (t.type === "LPAREN") {
      pos++;
      const node = parseIff();
      eat("RPAREN");
      return node;
    }
    if (t.type === "VAR") {
      pos++;
      return { kind: "var", name: t.value };
    }
    if (t.type === "CONST") {
      pos++;
      return { kind: "const", value: t.value === "⊤" };
    }
    throw new Error(`Unexpected token "${t.value}"`);
  }

  if (tokens.length === 0) throw new Error("Empty expression");
  const node = parseIff();
  if (pos < tokens.length) throw new Error(`Unexpected token "${tokens[pos].value}"`);
  return node;
}

// Pretty-print a node back to canonical symbolic form.
export function nodeToString(n: Node, parent: Node["kind"] | null = null): string {
  switch (n.kind) {
    case "var":
      return n.name;
    case "const":
      return n.value ? "⊤" : "⊥";
    case "not":
      return `¬${nodeToString(n.a, "not")}`;
    case "and":
    case "or":
    case "xor":
    case "imp":
    case "iff": {
      const sym = OP_SYMBOL[n.kind];
      const s = `${nodeToString(n.a, n.kind)} ${sym} ${nodeToString(n.b, n.kind)}`;
      // Add parens if parent has higher precedence
      const needParens = parent !== null && precedence(parent) > precedence(n.kind);
      return needParens ? `(${s})` : s;
    }
  }
}

function precedence(kind: Node["kind"]): number {
  switch (kind) {
    case "not":
      return 5;
    case "and":
      return 4;
    case "xor":
      return 3;
    case "or":
      return 3;
    case "imp":
      return 2;
    case "iff":
      return 1;
    default:
      return 6;
  }
}

export function collectVariables(n: Node, into: Set<string> = new Set()): Set<string> {
  switch (n.kind) {
    case "var":
      into.add(n.name);
      break;
    case "const":
      break;
    case "not":
      collectVariables(n.a, into);
      break;
    default:
      collectVariables(n.a, into);
      collectVariables(n.b, into);
  }
  return into;
}

export function evaluate(n: Node, env: Record<string, boolean>): boolean {
  switch (n.kind) {
    case "var":
      return !!env[n.name];
    case "const":
      return n.value;
    case "not":
      return !evaluate(n.a, env);
    case "and":
      return evaluate(n.a, env) && evaluate(n.b, env);
    case "or":
      return evaluate(n.a, env) || evaluate(n.b, env);
    case "xor":
      return evaluate(n.a, env) !== evaluate(n.b, env);
    case "imp":
      return !evaluate(n.a, env) || evaluate(n.b, env);
    case "iff":
      return evaluate(n.a, env) === evaluate(n.b, env);
  }
}

// Collect distinct sub-expressions in dependency order (leaves first).
export function collectSubexpressions(n: Node): Node[] {
  const seen = new Map<string, Node>();
  const order: Node[] = [];
  function walk(node: Node) {
    if (node.kind === "var" || node.kind === "const") return;
    if (node.kind === "not") walk(node.a);
    else {
      walk(node.a);
      walk(node.b);
    }
    const key = nodeToString(node);
    if (!seen.has(key)) {
      seen.set(key, node);
      order.push(node);
    }
  }
  walk(n);
  return order;
}

export interface TruthTable {
  variables: string[];
  subExpressions: Node[]; // intermediate columns, in dependency order; last is the full expr
  rows: Array<{
    env: Record<string, boolean>;
    vars: boolean[]; // per variable in `variables` order
    subs: boolean[]; // per sub-expression in `subExpressions` order
    result: boolean; // == subs[subs.length - 1] when subExpressions has entries; else equals var/const
  }>;
}

export function buildTruthTable(
  root: Node,
  options?: { variableOrder?: string[]; descending?: boolean },
): TruthTable {
  const vars = options?.variableOrder ?? Array.from(collectVariables(root)).sort();
  const subs = collectSubexpressions(root);
  const n = vars.length;
  const total = 1 << n;
  const rows: TruthTable["rows"] = [];
  const desc = options?.descending ?? true; // 1 → 0 by default

  for (let i = 0; i < total; i++) {
    const idx = desc ? total - 1 - i : i;
    const env: Record<string, boolean> = {};
    const varVals: boolean[] = [];
    for (let v = 0; v < n; v++) {
      // most-significant variable first
      const bit = (idx >> (n - 1 - v)) & 1;
      env[vars[v]] = bit === 1;
      varVals.push(bit === 1);
    }
    const subVals = subs.map((s) => evaluate(s, env));
    const result = subs.length ? subVals[subVals.length - 1] : evaluate(root, env);
    rows.push({ env, vars: varVals, subs: subVals, result });
  }
  return { variables: vars, subExpressions: subs, rows };
}

export type Classification = "tautology" | "contradiction" | "contingency";
export function classify(table: TruthTable): Classification {
  let t = false,
    f = false;
  for (const r of table.rows) {
    if (r.result) t = true;
    else f = true;
    if (t && f) return "contingency";
  }
  return t ? "tautology" : "contradiction";
}

// Auto-format raw input → pretty canonical symbolic form (preserves user variables).
export function autoFormat(input: string): string {
  try {
    const ast = parse(input);
    return nodeToString(ast);
  } catch {
    return input;
  }
}
