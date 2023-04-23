import { Router } from "express";

import { airdropHandler, getPastTransactionsHandler } from "@/controllers";

const router = Router();

router.post("/airdrop", airdropHandler);
router.get("/transactions", getPastTransactionsHandler);

export { router };
