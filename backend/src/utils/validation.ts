import { z } from "zod";

export const createBatchSchema = z.object({
  id: z.string().min(3, "Batch ID is required"),
  consignmentId: z.string().min(3, "Consignment ID is required"),
  companyName: z.string().default("YucaChain"),
  variety: z.string().min(1, "Variety is required"),
  moistureContent: z.number().min(0, "Moisture content must be non-negative"),
  cyanideContent: z.number().min(0, "Cyanide content must be non-negative"),
  weight: z.number().positive("Weight must be greater than zero"),
  weightUnit: z.enum(["kg", "tonnes", "bags"]).default("kg"),
  averageWeight: z.number().positive("Average weight must be greater than zero"),
  averageWeightUnit: z.enum(["kg", "g"]).default("kg"),
  entryDate: z.string().min(1, "Entry date is required"),
  exitDate: z.string().min(1, "Exit date is required"),
  hubLocation: z.string().min(1, "Hub location is required"),
  remark: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateBatchSchema = createBatchSchema.partial().omit({ id: true });

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
