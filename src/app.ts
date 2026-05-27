import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler.ts";
import userRoutes from "./modules/user/user.routes.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use("/users", userRoutes);
app.use(errorHandler);

export default app;
