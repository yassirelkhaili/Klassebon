import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { api_prefix } from "@klassebon/shared";

export const trpcClient = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: `${api_prefix}/trpc`,
    }),
  ],
});
