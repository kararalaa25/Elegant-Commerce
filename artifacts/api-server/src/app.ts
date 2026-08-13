import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

// Middleware to replace pino-http logging and prevent Vercel build crashes
app.use((req, res, next) => next());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
