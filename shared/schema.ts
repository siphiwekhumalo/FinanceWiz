import { pgTable, serial, text, decimal, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Symbols table
export const symbols = pgTable('symbols', {
  id: serial('id').primaryKey(),
  symbol: text('symbol').notNull().unique(),
  name: text('name').notNull(),
  exchange: text('exchange').notNull(),
  sector: text('sector'),
  marketCap: decimal('market_cap', { precision: 15, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Chart data table for OHLCV data
export const chartData = pgTable('chart_data', {
  id: serial('id').primaryKey(),
  symbolId: integer('symbol_id').references(() => symbols.id),
  timeframe: text('timeframe').notNull(), // '1m', '5m', '15m', '1h', '4h', '1d', '1w', '1y'
  timestamp: timestamp('timestamp').notNull(),
  open: decimal('open', { precision: 10, scale: 4 }).notNull(),
  high: decimal('high', { precision: 10, scale: 4 }).notNull(),
  low: decimal('low', { precision: 10, scale: 4 }).notNull(),
  close: decimal('close', { precision: 10, scale: 4 }).notNull(),
  volume: decimal('volume', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Technical indicators table
export const indicators = pgTable('indicators', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'sma', 'ema', 'rsi', 'macd', 'bollinger', etc.
  parameters: jsonb('parameters').notNull(), // Flexible parameters like period, deviation, etc.
  color: text('color').notNull().default('#22c55e'),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// User watchlists
export const watchlists = pgTable('watchlists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(), // For future user management
  symbolIds: jsonb('symbol_ids').notNull(), // Array of symbol IDs
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// White label configurations
export const whiteLabelConfigs = pgTable('white_label_configs', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  tagline: text('tagline'),
  logo: text('logo'), // URL or base64 encoded logo
  primaryColor: text('primary_color').notNull().default('#22c55e'),
  secondaryColor: text('secondary_color').notNull().default('#ef4444'),
  theme: text('theme').notNull().default('dark'), // 'light' | 'dark'
  features: jsonb('features').notNull(), // Feature toggles
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Drawing objects for charts
export const drawingObjects = pgTable('drawing_objects', {
  id: serial('id').primaryKey(),
  symbolId: integer('symbol_id').references(() => symbols.id),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'trendline', 'fibonacci', 'rectangle', 'text'
  points: jsonb('points').notNull(), // Array of coordinate points
  style: jsonb('style').notNull(), // Color, line width, etc.
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relations
export const symbolsRelations = relations(symbols, ({ many }) => ({
  chartData: many(chartData),
  drawingObjects: many(drawingObjects),
}));

export const chartDataRelations = relations(chartData, ({ one }) => ({
  symbol: one(symbols, {
    fields: [chartData.symbolId],
    references: [symbols.id],
  }),
}));

export const drawingObjectsRelations = relations(drawingObjects, ({ one }) => ({
  symbol: one(symbols, {
    fields: [drawingObjects.symbolId],
    references: [symbols.id],
  }),
}));

// Zod schemas for validation
export const insertSymbolSchema = createInsertSchema(symbols).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectSymbolSchema = createSelectSchema(symbols);

export const insertChartDataSchema = createInsertSchema(chartData).omit({
  id: true,
  createdAt: true,
});

export const selectChartDataSchema = createSelectSchema(chartData);

export const insertIndicatorSchema = createInsertSchema(indicators).omit({
  id: true,
  createdAt: true,
});

export const selectIndicatorSchema = createSelectSchema(indicators);

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectWatchlistSchema = createSelectSchema(watchlists);

export const insertWhiteLabelConfigSchema = createInsertSchema(whiteLabelConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectWhiteLabelConfigSchema = createSelectSchema(whiteLabelConfigs);

export const insertDrawingObjectSchema = createInsertSchema(drawingObjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectDrawingObjectSchema = createSelectSchema(drawingObjects);

// Type exports
export type Symbol = typeof symbols.$inferSelect;
export type InsertSymbol = z.infer<typeof insertSymbolSchema>;

export type ChartData = typeof chartData.$inferSelect;
export type InsertChartData = z.infer<typeof insertChartDataSchema>;

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;

export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type WhiteLabelConfig = typeof whiteLabelConfigs.$inferSelect;
export type InsertWhiteLabelConfig = z.infer<typeof insertWhiteLabelConfigSchema>;

export type DrawingObject = typeof drawingObjects.$inferSelect;
export type InsertDrawingObject = z.infer<typeof insertDrawingObjectSchema>;