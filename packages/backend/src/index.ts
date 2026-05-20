import "dotenv/config";
import { api_prefix } from "@klassebon/shared";
import { createApp } from "./app.js";

const isDev = process.env.NODE_ENV !== "production";
const api_port = Number(process.env.PORT) || 3000;

// TA2.3 Better Auth — must be before express.json (body parsed by handler)
app.all(`${API_PREFIX}/auth/*`, toNodeHandler(auth));

app.use(express.json());

// REST health (existing)
app.get(`${API_PREFIX}/health`, (_req, res) => {
	const body: HealthResponse = { ok: true, service: "backend" };
	res.json(body);
});

// TA2.1 tRPC on /api/trpc
app.use(
	`${API_PREFIX}/trpc`,
	trpcExpress.createExpressMiddleware({
		router: appRouter,
		createContext,
	}),
);

app.listen(PORT, () => {
	console.log(`Backend listening on http://localhost:${PORT}`);
	console.log(`  Better Auth: http://localhost:${PORT}${API_PREFIX}/auth`);
	console.log(`  tRPC:        http://localhost:${PORT}${API_PREFIX}/trpc`);
});
createApp()
  .listen(api_port, () => {
    if (isDev) {
      console.log(`Backend listening on http://localhost:${api_port}`);
      console.log(`  OpenAPI:  ${api_prefix}/openapi.json`);
      console.log(`  Swagger:  ${api_prefix}/docs`);
      console.log(`  Auth:     ${api_prefix}/auth`);
      console.log(`  tRPC:     ${api_prefix}/trpc`);
      console.log(`  Receipts: ${api_prefix}/receipts/upload`);
    } else {
      console.log(`Server started on port ${api_port}`);
    }
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  });
