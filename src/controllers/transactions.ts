import { Request, Response } from "express";

import { prisma } from "@/helpers";

export const getPastTransactionsHandler = async (
  _req: Request,
  res: Response
) => {
  try {
    const transactions = await prisma.transactions.findMany();

    if (transactions.length === 0) {
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
