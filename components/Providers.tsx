'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AudioPlayerProvider } from './AudioPlayerContext';
import GlobalPlayer from './GlobalPlayer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AudioPlayerProvider>
        {children}
        <GlobalPlayer />
      </AudioPlayerProvider>
    </SessionProvider>
  );
}
