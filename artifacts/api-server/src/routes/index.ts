import { Router, type IRouter } from "express";
import healthRouter from "./health";
import simulateRouter from "./simulate";
import improveRouter from "./improve";

const router: IRouter = Router();

router.use(healthRouter);
router.use(simulateRouter);
router.use(improveRouter);

export default router;
