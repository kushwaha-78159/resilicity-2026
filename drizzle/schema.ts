import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  attendance: int("attendance").notNull(),
  startTime: varchar("startTime", { length: 16 }).notNull(),
  weather: varchar("weather", { length: 80 }).notNull(),
  temperatureF: int("temperatureF").notNull(),
  humidity: int("humidity").notNull(),
  crowdDensity: int("crowdDensity").notNull(),
  heatIndex: int("heatIndex").notNull(),
  trafficCongestion: int("trafficCongestion").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["green", "yellow", "red"]).notNull(),
  heatRisk: mysqlEnum("heatRisk", ["green", "yellow", "red"]).notNull(),
  trafficRisk: mysqlEnum("trafficRisk", ["green", "yellow", "red"]).notNull(),
  crowdRisk: mysqlEnum("crowdRisk", ["green", "yellow", "red"]).notNull(),
  carbonSavedTons: int("carbonSavedTons").notNull(),
  minutesSaved: int("minutesSaved").notNull(),
  recommendations: text("recommendations").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;
