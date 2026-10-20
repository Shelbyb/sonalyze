/*
 * Copyright (c) 2026 Shelby Thomas Brayton Jr.
 * Licensed under the terms of the LICENSE file located in the root directory.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log(
      '[Daywalker] Running under Source-Available License. Quota managed via @shelbyb/daywalker-sdk.',
    );
  }
}
