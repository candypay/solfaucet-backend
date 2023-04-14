import express, { Application, Request, Response } from "express";
import "dotenv/config";

import { router } from "@/router";
import { ratelimiter } from "@/middlewares";

const app: Application = express();

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "up",
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router);
app.use(ratelimiter);

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`running at port ${port}`);
});
