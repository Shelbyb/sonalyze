'use client';

import { signIn } from 'next-auth/react';

export function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.32-1.32 9.719-.66 13.439 1.62.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export default function LoginButton({
  className = '',
  label = 'Log in with Spotify',
  size = 'lg',
}: {
  className?: string;
  label?: string;
  size?: 'lg' | 'md';
}) {
  const sizing =
    size === 'lg' ? 'px-8 py-4 text-base gap-3' : 'px-5 py-2.5 text-sm gap-2';

  return (
    <button
      onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
      className={`group relative inline-flex items-center justify-center ${sizing} rounded-full bg-accent text-black font-display font-bold tracking-tight
        shadow-[0_0_0_0_rgba(30,215,96,0.5)] transition-all duration-300
        hover:scale-[1.04] hover:shadow-[0_8px_40px_-4px_rgba(30,215,96,0.65)] active:scale-[0.98]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent
        ${className}`}
    >
      <SpotifyIcon className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
      {label}
      <span className="absolute inset-0 rounded-full ring-1 ring-black/10" />
    </button>
  );
}
