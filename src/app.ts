import express from "express";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issue/issue.route";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("DevPulse - Assignment");
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

export default app;
