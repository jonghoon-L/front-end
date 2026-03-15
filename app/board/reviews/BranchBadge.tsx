const BRANCH_LABELS: Record<string, string> = {
  N: "N수생관",
  "Hi-end": "하이엔드관",
  N수생관: "N수생관",
  하이엔드관: "하이엔드관",
};

export default function BranchBadge({ branch }: { branch: string }) {
  const isN = branch === "N" || branch.includes("N수생") || branch === "N수생관";
  const isHiEnd = branch === "Hi-end" || branch.includes("하이엔드") || branch === "하이엔드관";
  const label = BRANCH_LABELS[branch] ?? branch;

  const className = isN
    ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20"
    : isHiEnd
      ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/20"
      : "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 ring-1 ring-slate-200/80";

  return <span className={className}>{label}</span>;
}
