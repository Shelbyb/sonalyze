import { describe, it, expect } from "vitest";
import { getStorageMode, getCapabilities } from "@/lib/storage/config";
import { GET } from "@/app/api/storage/capabilities/route";

describe("storage config", () => {
  it("defaults to browser without DATABASE_URL", () => {
    expect(getStorageMode({} as any)).toBe("browser");
    expect(getCapabilities({} as any)).toEqual({
      mode: "browser",
      history: false,
      tags: false,
      syncedPrefs: false,
    });
  });
  it("uses postgres when DATABASE_URL is set", () => {
    expect(getCapabilities({ DATABASE_URL: "postgres://x" } as any)).toEqual({
      mode: "postgres",
      history: true,
      tags: true,
      syncedPrefs: true,
    });
  });
  it("STORAGE_MODE=browser overrides DATABASE_URL", () => {
    expect(
      getStorageMode({
        DATABASE_URL: "postgres://x",
        STORAGE_MODE: "browser",
      } as any),
    ).toBe("browser");
  });
  it("capabilities route returns JSON", async () => {
    const res = await GET();
    expect((await res.json()).mode).toBeDefined();
  });
});
