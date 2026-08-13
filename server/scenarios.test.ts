import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createScenario: vi.fn(),
  listScenarios: vi.fn(),
  compareScenarios: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const user: AuthenticatedUser = { id: 7, openId: "planner-7", email: "planner@example.com", name: "Planner", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const context = (currentUser: AuthenticatedUser | null = user): TrpcContext => ({ user: currentUser, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

const input = { name: "Kickoff heat plan", attendance: 80000, startTime: "18:00", weather: "Hot & humid" as const, temperatureF: 94, humidity: 72 };

describe("scenario router contracts", () => {
  it("allows guest planners to use the public scenario workspace", async () => {
    dbMocks.listScenarios.mockResolvedValue([]);
    dbMocks.compareScenarios.mockResolvedValue([]);
    dbMocks.createScenario.mockResolvedValue({ id: 0, userId: 0, ...input, riskLevel: "red", recommendations: "[]" });
    const caller = appRouter.createCaller(context(null));
    await expect(caller.scenarios.list()).resolves.toEqual([]);
    await expect(caller.scenarios.compare({ ids: [1] })).resolves.toEqual([]);
    await expect(caller.scenarios.simulateAndSave(input)).resolves.toMatchObject({ scenario: { userId: 0 } });
  });

  it("persists a calculated scenario with timestamps, outcomes, and serialized recommendations", async () => {
    const createdAt = new Date("2026-08-13T12:00:00Z");
    dbMocks.createScenario.mockResolvedValue({ id: 12, userId: 7, ...input, createdAt, riskLevel: "red", recommendations: JSON.stringify(["Deploy cooling stations."]) });
    const result = await appRouter.createCaller(context()).scenarios.simulateAndSave(input);
    expect(dbMocks.createScenario).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, attendance: 80000, riskLevel: "red", recommendations: expect.stringContaining("cooling") }));
    expect(result.scenario?.id).toBe(12);
    expect(result.scenario?.createdAt).toEqual(createdAt);
    expect(result.outcome.recommendations).toHaveLength(3);
  });

  it("scopes list and comparison queries to the authenticated planner", async () => {
    dbMocks.listScenarios.mockResolvedValue([{ id: 1, userId: 7, riskLevel: "yellow" }]);
    dbMocks.compareScenarios.mockResolvedValue([{ id: 1, userId: 7, riskLevel: "yellow" }, { id: 2, userId: 7, riskLevel: "red" }]);
    const caller = appRouter.createCaller(context());
    await expect(caller.scenarios.list()).resolves.toHaveLength(1);
    await expect(caller.scenarios.compare({ ids: [1, 2] })).resolves.toHaveLength(2);
    expect(dbMocks.listScenarios).toHaveBeenCalledWith(7);
    expect(dbMocks.compareScenarios).toHaveBeenCalledWith(7, [1, 2]);
  });
});
