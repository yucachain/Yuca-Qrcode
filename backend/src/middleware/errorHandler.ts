import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Backend Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Prisma unique constraint violation code P2002
  if (err?.code === "P2002") {
    const target = err.meta?.target ? ` (${err.meta.target})` : "";
    return res.status(409).json({
      success: false,
      message: `A record with this unique identifier already exists${target}.`,
    });
  }

  const statusCode = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
