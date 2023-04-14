import { Router } from "express";

import { airdropHandler, getPastTransactionsHandler } from "@/controllers";
import { ratelimiter } from "@/middlewares";

const router = Router();

router.post("/airdrop", [ratelimiter], airdropHandler);
router.get("/transactions", getPastTransactionsHandler);

export { router };
