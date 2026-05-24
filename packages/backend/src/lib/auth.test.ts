import { describe, it, expect, vi } from "vitest";

vi.mock("./prisma.js", () => ({
  prisma: {},
}));

describe("auth config (TA2.3 + TA2.6)", () => {
  it("exports an auth object with api methods", async () => {
    const { auth } = await import("./auth.js");

    expect(auth).toBeDefined();
    expect(auth.api).toBeDefined();
    expect(typeof auth.api.getSession).toBe("function");
  });

  it("exposes signUpEmail endpoint", async () => {
    const { auth } = await import("./auth.js");
    expect(typeof auth.api.signUpEmail).toBe("function");
  });

  it("exposes signInEmail endpoint", async () => {
    const { auth } = await import("./auth.js");
    expect(typeof auth.api.signInEmail).toBe("function");
  });

  it("exposes requestPasswordReset endpoint (TA2.6)", async () => {
    const { auth } = await import("./auth.js");
    expect(typeof auth.api.requestPasswordReset).toBe("function");
  });

  it("exposes resetPassword endpoint (TA2.6)", async () => {
    const { auth } = await import("./auth.js");
    expect(typeof auth.api.resetPassword).toBe("function");
  });

  it("exposes signOut endpoint", async () => {
    const { auth } = await import("./auth.js");
    expect(typeof auth.api.signOut).toBe("function");
  });
});
