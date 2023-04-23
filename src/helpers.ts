import { PrismaClient } from "@prisma/client";
import { Connection, Keypair } from "@solana/web3.js";
import { cleanEnv, url, str } from "envalid";
import base58 from "bs58";

export const env = cleanEnv(process.env, {
  NODE_ENV: str(),
  RPC_URL: url(),
  DATABASE_URL: str(),
  PRIVATE_KEY: str(),
  HELIUS_API_KEY: str(),
});
export const connection = new Connection(env.RPC_URL);
export const payer = Keypair.fromSecretKey(base58.decode(env.PRIVATE_KEY));
export const prisma = new PrismaClient();
