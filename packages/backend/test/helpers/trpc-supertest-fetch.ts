// Value import required: `ReturnType<typeof supertest.agent>` matches `TestAgent` from `supertest.agent(app)`.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- typeof needs value namespace
import supertest from "supertest";
import type { AppRouter } from "../../src/trpc/router.js";
import { createTRPCProxyClient, httpLink } from "@trpc/client";

const TEST_TRPC_ORIGIN = "http://127.0.0.1";

// Matches `supertest.agent(app)`. Wider than `SuperAgentTest` because the URL overloads differ in typings.
type SupertestCookieAgent = ReturnType<typeof supertest.agent>;

// tRPC client that routes HTTP through a supertest agent so cookies are preserved.
export function createTrpcClientForAgent(agent: SupertestCookieAgent, apiPrefix: string) {
  const trpcUrl = `${TEST_TRPC_ORIGIN}${apiPrefix}/trpc`;

  const fetchForAgent: typeof fetch = async (input, init) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const { pathname, search } = new URL(href);
    const path = pathname + search;
    const method = (init?.method ?? "GET").toLowerCase() as "get" | "post";

    let req = agent[method](path);
    if (init?.headers) {
      const headers = new Headers(init.headers as HeadersInit);
      headers.forEach((value, key) => {
        req = req.set(key, value);
      });
    }
    if (init?.body != null) {
      req = req.send(init.body as string);
    }

    const res = await req;
    return new Response(res.text, { status: res.status });
  };

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: trpcUrl,
        fetch: fetchForAgent,
      }),
    ],
  });
}
