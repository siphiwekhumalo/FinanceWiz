import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const symbols = pgTable("symbols", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  exchange: text("exchange"),
  sector: text("sector"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chartData = pgTable("chart_data", {
  id: serial("id").primaryKey(),
  symbolId: integer("symbol_id").references(() => symbols.id).notNull(),
  timeframe: text("timeframe").notNull(), // 1m, 5m, 1h, 1d, 1w
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 12, scale: 4 }).notNull(),
  high: decimal("high", { precision: 12, scale: 4 }).notNull(),
  low: decimal("low", { precision: 12, scale: 4 }).notNull(),
  close: decimal("close", { precision: 12, scale: 4 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 2 }).notNull(),
});

export const indicators = pgTable("indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // MA, RSI, MACD, etc.
  parameters: jsonb("parameters"),
  isActive: boolean("is_active").default(true),
});

export const whiteLabels = pgTable("white_labels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#3B82F6"),
  secondaryColor: text("secondary_color").default("#1E293B"),
  theme: text("theme").default("dark"),
  customCss: text("custom_css"),
  features: jsonb("features"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  symbolId: integer("symbol_id").references(() => symbols.id).notNull(),
  price: decimal("price", { precision: 12, scale: 4 }).notNull(),
  size: decimal("size", { precision: 15, scale: 2 }).notNull(),
  side: text("side").notNull(), // buy, sell
  timestamp: timestamp("timestamp").defaultNow(),
});

export const orderBook = pgTable("order_book", {
  id: serial("id").primaryKey(),
  symbolId: integer("symbol_id").references(() => symbols.id).notNull(),
  price: decimal("price", { precision: 12, scale: 4 }).notNull(),
  size: decimal("size", { precision: 15, scale: 2 }).notNull(),
  side: text("side").notNull(), // buy, sell
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertSymbolSchema = createInsertSchema(symbols).pick({
  symbol: true,
  name: true,
  exchange: true,
  sector: true,
});

export const insertChartDataSchema = createInsertSchema(chartData).pick({
  symbolId: true,
  timeframe: true,
  timestamp: true,
  open: true,
  high: true,
  low: true,
  close: true,
  volume: true,
});

export const insertIndicatorSchema = createInsertSchema(indicators).pick({
  name: true,
  type: true,
  parameters: true,
});

export const insertWhiteLabelSchema = createInsertSchema(whiteLabels).pick({
  name: true,
  logo: true,
  primaryColor: true,
  secondaryColor: true,
  theme: true,
  customCss: true,
  features: true,
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  symbolId: true,
  price: true,
  size: true,
  side: true,
});

export const insertOrderBookSchema = createInsertSchema(orderBook).pick({
  symbolId: true,
  price: true,
  size: true,
  side: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSymbol = z.infer<typeof insertSymbolSchema>;
export type Symbol = typeof symbols.$inferSelect;

export type InsertChartData = z.infer<typeof insertChartDataSchema>;
export type ChartData = typeof chartData.$inferSelect;

export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;
export type Indicator = typeof indicators.$inferSelect;

export type InsertWhiteLabel = z.infer<typeof insertWhiteLabelSchema>;
export type WhiteLabel = typeof whiteLabels.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export type InsertOrderBook = z.infer<typeof insertOrderBookSchema>;
export type OrderBook = typeof orderBook.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
