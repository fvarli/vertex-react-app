export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full border-collapse text-sm">{children}</table>
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50">{children}</thead>
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TH({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-border px-3 py-2 text-left font-semibold">{children}</th>
}

export function TD({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-border px-3 py-2 align-middle">{children}</td>
}
