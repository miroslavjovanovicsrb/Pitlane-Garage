import { describe, expect, it } from "vitest";
import { vehicleSchema } from "@/lib/vehicles";

const base = { brand: "Ferrari", model: "F40", year: "1987", category: "Classic", engine: "V8", horsepower: "471", color: "Red", description: "", image_url: "" };

describe("vehicle form rules", () => {
  it("accepts a valid vehicle", () => expect(vehicleSchema.safeParse(base).success).toBe(true));
  it("rejects a category outside the five allowed", () => expect(vehicleSchema.safeParse({ ...base, category: "Truck" }).success).toBe(false));
  it("rejects a non-numeric year", () => expect(vehicleSchema.safeParse({ ...base, year: "abc" }).success).toBe(false));
  it("rejects zero horsepower", () => expect(vehicleSchema.safeParse({ ...base, horsepower: "0" }).success).toBe(false));
  it("rejects an invalid image URL", () => expect(vehicleSchema.safeParse({ ...base, image_url: "nope" }).success).toBe(false));
});
