import { Request, Response } from "express";
import {
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
  SendTransactionError,
} from "@solana/web3.js";

import { connection, prisma, payer, env } from "@/helpers";

export const airdropHandler = async (req: Request, res: Response) => {
  const { wallet_address } = req.body;
  const ip = env.isDevelopment
    ? "127.0.0.1"
    : (req.headers["x-forwarded-for"] as string);

  console.log(ip);

  if (!wallet_address) {
    return res.status(400).json({
      error: "missing wallet address",
    });
  }

  try {
    const user = new PublicKey(wallet_address);
    const balance = await connection.getBalance(user);
    const rentExempt = await connection.getMinimumBalanceForRentExemption(0);

    let metadata = await prisma.users.findUnique({
      where: {
        ip,
      },
    });

    if (!metadata) {
      metadata = await prisma.users.create({
        data: {
          ip,
        },
      });
    }


  

    if (
      metadata.last_request !== null &&
      Date.now() - metadata!.last_request.getTime() < 24 * 60 * 60 * 1000
    ) {
      return res.status(429).json({
        error: "try again after 24 hrs",
      });
    }

    if (balance >= 0.000015) {
      return res.status(403).json({
        error: "forbidden",
      });
    } else {
      const amount =
        balance < rentExempt ? rentExempt + 0.000015 * LAMPORTS_PER_SOL : 0.000015 * LAMPORTS_PER_SOL;

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: user,
        lamports: amount,
      });

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = payer.publicKey;
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer],
        {
          commitment: "confirmed",
        }
      );

      res.status(200).json({
        signature,
      });

      await prisma.users.update({
        where: {
          ip,
        },
        data: {
          last_request: new Date(),
        },
      });

      await prisma.transactions.create({
        data: {
          signature,
          amount: amount,
          wallet_address: user.toString(),
          user_ip: ip,
          timestamp: new Date(),
        },
      });
    }
  } catch (err) {
    console.log(err);

    if (err instanceof SendTransactionError) {
      return res.status(500).json({
        message: "internal server error",
        error: err.message,
      });
    }

    return res.status(500).json({
      message: "internal server error",
      error: "unknown error",
    });
  }
};
