import { db } from "./db";
import { symbols, indicators, whiteLabelConfigs } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Check if symbols already exist
    const existingSymbols = await db.select().from(symbols).limit(1);
    if (existingSymbols.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Seed symbols
    const defaultSymbols = [
      { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Automotive" },
      { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "E-commerce" },
      { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", sector: "Technology" },
      { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", sector: "Entertainment" },
    ];

    await db.insert(symbols).values(defaultSymbols);
    console.log('Symbols seeded successfully');

    // Seed default indicators
    const defaultIndicators = [
      { 
        name: "Moving Average (20)", 
        type: "SMA", 
        parameters: { period: 20 },
        color: "#22c55e"
      },
      { 
        name: "RSI (14)", 
        type: "RSI", 
        parameters: { period: 14 },
        color: "#3b82f6"
      },
      { 
        name: "MACD", 
        type: "MACD", 
        parameters: { fast: 12, slow: 26, signal: 9 },
        color: "#ef4444"
      },
      { 
        name: "Bollinger Bands", 
        type: "BB", 
        parameters: { period: 20, deviation: 2 },
        color: "#8b5cf6"
      },
      { 
        name: "EMA (50)", 
        type: "EMA", 
        parameters: { period: 50 },
        color: "#f59e0b"
      },
    ];

    await db.insert(indicators).values(defaultIndicators);
    console.log('Indicators seeded successfully');

    // Seed default white label configuration
    const defaultWhiteLabelConfig = {
      companyName: "FinanceChart Pro",
      tagline: "Professional Trading Charts",
      primaryColor: "#22c55e",
      secondaryColor: "#ef4444",
      theme: "dark" as const,
      features: {
        showToolbar: true,
        showIndicators: true,
        showVolume: true,
        showComparison: true,
        showDrawingTools: true
      },
      isActive: true
    };

    await db.insert(whiteLabelConfigs).values(defaultWhiteLabelConfig);
    console.log('White label configuration seeded successfully');

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}