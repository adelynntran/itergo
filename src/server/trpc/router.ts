import { router } from "./init";
import { boardsRouter } from "./routers/boards";
import { pinsRouter } from "./routers/pins";
import { commentsRouter } from "./routers/comments";

export const appRouter = router({
  boards: boardsRouter,
  pins: pinsRouter,
  comments: commentsRouter,
});

export type AppRouter = typeof appRouter;
