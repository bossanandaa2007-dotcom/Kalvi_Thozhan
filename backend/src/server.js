import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import contentRoutes from "./routes/content.routes.js";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRoutes);
  app.use("/api", contentRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
          ? String(err.message)
          : "Unknown error";

    res.status(500).json({
      error: "Internal server error",
      message,
    });
  });

  return app;
}
