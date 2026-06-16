import { evaluate, type Node } from "./parser";

// Standard 2-bit gray code order.
export const GRAY_2 = [0, 1, 3, 2];
export const GRAY_1 = [0, 1];

export interface KMap {
  vars: string[];
  rowVars: string[];
  colVars: string[];
  rowLabels: string[]; // bit strings in display order
  colLabels: string[];
  cells: boolean[][]; // [row][col]
}

function bitsToEnv(vars: string[], bits: number): Record<string, boolean> {
  const env: Record<string, boolean> = {};
  for (let i = 0; i < vars.length; i++) {
    env[vars[i]] = ((bits >> (vars.length - 1 - i)) & 1) === 1;
  }
  return env;
}

const pad = (n: number, w: number) => n.toString(2).padStart(w, "0");

export function buildKMap(root: Node, variables: string[]): KMap | null {
  const n = variables.length;
  if (n < 2 || n > 4) return null;

  let rowVars: string[], colVars: string[], rowOrder: number[], colOrder: number[];
  if (n === 2) {
    rowVars = [variables[0]];
    colVars = [variables[1]];
    rowOrder = GRAY_1;
    colOrder = GRAY_1;
  } else if (n === 3) {
    rowVars = [variables[0]];
    colVars = variables.slice(1);
    rowOrder = GRAY_1;
    colOrder = GRAY_2;
  } else {
    rowVars = variables.slice(0, 2);
    colVars = variables.slice(2);
    rowOrder = GRAY_2;
    colOrder = GRAY_2;
  }

  const cells: boolean[][] = [];
  for (let r = 0; r < rowOrder.length; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < colOrder.length; c++) {
      const env: Record<string, boolean> = {};
      const rowBits = rowOrder[r];
      const colBits = colOrder[c];
      for (let i = 0; i < rowVars.length; i++) {
        env[rowVars[i]] = ((rowBits >> (rowVars.length - 1 - i)) & 1) === 1;
      }
      for (let i = 0; i < colVars.length; i++) {
        env[colVars[i]] = ((colBits >> (colVars.length - 1 - i)) & 1) === 1;
      }
      row.push(evaluate(root, env));
    }
    cells.push(row);
  }

  return {
    vars: variables,
    rowVars,
    colVars,
    rowLabels: rowOrder.map((b) => pad(b, rowVars.length)),
    colLabels: colOrder.map((b) => pad(b, colVars.length)),
    cells,
  };
}

// Generate canonical SOP / POS (no minimization — true to evaluation).
export function sopExpression(root: Node, variables: string[]): string {
  const n = variables.length;
  const minterms: string[] = [];
  for (let i = 0; i < 1 << n; i++) {
    const env = bitsToEnv(variables, i);
    if (evaluate(root, env)) {
      const lit = variables.map((v) => (env[v] ? v : `¬${v}`)).join(" ∧ ");
      minterms.push(`(${lit})`);
    }
  }
  if (minterms.length === 0) return "⊥";
  if (minterms.length === 1 << n) return "⊤";
  return minterms.join(" ∨ ");
}

export function posExpression(root: Node, variables: string[]): string {
  const n = variables.length;
  const maxterms: string[] = [];
  for (let i = 0; i < 1 << n; i++) {
    const env = bitsToEnv(variables, i);
    if (!evaluate(root, env)) {
      const lit = variables.map((v) => (env[v] ? `¬${v}` : v)).join(" ∨ ");
      maxterms.push(`(${lit})`);
    }
  }
  if (maxterms.length === 0) return "⊤";
  if (maxterms.length === 1 << n) return "⊥";
  return maxterms.join(" ∧ ");
}
