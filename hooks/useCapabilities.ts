"use client";

import { useEffect, useState } from "react";
import { BROWSER_CAPABILITIES, type Capabilities } from "@/lib/storage/config";

let cached: Capabilities | null = null;

export function useCapabilities(): Capabilities & { loaded: boolean } {
  const [caps, setCaps] = useState<Capabilities>(
    cached ?? BROWSER_CAPABILITIES,
  );
  const [loaded, setLoaded] = useState(cached !== null);

  useEffect(() => {
    if (cached) return;
    let active = true;
    fetch("/api/storage/capabilities")
      .then((r) => (r.ok ? r.json() : BROWSER_CAPABILITIES))
      .catch(() => BROWSER_CAPABILITIES)
      .then((data: Capabilities) => {
        cached = data;
        if (active) {
          setCaps(data);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { ...caps, loaded };
}

export function resetCapabilitiesCache() {
  cached = null;
}
