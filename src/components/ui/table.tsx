export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full border-separate border-spacing-0 text-sm">{children}</table>
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-foreground/[0.03]">{children}</thead>
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TH({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-border/80 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">{children}</th>
}

export function TD({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-border/70 px-3 py-3 align-middle text-foreground">{children}</td>
}
