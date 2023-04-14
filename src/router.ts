import { Router } from "express";

import { airdropHandler } from "@/controllers";
import { ratelimiter } from "@/middlewares";

const router = Router();

router.use(ratelimiter);

router.post("/airdrop", airdropHandler);

export { router };
