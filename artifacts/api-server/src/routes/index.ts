import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import topicsRouter from "./topics";
import patternsRouter from "./patterns";
import discussRouter from "./discuss";
import matchingRouter from "./matching";
import sessionsRouter from "./sessions";
import achievementsRouter from "./achievements";
import iceRouter from "./ice";
import friendsRouter from "./friends";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(topicsRouter);
router.use(patternsRouter);
router.use(discussRouter);
router.use(matchingRouter);
router.use(sessionsRouter);
router.use(achievementsRouter);
router.use(iceRouter);
router.use(friendsRouter);
router.use(messagesRouter);
router.use(notificationsRouter);

export default router;
