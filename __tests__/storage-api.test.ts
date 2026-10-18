import { describe, it, expect, vi, beforeEach } from "vitest";

const getAuthSession = vi.fn();
vi.mock("@/lib/getSession", () => ({ getAuthSession: () => getAuthSession() }));

const chain: any = {};
const result = { rows: [] as any[] };
[
  "select",
  "from",
  "where",
  "orderBy",
  "limit",
  "insert",
  "values",
  "onConflictDoNothing",
  "onConflictDoUpdate",
  "delete",
].forEach((m) => (chain[m] = vi.fn(() => chain)));
chain.then = (res: any) => res(result.rows);
vi.mock("@/lib/db/client", () => ({
  getDb: () => chain,
  getReadDb: () => chain,
  isDbReachable: async () => true,
}));

import {
  GET as getPrefs,
  PUT as putPrefs,
} from "@/app/api/user/preferences/route";
import { POST as postHistory } from "@/app/api/user/history/route";
import {
  POST as postTag,
  DELETE as deleteTag,
} from "@/app/api/user/tags/route";

const req = (body: any) =>
  new Request("http://localhost/x", {
    method: "POST",
    body: JSON.stringify(body),
  });

describe("user storage API", () => {
  beforeEach(() => {
    result.rows = [];
    getAuthSession.mockResolvedValue({ spotifyId: "user1" });
    Object.values(chain).forEach((f: any) => f.mockClear?.());
  });

  it("returns 401 without a session", async () => {
    getAuthSession.mockResolvedValue(null);
    expect((await getPrefs()).status).toBe(401);
    expect((await postTag(req({ trackId: "t", tag: "x" }))).status).toBe(401);
  });

  it("reads and writes preferences", async () => {
    result.rows = [
      { spotifyId: "user1", name: "A", preferences: { volume: 0.5 } },
    ];
    const data = await (await getPrefs()).json();
    expect(data.preferences).toEqual({ volume: 0.5 });
    expect((await putPrefs(req({ preferences: { volume: 0.2 } }))).status).toBe(
      200,
    );
    expect(chain.onConflictDoUpdate).toHaveBeenCalled();
  });

  it("rejects invalid history and records a snapshot", async () => {
    expect((await postHistory(req({ timeRange: "bad" }))).status).toBe(400);
    const res = await postHistory(
      req({ timeRange: "short_term", topTracks: [], topArtists: [] }),
    );
    expect(res.status).toBe(201);
  });

  it("throttles history when a recent snapshot exists", async () => {
    result.rows = [{ id: 1 }];
    const res = await postHistory(
      req({ timeRange: "short_term", topTracks: [], topArtists: [] }),
    );
    expect((await res.json()).recorded).toBe(false);
  });

  it("adds tags idempotently and deletes them", async () => {
    expect((await postTag(req({ trackId: "t1", tag: " Chill " }))).status).toBe(
      201,
    );
    expect(chain.onConflictDoNothing).toHaveBeenCalled();
    expect((await postTag(req({ trackId: "t1", tag: "" }))).status).toBe(400);
    expect((await deleteTag(req({ trackId: "t1", tag: "chill" }))).status).toBe(
      200,
    );
  });
});
