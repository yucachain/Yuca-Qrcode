import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { createBatchSchema, updateBatchSchema } from "../utils/validation";

export const createBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = createBatchSchema.parse(req.body);

    // Check if batch already exists by ID or consignmentId
    const existing = await prisma.cassavaBatch.findFirst({
      where: {
        OR: [
          { id: validated.id },
          { consignmentId: validated.consignmentId },
        ],
      },
    });

    if (existing) {
      // Upsert/update if it already exists with same ID
      if (existing.id === validated.id) {
        const updated = await prisma.cassavaBatch.update({
          where: { id: validated.id },
          data: validated,
        });
        return res.status(200).json({
          success: true,
          message: "Batch updated successfully",
          data: updated,
        });
      }
      return res.status(409).json({
        success: false,
        message: `Consignment ID ${validated.consignmentId} is already registered.`,
      });
    }

    const batch = await prisma.cassavaBatch.create({
      data: validated,
    });

    return res.status(201).json({
      success: true,
      message: "Batch registered successfully",
      data: batch,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllBatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, variety, limit = "50", offset = "0" } = req.query;

    const where: any = {};

    if (variety && typeof variety === "string") {
      where.variety = { contains: variety };
    }

    if (search && typeof search === "string") {
      where.OR = [
        { id: { contains: search } },
        { consignmentId: { contains: search } },
        { companyName: { contains: search } },
        { variety: { contains: search } },
        { hubLocation: { contains: search } },
      ];
    }

    const take = Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 100);
    const skip = Math.max(parseInt(offset as string, 10) || 0, 0);

    const [batches, total] = await Promise.all([
      prisma.cassavaBatch.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.cassavaBatch.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: batches,
      meta: {
        total,
        limit: take,
        offset: skip,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getBatchById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const batch = await prisma.cassavaBatch.findFirst({
      where: {
        OR: [
          { id },
          { consignmentId: id },
        ],
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: `Cassava batch '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBatchByConsignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { consignmentId } = req.params;

    const batch = await prisma.cassavaBatch.findUnique({
      where: { consignmentId },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: `Cassava batch with consignment '${consignmentId}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validated = updateBatchSchema.parse(req.body);

    const updated = await prisma.cassavaBatch.update({
      where: { id },
      data: validated,
    });

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.cassavaBatch.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `Batch '${id}' deleted successfully`,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBatchStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    interface BatchSummaryItem {
      weight: number;
      moistureContent: number;
      cyanideContent: number;
      variety: string;
    }

    const all: BatchSummaryItem[] = await prisma.cassavaBatch.findMany({
      select: {
        weight: true,
        moistureContent: true,
        cyanideContent: true,
        variety: true,
      },
    });

    const total = all.length;
    const totalWeight = all.reduce((acc: number, b: BatchSummaryItem) => acc + (b.weight || 0), 0);
    const avgMoisture = total > 0 ? (all.reduce((acc: number, b: BatchSummaryItem) => acc + b.moistureContent, 0) / total).toFixed(2) : 0;
    const avgCyanide = total > 0 ? (all.reduce((acc: number, b: BatchSummaryItem) => acc + b.cyanideContent, 0) / total).toFixed(2) : 0;

    const varietyCounts: Record<string, number> = {};
    all.forEach((b: BatchSummaryItem) => {
      varietyCounts[b.variety] = (varietyCounts[b.variety] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalBatches: total,
        totalWeightKg: totalWeight,
        averageMoisturePct: Number(avgMoisture),
        averageCyanidePpm: Number(avgCyanide),
        varietyDistribution: varietyCounts,
      },
    });
  } catch (error) {
    return next(error);
  }
};
