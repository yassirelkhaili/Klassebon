import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";
import { api_prefix } from "@klassebon/shared";

export const trpc = createTRPCReact<any>();

export const queryClient = new QueryClient();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${api_prefix}/trpc`,
    }),
  ],
});
