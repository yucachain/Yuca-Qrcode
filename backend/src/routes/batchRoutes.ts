import { Router } from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  getBatchByConsignment,
  updateBatch,
  deleteBatch,
  getBatchStats,
} from "../controllers/batchController";

const router = Router();

// Stats route
router.get("/stats", getBatchStats);

// Batch CRUD
router.post("/", createBatch);
router.get("/", getAllBatches);
router.get("/consignment/:consignmentId", getBatchByConsignment);
router.get("/:id", getBatchById);
router.patch("/:id", updateBatch);
router.put("/:id", updateBatch);
router.delete("/:id", deleteBatch);

export default router;
