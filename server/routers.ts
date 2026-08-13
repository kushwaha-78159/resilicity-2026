import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { compareScenarios, createScenario, listScenarios } from "./db";

const risk = (score: number) => score >= 70 ? "red" as const : score >= 45 ? "yellow" as const : "green" as const;
const scenarioInput = z.object({
  name: z.string().min(2).max(160),
  attendance: z.number().int().min(1000).max(100000),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  weather: z.enum(["Hot & humid", "Warm and clear", "Storm watch", "Mild evening"]),
  temperatureF: z.number().int().min(65).max(115),
  humidity: z.number().int().min(10).max(100),
});

export function calculateScenario(input: z.infer<typeof scenarioInput>) {
  const crowdDensity = Math.min(99, Math.round((input.attendance / 80000) * 82 + (input.humidity - 50) * 0.12));
  const heatIndex = Math.min(120, Math.round(input.temperatureF + Math.max(0, input.humidity - 40) * 0.26));
  const trafficCongestion = Math.min(99, Math.round(30 + (input.attendance / 80000) * 58 + (input.weather === "Storm watch" ? 10 : 0)));
  const heatScore = Math.min(99, Math.round((heatIndex - 78) * 2.4));
  const trafficScore = trafficCongestion;
  const crowdScore = crowdDensity;
  const overall = Math.round(heatScore * 0.35 + trafficScore * 0.35 + crowdScore * 0.3);
  const recommendations: string[] = [];
  if (heatScore >= 60) recommendations.push("Deploy mist-cooling stations along the south plaza and transit walk-up corridor.");
  else recommendations.push("Keep cooling assets on standby and monitor heat index at 30-minute intervals.");
  if (trafficScore >= 65) recommendations.push("Reserve a dedicated EV shuttle lane on Main Street and stagger arrivals by gate.");
  else recommendations.push("Use dynamic wayfinding to keep arrival demand distributed across stadium gates.");
  if (crowdScore >= 70) recommendations.push("Open overflow queuing zones and staff the pedestrian crossing at Kirby Drive.");
  else recommendations.push("Maintain standard pedestrian staffing with a surge team on call.");
  return {
    crowdDensity,
    heatIndex,
    trafficCongestion,
    riskLevel: risk(overall),
    heatRisk: risk(heatScore),
    trafficRisk: risk(trafficScore),
    crowdRisk: risk(crowdScore),
    carbonSavedTons: Math.max(0, Math.round(2 + (input.attendance / 10000) * 1.6)),
    minutesSaved: Math.max(3, Math.round(8 + (80000 - input.attendance) / 12000)),
    recommendations,
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    overview: publicProcedure.query(() => ({
      stadium: "NRG Stadium",
      city: "Houston, TX",
      event: "FIFA 2026 match-day planning",
      center: { lat: 29.6847, lng: -95.4107 },
      hotspots: [
        { lat: 29.6847, lng: -95.4107, level: "red", label: "Stadium bowl" },
        { lat: 29.6817, lng: -95.4078, level: "yellow", label: "Main Street arrival" },
        { lat: 29.6892, lng: -95.4142, level: "yellow", label: "South transit loop" },
        { lat: 29.6788, lng: -95.4166, level: "red", label: "I-610 interchange" },
      ],
      trends: [
        { event: "Baseline", temperature: 88, attendance: 62000, congestion: 58 },
        { event: "Match −3h", temperature: 91, attendance: 71000, congestion: 72 },
        { event: "Kickoff", temperature: 94, attendance: 78000, congestion: 86 },
        { event: "Half-time", temperature: 93, attendance: 80000, congestion: 78 },
        { event: "Post-match", temperature: 89, attendance: 69000, congestion: 64 },
      ],
    })),
  }),
  scenarios: router({
    simulateAndSave: publicProcedure.input(scenarioInput).mutation(async ({ ctx, input }) => {
      const outcome = calculateScenario(input);
      const scenario = await createScenario({ ...input, userId: ctx.user?.id ?? 0, ...outcome, recommendations: JSON.stringify(outcome.recommendations) });
      return { scenario, outcome };
    }),
    list: publicProcedure.query(({ ctx }) => listScenarios(ctx.user?.id ?? 0)),
    compare: publicProcedure.input(z.object({ ids: z.array(z.number().int()).min(1).max(3) })).query(({ ctx, input }) => compareScenarios(ctx.user?.id ?? 0, input.ids)),
  }),
});

export type AppRouter = typeof appRouter;
