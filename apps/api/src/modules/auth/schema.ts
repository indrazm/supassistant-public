import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validates the JSON body and replies with the API's `{ message }` error
 * shape (400) instead of the raw Zod error, so clients can show it directly.
 */
export const jsonValidator = <S extends z.ZodType>(schema: S) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request body";
      return c.json({ message }, 400);
    }
  });
