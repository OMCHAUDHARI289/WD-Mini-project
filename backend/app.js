import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import blogs from "./routes/blogs.js";

const app = express();

app.use(helmet());

app.use(express.json({ limit: "100kb" }));

app.use(cookieParser());

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  // All browser mutations must come through our same-origin frontend.
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    (req.get("X-Requested-With") !== "SmartBlog" ||
      req.get("Sec-Fetch-Site") === "cross-site")
  )
    return res.status(403).json({ message: "Request origin not allowed." });
  next();
});

app.get("/api/health", (req, res) =>
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
  }),
);

app.use("/api/auth", auth);

app.use("/api/blogs", blogs);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

app.use((err, req, res, next) => {
  if (err.code === 11000)
    return res
      .status(409)
      .json({ message: "An account with this email already exists." });
  if (err.name === "ValidationError" || err.type === "entity.parse.failed")
    return res.status(400).json({ message: "Invalid request data." });
  if (err.type === "entity.too.large")
    return res.status(413).json({ message: "Request is too large." });
  console.error("Request failed:", err.name);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

export default app;
