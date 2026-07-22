const ts = () => new Date().toISOString();

export const socketLogger = {
  info(message: string): void {
    console.log(`[SOCKET ${ts()}] ${message}`);
  },
  warn(message: string): void {
    console.warn(`[SOCKET ${ts()}] WARN: ${message}`);
  },
  error(message: string, err?: unknown): void {
    console.error(`[SOCKET ${ts()}] ERROR: ${message}`, err ?? "");
  },
};
