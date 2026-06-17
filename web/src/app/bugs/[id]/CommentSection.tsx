'use client';

import { useState } from 'react';
import type { Comment } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function CommentSection({
  bugId,
  initialComments,
  apiToken,
}: {
  bugId: string;
  initialComments: Comment[];
  apiToken: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API}/bugs/${bugId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const comment = (await res.json()) as Comment;
        setComments((prev) => [...prev, comment]);
        setBody('');
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">
        Comments ({comments.length})
      </h2>
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-zinc-300">{c.body}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-600 mt-2">{new Date(c.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Add a comment…"
          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-gray-400 dark:focus:border-zinc-600 rounded-lg p-3 text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 resize-y focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={posting || !body.trim()}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-gray-700 dark:text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {posting ? 'Posting…' : 'Add comment'}
        </button>
      </form>
    </section>
  );
}
