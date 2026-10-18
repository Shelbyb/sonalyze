import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { resetCapabilitiesCache } from "@/hooks/useCapabilities";
import TrackTags from "@/components/TrackTags";
import HistoryPage from "@/app/dashboard/history/page";
import Sidebar from "@/components/Sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));

const caps = (on: boolean) =>
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            mode: on ? "postgres" : "browser",
            history: on,
            tags: on,
            syncedPrefs: on,
          }),
        ),
      ),
  );

describe("feature-gated UI", () => {
  beforeEach(() => resetCapabilitiesCache());

  it("hides History link and tags in browser mode", async () => {
    caps(false);
    render(<Sidebar />);
    render(<TrackTags trackId="t1" />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText("History trends")).toBeNull();
    expect(screen.queryByTestId("track-tags")).toBeNull();
  });

  it("shows History link and tags in postgres mode", async () => {
    caps(true);
    render(<Sidebar />);
    expect(await screen.findByText("History trends")).toBeTruthy();
    render(<TrackTags trackId="t1" />);
    expect(await screen.findByTestId("track-tags")).toBeTruthy();
  });

  it("shows enable-with-DB hint on history page in browser mode", async () => {
    caps(false);
    render(<HistoryPage />);
    expect(await screen.findByTestId("history-hint")).toBeTruthy();
  });
});
