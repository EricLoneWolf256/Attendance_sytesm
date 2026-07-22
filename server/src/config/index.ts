import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseDurationToSeconds(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60;
  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return num;
    case "m": return num * 60;
    case "h": return num * 3600;
    case "d": return num * 86400;
    default: return 15 * 60;
  }
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",

  jwt: {
    secret: requireEnv("JWT_SECRET"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    accessExpiresInSeconds: parseDurationToSeconds(process.env.JWT_EXPIRES_IN || "15m"),
    refreshExpiresInSeconds: parseDurationToSeconds(process.env.JWT_REFRESH_EXPIRES_IN || "7d"),
  },

  bcrypt: {
    saltRounds: 10,
  },

  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};
