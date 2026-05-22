import express from "express";
import { authRoute } from "./modules/auth/auth.route";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoute);

export default app;
