import express, { Request, Response } from "express";
import cors from "cors";
import reviewsRouter from "./routes/reviews";
import { PORT } from "./config";
import { initDb } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

// ensure db exists
initDb().catch(err => {
  console.error("DB init error", err);
  process.exit(1);
});

app.use("/api/reviews", reviewsRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
