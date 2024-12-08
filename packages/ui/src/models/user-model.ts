import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  name: z.string({ required_error: 'Name is required.' }),
  toursCompleted: z.array(z.enum(['application-overview', 'agents-overview'])),
  email: z
    .string({ required_error: 'Email is required.' })
    .email({ message: 'Invalid email address.' }),
});
export type User = z.infer<typeof userSchema>;

export const createUserSchema = userSchema
  .pick({
    email: true,
    name: true,
  })
  .extend({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' }),
  });
export type CreateUserType = z.infer<typeof createUserSchema>;

export const updateUserSchema = userSchema
  .pick({
    name: true,
    toursCompleted: true,
  })
  .partial();
export type UpdateUserType = z.infer<typeof updateUserSchema>;
