import { createTRPCRouter } from "~/server/api/trpc";
import { token } from "~/server/api/routers/token";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  token: token,
});

// export type definition of API
export type AppRouter = typeof appRouter;
