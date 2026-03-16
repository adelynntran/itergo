import "server-only";
import { createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/router";

export const createCaller = createCallerFactory(appRouter);
