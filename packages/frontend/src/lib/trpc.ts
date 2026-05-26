/**
 * tRPC client — KlasseBon frontend
 *
 * PATTERN: createTRPCProxyClient (NOT React Query hooks).
 * All calls are imperative awaits:
 *   Queries:   await trpcClient.[router].[procedure].query({ ...input })
 *   Mutations: await trpcClient.[router].[procedure].mutate({ ...input })
 *
 * No useQuery, useMutation, or React Query anywhere in this codebase.
 */

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { api_prefix } from "@klassebon/shared";
import type { AppRouter } from "../../backend/src/trpc/router.js";

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${api_prefix}/trpc`,
      // Send the Better Auth session cookie on every request.
      fetch: (url, opts) =>
        fetch(url, { ...opts, credentials: "include" }),
    }),
  ],
});