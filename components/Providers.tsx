'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AudioPlayerProvider } from './AudioPlayerContext';
import GlobalPlayer from './GlobalPlayer';
import SessionExpiryWarning from './SessionExpiryWarning';
import UserStoreSync from './UserStoreSync';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserStoreSync />
      <AudioPlayerProvider>
        {children}
        <GlobalPlayer />
        <SessionExpiryWarning />
      </AudioPlayerProvider>
    </SessionProvider>
  );
}
