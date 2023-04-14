import { Request, Response } from "express";

import { database, env } from "@/helpers";

export const getPastTransactionsHandler = async (
  req: Request,
  res: Response
) => {
  const ip = env.isDevelopment
    ? "127.0.0.1"
    : (req.headers["x-forwarded-for"] as string);

  try {
    const transactions = await database
      .selectFrom("transactions")
      .where("user_ip", "=", ip)
      .select(["amount", "signature", "timestamp", "wallet_address"])
      .execute();

    if (!transactions) {
      return res.status(404).json({
        error: "no transactions were found",
      });
    }

    return res.status(200).json({
      transactions,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "internal server error",
      error: "an error occured while fetching the past transactions",
    });
  }
};
