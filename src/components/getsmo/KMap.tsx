import type { KMap } from "@/lib/logic/kmap";

interface Props {
  kmap: KMap;
  sop: string;
  pos: string;
}

export function KMapView({ kmap, sop, pos }: Props) {
  const colHeader = kmap.colVars.join("");
  const rowHeader = kmap.rowVars.join("");

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto scroll-thin">
        <table className="border-collapse mx-auto">
          <thead>
            <tr>
              <th className="p-2"></th>
              <th
                colSpan={kmap.colLabels.length}
                className="text-center pb-2 text-xs uppercase tracking-wider text-muted-foreground"
              >
                {colHeader}
              </th>
            </tr>
            <tr>
              <th className="text-xs uppercase tracking-wider text-muted-foreground pr-3 align-bottom">
                {rowHeader}
              </th>
              {kmap.colLabels.map((c) => (
                <th
                  key={c}
                  className="px-3 py-2 text-sm font-mono text-muted-foreground border-b border-border"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kmap.cells.map((row, ri) => (
              <tr key={ri}>
                <th className="px-3 py-2 text-sm font-mono text-muted-foreground border-r border-border">
                  {kmap.rowLabels[ri]}
                </th>
                {row.map((v, ci) => (
                  <td key={ci} className="p-1">
                    <div
                      className={`size-14 sm:size-16 grid place-items-center rounded-2xl font-mono text-lg font-semibold border ${v ? "bg-true-soft text-true border-true/30" : "bg-false-soft text-false border-false/20"}`}
                    >
                      {v ? 1 : 0}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-4 border border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Sum of Products (SOP)
          </p>
          <p className="font-mono text-sm break-words leading-relaxed">{sop}</p>
        </div>
        <div className="rounded-2xl bg-surface p-4 border border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Product of Sums (POS)
          </p>
          <p className="font-mono text-sm break-words leading-relaxed">{pos}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Cells laid out in Gray code order. SOP and POS are canonical (unminimized).
      </p>
    </div>
  );
}
