import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import batchRoutes from "./routes/batchRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS configuration: allow Next.js app and common dev ports
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
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
