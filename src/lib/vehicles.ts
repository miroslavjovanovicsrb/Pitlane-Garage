import { z } from "zod";

export const CATEGORIES = ["Race Car", "Street Car", "Classic", "Motorcycle", "Prototype"] as const;
const maxYear = new Date().getFullYear() + 1;

export const vehicleSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(80),
  year: z.coerce.number().int("Whole year").min(1885, "Year must be 1885 or later").max(maxYear, `Year must be ${maxYear} or earlier`),
  category: z.enum(CATEGORIES, { message: "Pick a category" }),
  engine: z.string().trim().min(1, "Engine is required").max(100),
  horsepower: z.coerce.number().int("Whole number").min(1, "Must be at least 1").max(10000, "Max 10000"),
  color: z.string().trim().min(1, "Color is required").max(40),
  description: z.string().trim().max(2000, "Max 2000 characters"),
  image_url: z.union([z.literal(""), z.string().trim().url("Must be a valid URL").max(500)]),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
