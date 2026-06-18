"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Bug } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function NewBugForm({ projects, apiToken }: { projects: string[]; apiToken: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const tagsRaw = (fd.get("tags") as string) ?? "";

    const body = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      severity: fd.get("severity") as string,
      project: fd.get("project") as string,
      environment: fd.get("environment") as string,
      tags: tagsRaw
        ? tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      notes: fd.get("notes") as string,
      source: "web",
    };

    try {
      const res = await fetch(`${API}/bugs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Failed to create bug");
      }
      const bug = (await res.json()) as Bug;
      router.push(`/bugs/${bug._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">{error}</div>}

      <Field label="Title" required>
        <input name="title" required placeholder="Short, descriptive title" className={inputCls} />
      </Field>

      <Field label="Project">
        <input name="project" list="projects-list" placeholder="e.g. bugit" className={inputCls} />
        <datalist id="projects-list">
          {projects.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Severity">
          <select name="severity" defaultValue="medium" className={inputCls}>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>
        <Field label="Environment">
          <input name="environment" placeholder="local / staging / prod" className={inputCls} />
        </Field>
      </div>

      <Field label="Description">
        <textarea name="description" rows={4} placeholder="Steps to reproduce, what happened…" className={`${inputCls} resize-y`} />
      </Field>

      <Field label="Tags">
        <input name="tags" placeholder="nestjs, bullmq, mongodb (comma-separated)" className={inputCls} />
      </Field>

      <Field label="Notes">
        <textarea name="notes" rows={3} placeholder="Root cause, fix ideas…" className={`${inputCls} resize-y`} />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {submitting ? "Logging…" : "Log bug"}
        </button>
        <button type="button" onClick={() => router.back()} className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 focus:border-gray-500 dark:focus:border-zinc-500 text-gray-900 dark:text-zinc-100 text-sm rounded-lg px-3 py-2.5 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none transition-colors";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-gray-600 dark:text-zinc-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
