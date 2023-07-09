import express, { Application, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

import { router } from "@/router";

const app: Application = express();
const allowedOrigins = ['https://solfaucet.fun/'];

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "up",
  });
});

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) { 
    return res.status(403).json({
      "error": "Access denied"
     })
  }
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    return res.status(403).json({
      error: 'Access denied. Only requests from your frontend are allowed.'
    });
  }

  // You can modify other CORS headers and options as needed
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  // Allow preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
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
