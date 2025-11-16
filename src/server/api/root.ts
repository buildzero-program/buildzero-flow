import { z } from "zod";
import { createCallerFactory, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Dummy procedure to satisfy tRPC types
  health: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => {
      return {
        status: "ok",
        message: input.text ?? "BuildZero Flow is running"
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
