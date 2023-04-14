import { Connection, Keypair } from "@solana/web3.js";
import { Users, Transactions } from "@prisma/client";
import { PlanetScaleDialect } from "@candypay/kysely-planetscale";
import { cleanEnv, url, str } from "envalid";
import { Kysely } from "kysely";
import base58 from "bs58";

export interface Database {
  users: Users;
  transactions: Transactions;
}

export const env = cleanEnv(process.env, {
  NODE_ENV: str(),
  RPC_URL: url(),
  DATABASE_URL: str(),
  PRIVATE_KEY: str(),
  HELIUS_API_KEY: str(),
});
export const connection = new Connection(env.RPC_URL);
export const payer = Keypair.fromSecretKey(base58.decode(env.PRIVATE_KEY));
export const database = new Kysely<Database>({
  dialect: new PlanetScaleDialect({
    url: env.DATABASE_URL,
  }),
});
