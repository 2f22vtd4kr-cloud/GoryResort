import { Router, type IRouter } from "express";
import healthRouter from "./health";
import simulateRouter from "./simulate";
import improveRouter from "./improve";
import applyRouter from "./apply";

const router: IRouter = Router();

router.use(healthRouter);
router.use(simulateRouter);
router.use(improveRouter);
router.use(applyRouter);

export default router;
