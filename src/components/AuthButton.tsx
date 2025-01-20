'use client';

import { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function AuthButton({ session }: { session: Session | null }) {
  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || ''}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {session.user?.name}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="text-sm px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
    >
      Sign in with Google
    </button>
  );
}
