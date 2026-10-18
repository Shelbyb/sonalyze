import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SessionExpiryWarning from '@/components/SessionExpiryWarning';
import ErrorBoundary from '@/app/error';
import ErrorPage from '@/app/error/page';
import * as nextAuthReact from 'next-auth/react';

vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    useSession: vi.fn(),
    signOut: vi.fn(),
    signIn: vi.fn(),
  };
});

describe('SessionExpiryWarning Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render warning when user is unauthenticated', () => {
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<SessionExpiryWarning />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does not render warning when session expiration is more than 5 minutes away', () => {
    const futureExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        expires: new Date(futureExpiry).toISOString(),
        accessTokenExpires: futureExpiry,
      } as any,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<SessionExpiryWarning />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renders warning modal when session is about to expire (within 5 minutes)', () => {
    const soonExpiry = Date.now() + 4 * 60 * 1000 + 30 * 1000; // 4 minutes 30 seconds
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        expires: new Date(soonExpiry).toISOString(),
        accessTokenExpires: soonExpiry,
      } as any,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<SessionExpiryWarning />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('4:30')).toBeInTheDocument();
    expect(screen.getByText('Extend Session')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('triggers logout when Log out button is clicked', async () => {
    const soonExpiry = Date.now() + 3 * 60 * 1000;
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        expires: new Date(soonExpiry).toISOString(),
      } as any,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<SessionExpiryWarning />);
    const logoutBtn = screen.getByText('Log out');
    fireEvent.click(logoutBtn);

    expect(nextAuthReact.signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('calls update when Extend Session button is clicked', async () => {
    const soonExpiry = Date.now() + 2 * 60 * 1000;
    const mockUpdate = vi.fn().mockResolvedValue({
      user: { name: 'Test User' },
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        expires: new Date(soonExpiry).toISOString(),
      } as any,
      status: 'authenticated',
      update: mockUpdate,
    });

    render(<SessionExpiryWarning />);
    const refreshBtn = screen.getByText('Extend Session');

    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('triggers signOut when session has expired', () => {
    const pastExpiry = Date.now() - 1000;
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        expires: new Date(pastExpiry).toISOString(),
      } as any,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<SessionExpiryWarning />);
    expect(nextAuthReact.signOut).toHaveBeenCalledWith({ callbackUrl: '/?error=SessionExpired' });
  });
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders generic error view for application exceptions', () => {
    const resetMock = vi.fn();
    render(
      <ErrorBoundary
        error={new Error('Failed to fetch data')}
        reset={resetMock}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();

    const tryAgainBtn = screen.getByText('Try again');
    fireEvent.click(tryAgainBtn);
    expect(resetMock).toHaveBeenCalled();
  });

  it('detects session errors and provides Return to Login action', () => {
    const resetMock = vi.fn();
    const sessionErr = new Error('Spotify session unauthorized error (401)');
    (sessionErr as any).status = 401;

    render(<ErrorBoundary error={sessionErr} reset={resetMock} />);

    expect(screen.getByText('Session Expired or Invalid')).toBeInTheDocument();
    expect(screen.getByText('Return to Login')).toBeInTheDocument();

    const returnBtn = screen.getByText('Return to Login');
    fireEvent.click(returnBtn);
    expect(nextAuthReact.signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});

describe('ErrorPage (/error route)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders error page and handles session errors with login button', () => {
    render(<ErrorPage />);

    expect(screen.getByText(/Session Error|Authentication Error|Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByText('Go to Login')).toBeInTheDocument();

    const loginBtn = screen.getByText('Go to Login');
    fireEvent.click(loginBtn);
    expect(nextAuthReact.signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});
