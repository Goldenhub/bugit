import type { Severity, Status } from "./types";

// Severity: solid filled pill - conveys "how bad is it?"
export const SEV_CLASSES: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400",
  medium: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400",
  low: "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400",
};

// Status: outlined pill - conveys "where is it?"
export const STATUS_CLASSES: Record<Status, string> = {
  open: "border border-amber-400 text-amber-600 dark:border-amber-600 dark:text-amber-400",
  "in-progress": "border border-blue-400 text-blue-600 dark:border-blue-600 dark:text-blue-400",
  resolved: "border border-green-500 text-green-600 dark:border-green-600 dark:text-green-400",
  wontfix: "border border-gray-300 text-gray-400 dark:border-zinc-600 dark:text-zinc-500",
};
