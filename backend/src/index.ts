import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import batchRoutes from "./routes/batchRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS configuration: allow Next.js app, Vercel deployments, and public verification
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow direct requests, configured frontend, vercel domains, localhost, or any client
      if (!requestOrigin) return callback(null, true);
      if (
        FRONTEND_URL === "*" ||
        requestOrigin === FRONTEND_URL ||
        requestOrigin.endsWith(".vercel.app") ||
        requestOrigin.includes("localhost") ||
        requestOrigin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "YucaChain Traceability API",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/batches", batchRoutes);

// Centralized error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🌿 YucaChain Backend Server running at http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/batches`);
});

export default app;
