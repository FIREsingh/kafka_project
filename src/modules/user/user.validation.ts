import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    email: z.email("Invalid email address").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const userIdParamSchema = z.object({
  id: z.string().trim().min(1, "User id is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
