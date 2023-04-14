import { Request, Response } from "express";
import {
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
  SendTransactionError,
} from "@solana/web3.js";

import { connection, database, payer, env } from "@/helpers";

export const airdropHandler = async (req: Request, res: Response) => {
  const { wallet_address } = req.body;
  const ip = env.isDevelopment
    ? "127.0.0.1"
    : (req.headers["x-forwarded-for"] as string);

  if (!wallet_address) {
    return res.status(400).json({
      error: "missing wallet address",
    });
  }

  try {
    const user = new PublicKey(wallet_address);
    const balance = await connection.getBalance(user);
    const rentExempt = await connection.getMinimumBalanceForRentExemption(0);

    const metadata = await database
      .selectFrom("users")
      .where("ip", "=", ip)
      .selectAll()
      .execute();

    if (metadata.length === 0) {
      await database
        .insertInto("users")
        .values({
          ip: env.isDevelopment ? "127.0.0.1" : ip,
        })
        .execute();
    }

    if (!(balance >= rentExempt && balance >= 0.000015)) {
      return res.status(403).json({
        error: "forbidden",
      });
    } else {
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: user,
        lamports: 0.000015 * LAMPORTS_PER_SOL,
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

      await database
        .insertInto("transactions")
        .values({
          signature,
          amount: 0.000015 * LAMPORTS_PER_SOL,
          wallet_address: user.toString(),
          user_ip: env.isDevelopment ? "127.0.0.1" : ip,
        })
        .execute();
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
