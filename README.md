# GetsMo — Formal Logic Workspace

GetsMo is a classroom-ready propositional logic workspace designed for students and educators. It offers an interactive environment to generate truth tables, solve Karnaugh maps, analyze logical conditionals, and learn discrete mathematics through offline-first, client-side tools.

## Key Features

- **Intuitive Expression Editor**: Write logic expressions using standard keyboard inputs (e.g., `not`, `and`, `or`, `xor`, `implies`, `iff`) or symbols, which auto-format in real-time (`¬`, `∧`, `∨`, `⊕`, `→`, `↔`).
- **Interactive Truth Tables**: Computes complete truth tables for up to 8 variables. Breaks down expressions into sub-expressions in dependency order and highlights truth value alignments.
- **Karnaugh Map (K-Map) Solver**: Generates K-maps for 2, 3, or 4 variables, solving for Sum of Products (SOP) and Product of Sums (POS) expressions.
- **Classification Engine**: Automatically classifies statements as a **Tautology**, **Contradiction**, or **Contingency**.
- **Conditional Analysis**: Instantly computes the **Converse**, **Inverse**, and **Contrapositive** variations of conditional statements.
- **Learn Mode**: Interactive educational guide covering logical operators, conditional relationships, truth tables, and logical equivalences.
- **100% Offline-First**: All evaluations and simplifications run directly in the browser—no data is sent to external servers.

---

## Operator Reference

GetsMo supports a wide variety of inputs and symbols:

| Operator                    | Standard Symbol | Text / Alternative Inputs |
| :-------------------------- | :-------------: | :------------------------ |
| **Negation (NOT)**          |       `¬`       | `not`, `!`, `~`           |
| **Conjunction (AND)**       |       `∧`       | `and`, `&&`, `&`          |
| **Disjunction (OR)**        |       `∨`       | `or`, `\|\|`, `\|`        |
| **Exclusive OR (XOR)**      |       `⊕`       | `xor`, `^`                |
| **Implication (IF...THEN)** |       `→`       | `implies`, `->`, `=>`     |
| **Biconditional (IFF)**     |       `↔`       | `iff`, `<->`, `≡`         |
| **True / Verum**            |       `⊤`       | `true`, `T`, `1`          |
| **False / Falsum**          |       `⊥`       | `false`, `F`, `0`         |

---

## Tech Stack

- **Framework**: Next.js (App Router, React 19)
- **Styling**: Tailwind CSS v4 (configured via PostCSS)
- **Icons**: Lucide React
- **Primitives**: Radix UI (Accordion, Dialog, Tabs, etc.)
- **Charting**: Recharts
- **Typings**: TypeScript

---

## Getting Started

### Prerequisites

Ensure you have **Node.js (v18.0.0 or higher)** and **npm** installed.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/EldrexDelosReyesBula/GetsMo.git
cd GetsMo
npm install
```

### Running the Development Server

Start the local server at `http://localhost:3000`:

```bash
npm run dev
```

### Production Build

Compile the application for production deployment:

```bash
npm run build
```

Verify/run the built site:

```bash
npm run start
```
