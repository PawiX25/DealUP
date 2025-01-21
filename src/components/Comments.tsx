'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export default function Comments({ dealId, session }: { dealId: string, session: Session | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, [dealId]);

  const fetchComments = async () => {
    const response = await fetch(`/api/deals/${dealId}/comments`);
    const data = await response.json();
    setComments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/deals/${dealId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setContent('');
        await fetchComments();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={session ? "Write a comment..." : "Sign in to comment"}
          className="w-full p-3 rounded-lg border border-border bg-background"
          rows={3}
          disabled={!session || loading}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!session || loading || !content.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 mb-2">
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs">
                    {comment.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-medium text-sm">{comment.user.name}</span>
              <span className="text-xs text-foreground/60">
                {moment(comment.createdAt).fromNow()}
              </span>
            </div>
            <p className="text-foreground/80 whitespace-pre-line">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-foreground/60 py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
