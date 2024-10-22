import { config } from "@/app/config";
import { createLogger } from "@/lib/auth/logger";

export const logger = createLogger({ level: config.logLevel });
