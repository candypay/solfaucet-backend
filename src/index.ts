import express, { Application, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

import { router } from "@/router";

const app: Application = express();

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "up",
  });
});

app.use(express.json());
app.use(cors({
  origin: 'https://solfaucet.fun/',
  methods: ['GET', 'POST'],
}));
app.use(express.urlencoded({ extended: false }));
app.use("/api", router);

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`running at port ${port}`);
});
